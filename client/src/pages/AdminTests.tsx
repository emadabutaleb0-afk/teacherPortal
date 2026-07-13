import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { mockTests, mockQuestions, availableSubjects, availableGrades, mockPlatformSettings } from '@/lib/mockData';
import { saveTestToDB, deleteTestFromDB } from '@/lib/dbSync';
import { Plus, Edit2, Trash2, Copy, AlertCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTests() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  // Load custom tests from localStorage and base mockTests
  const [tests, setTests] = useState(() => {
    const stored = localStorage.getItem('edupath_custom_tests');
    const custom = stored ? JSON.parse(stored) : [];
    const base = mockTests.filter(t => !t.isPlacementTest && (t.id.startsWith('test-0') || t.id.startsWith('test-gen')));
    return [...custom, ...base];
  });
  const [isOpen, setIsOpen] = useState(false);

  const getDefaults = () => {
    const stored = localStorage.getItem('edupath_test_defaults');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return { duration: 15, questionCount: 20 };
  };

  const defaults = getDefaults();

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [duration, setDuration] = useState(defaults.duration.toString());
  const [passingScore, setPassingScore] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');

  // Default configuration states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [defaultDuration, setDefaultDuration] = useState(() => getDefaults().duration.toString());
  const [defaultQuestionCount, setDefaultQuestionCount] = useState(() => getDefaults().questionCount.toString());

  const handleSaveDefaults = () => {
    const durVal = parseInt(defaultDuration);
    const countVal = parseInt(defaultQuestionCount);
    if (isNaN(durVal) || isNaN(countVal) || durVal <= 0 || countVal <= 0) {
      toast.error('Please enter valid positive numbers');
      return;
    }
    localStorage.setItem('edupath_test_defaults', JSON.stringify({
      duration: durVal,
      questionCount: countVal
    }));
    
    // Sync platform settings
    const storedPlatform = localStorage.getItem('edupath_platform_settings');
    const platform = storedPlatform ? JSON.parse(storedPlatform) : { ...mockPlatformSettings };
    platform.testDuration = durVal;
    platform.testQuestionCount = countVal;
    localStorage.setItem('edupath_platform_settings', JSON.stringify(platform));
    Object.assign(mockPlatformSettings, platform);

    toast.success('Defaults updated successfully!');
    setIsSettingsOpen(false);
  };

  // Auto-check matching questions on subject selection (Create Mode only)
  useEffect(() => {
    if (editingTestId || !subject) return;
    const currentDefaults = getDefaults();
    const matchingQuestions = mockQuestions
      .filter(q => q.subject.toLowerCase() === subject.toLowerCase())
      .slice(0, currentDefaults.questionCount)
      .map(q => q.id);
    setSelectedQuestionIds(matchingQuestions);
  }, [subject, editingTestId]);

  // Filter and Pagination States
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Helper to extract timestamp from test ID for sorting newest first
  const getTestTimestamp = (test: any) => {
    if (test.createdAt) return new Date(test.createdAt).getTime();
    const numericPart = test.id.replace(/[^\d]/g, '');
    if (numericPart.length > 5) {
      return parseInt(numericPart);
    }
    return parseInt(numericPart) || 0;
  };

  // Hydrate tests on mount to ensure we have the latest database records
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch('/api/tests');
        if (res.ok) {
          const testsData = await res.json();
          const stored = localStorage.getItem('edupath_custom_tests');
          const custom = stored ? JSON.parse(stored) : [];
          const base = testsData.filter((t: any) => !t.isPlacementTest && (t.id.startsWith('test-0') || t.id.startsWith('test-gen')));
          setTests([...custom, ...base]);
        }
      } catch (e) {
        console.error('Failed to fetch tests on mount', e);
      }
    };
    fetchTests();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSubject, filterGrade]);

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const subjects = availableSubjects;
  const grades = availableGrades;

  const parseGradeNum = (val: any): number => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return val;
    const parsed = parseInt(val.toString().replace(/[^\d]/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Filter and sort tests (newest created first)
  const filteredTests = tests
    .filter(t => {
      const matchesSubject = filterSubject === 'all' || t.subject === filterSubject;
      const matchesGrade = filterGrade === 'all' || parseGradeNum(t.gradeLevel) === parseGradeNum(filterGrade);
      return matchesSubject && matchesGrade;
    })
    .sort((a, b) => getTestTimestamp(b) - getTestTimestamp(a));

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const paginatedTests = filteredTests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id: string) => {
    const updated = tests.filter(t => t.id !== id);
    setTests(updated);
    
    // Save to server DB and sync in-memory
    await deleteTestFromDB(id);
    
    // Save to localStorage fallback
    const custom = updated.filter(t => !t.id.startsWith('test-0') && !t.id.startsWith('test-gen'));
    localStorage.setItem('edupath_custom_tests', JSON.stringify(custom));
    
    toast.success('Test deleted successfully');
  };

  const resetForm = () => {
    const currentDefaults = getDefaults();
    setTitle('');
    setDescription('');
    setSubject('');
    setGradeLevel('');
    setDuration(currentDefaults.duration.toString());
    setPassingScore('');
    setDifficulty('medium');
    setSelectedQuestionIds([]);
    setScheduledAt('');
    setEditingTestId(null);
  };

  const handleEditClick = (test: any) => {
    setEditingTestId(test.id);
    setTitle(test.title);
    setDescription(test.description);
    setSubject(test.subject);
    setGradeLevel(test.gradeLevel?.toString() || '');
    setDuration(test.duration.toString());
    setPassingScore(test.passingScore.toString());
    setDifficulty(test.difficulty);
    setSelectedQuestionIds(test.questions ? test.questions.map((q: any) => q.id) : []);
    setScheduledAt(test.scheduledAt || '');
    setIsOpen(true);
  };

  const handleCreateTest = async () => {
    if (!title || !description || !subject || !gradeLevel || !duration || !passingScore) {
      toast.error('Please fill in all fields');
      return;
    }

    // Retrieve selected questions or fallback to matching subject questions
    const currentDefaults = getDefaults();
    const chosenQuestions = mockQuestions.filter(q => selectedQuestionIds.includes(q.id));
    const finalQuestions = chosenQuestions.length > 0
      ? chosenQuestions
      : mockQuestions.filter(q => q.subject.toLowerCase() === subject.toLowerCase()).slice(0, currentDefaults.questionCount);

    let updated = [...tests];

    if (editingTestId) {
      // Edit Mode
      const existing = tests.find(t => t.id === editingTestId);
      const updatedTest = {
        id: editingTestId,
        title,
        description,
        subject,
        gradeLevel: parseInt(gradeLevel),
        totalQuestions: finalQuestions.length,
        duration: parseInt(duration),
        passingScore: parseInt(passingScore),
        difficulty,
        questions: finalQuestions,
        createdAt: existing?.createdAt || new Date().toISOString(),
        scheduledAt: scheduledAt || undefined,
      };
      
      // Update in server DB
      await saveTestToDB(updatedTest);

      updated = tests.map(t => t.id === editingTestId ? updatedTest : t);
      setTests(updated);
      toast.success('Test updated successfully! 🎯');
    } else {
      // Create Mode
      const newTest = {
        id: `test-${Date.now()}`,
        title,
        description,
        subject,
        gradeLevel: parseInt(gradeLevel),
        totalQuestions: finalQuestions.length,
        duration: parseInt(duration),
        passingScore: parseInt(passingScore),
        difficulty,
        questions: finalQuestions,
        createdAt: new Date().toISOString(),
        scheduledAt: scheduledAt || undefined,
      };

      // Create in server DB
      await saveTestToDB(newTest);

      updated = [newTest, ...tests];
      setTests(updated);
      toast.success('Test created successfully! 🚀');
    }

    // Persist custom tests to localStorage fallback
    const custom = updated.filter(t => !t.id.startsWith('test-0') && !t.id.startsWith('test-gen'));
    localStorage.setItem('edupath_custom_tests', JSON.stringify(custom));

    setIsOpen(false);
    resetForm();
  };

  const handleCopyLink = (testId: string) => {
    const link = `${window.location.origin}/test/${testId}`;
    navigator.clipboard.writeText(link);
    toast.success('Test link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8 space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Test Management</h1>
            <p className="text-muted-foreground">{tests.length} active tests</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" title="Configure test defaults">
                  <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Configure Test Defaults</DialogTitle>
                  <DialogDescription>
                    Modify default parameters used for new tests and question auto-selection.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="default-duration">Default Duration (minutes)</Label>
                    <Input
                      id="default-duration"
                      type="number"
                      value={defaultDuration}
                      onChange={(e) => setDefaultDuration(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-question-count">Default Questions Amount</Label>
                    <Input
                      id="default-question-count"
                      type="number"
                      value={defaultQuestionCount}
                      onChange={(e) => setDefaultQuestionCount(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSaveDefaults} className="w-full bg-gradient-to-r from-primary to-primary/80 mt-2">
                    Save Defaults
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isOpen} onOpenChange={(val) => {
              setIsOpen(val);
              if (!val) resetForm();
            }}>
              <Button 
                onClick={() => {
                  resetForm();
                  setIsOpen(true);
                }} 
                className="gap-2 bg-gradient-to-r from-primary to-primary/80"
              >
                <Plus className="w-4 h-4" />
                Create Test
              </Button>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingTestId ? 'Edit Test' : 'Create New Test'}</DialogTitle>
                  <DialogDescription>
                    {editingTestId ? 'Modify test details and manage questions' : 'Set up a new test for students'}
                  </DialogDescription>
                </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-title">Test Title</Label>
                  <Input 
                    id="test-title" 
                    placeholder="e.g., Advanced Calculus" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-desc">Description</Label>
                  <Textarea 
                    id="test-desc" 
                    placeholder="Brief description of the test content and goals..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Grade Level</Label>
                    <Select value={gradeLevel} onValueChange={setGradeLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map(g => (
                          <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-duration">Duration (minutes)</Label>
                    <Input 
                      id="test-duration"
                      type="number" 
                      placeholder="30" 
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="test-pass">Passing Score (%)</Label>
                    <Input 
                      id="test-pass"
                      type="number" 
                      placeholder="60" 
                      value={passingScore}
                      onChange={(e) => setPassingScore(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={difficulty} onValueChange={(val: any) => setDifficulty(val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="test-scheduled">Scheduled Start Time (Optional)</Label>
                    <Input
                      id="test-scheduled"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
                    />
                  </div>
                </div>

                {/* Question Selection List */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center justify-between">
                    <span>Select Questions ({selectedQuestionIds.length} selected)</span>
                    <span className="text-xs text-muted-foreground italic">Add or delete questions below</span>
                  </Label>
                  <div className="border border-border rounded-lg p-3 max-h-[160px] overflow-y-auto space-y-2 bg-secondary/20">
                    {mockQuestions
                      .filter(q => !subject || q.subject.toLowerCase() === subject.toLowerCase())
                      .map(q => {
                        const isChecked = selectedQuestionIds.includes(q.id);
                        return (
                          <div key={q.id} className="flex items-start gap-2.5 text-sm p-1.5 hover:bg-muted/50 rounded transition-colors">
                            <input
                              type="checkbox"
                              id={`q-select-${q.id}`}
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedQuestionIds(selectedQuestionIds.filter(id => id !== q.id));
                                } else {
                                  setSelectedQuestionIds([...selectedQuestionIds, q.id]);
                                }
                              }}
                              className="mt-1 cursor-pointer accent-primary"
                            />
                            <Label htmlFor={`q-select-${q.id}`} className="cursor-pointer flex-1 font-normal text-xs text-foreground leading-relaxed">
                              <span className={`inline-block text-[10px] uppercase px-1.5 py-0.5 rounded font-bold mr-2 ${
                                q.difficulty === 'easy' ? 'bg-success/15 text-success border border-success/20' :
                                q.difficulty === 'medium' ? 'bg-warning/15 text-warning border border-warning/20' :
                                'bg-destructive/15 text-destructive border border-destructive/20'
                              }`}>
                                {q.difficulty}
                              </span>
                              {q.text}
                            </Label>
                          </div>
                        );
                      })}
                    {mockQuestions.filter(q => !subject || q.subject.toLowerCase() === subject.toLowerCase()).length === 0 && (
                      <p className="text-xs text-muted-foreground py-2 text-center">No questions found for the selected subject.</p>
                    )}
                  </div>
                </div>

                <Button onClick={handleCreateTest} className="w-full bg-gradient-to-r from-primary to-primary/80 mt-2">
                  {editingTestId ? 'Save Changes' : 'Create Test'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        </div>

        {/* Filters */}
        {tests.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border">
            <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full">
              <div className="w-full sm:w-[200px] space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filter Subject</Label>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-[200px] space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filter Grade</Label>
                <Select value={filterGrade} onValueChange={setFilterGrade}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {grades.map(g => (
                      <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-xs text-muted-foreground font-semibold bg-secondary/50 px-3 py-1.5 rounded-lg self-end sm:self-center">
              Showing {paginatedTests.length} of {filteredTests.length} exams
            </div>
          </div>
        )}

        {/* Tests Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {paginatedTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-2">
                    <CardTitle>{test.title}</CardTitle>
                    <CardDescription className="mt-1">{test.description}</CardDescription>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 border ${
                    test.difficulty === 'easy'
                      ? 'bg-success/15 text-success border-success/20'
                      : test.difficulty === 'medium'
                      ? 'bg-warning/15 text-warning border-warning/20'
                      : 'bg-destructive/15 text-destructive border-destructive/20'
                  }`}>
                    {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Subject</p>
                    <p className="font-semibold">{test.subject}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Grade</p>
                    <p className="font-semibold">Grade {test.gradeLevel}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Questions</p>
                    <p className="font-semibold">{test.totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Duration</p>
                    <p className="font-semibold">{test.duration} mins</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Passing Score</p>
                    <p className="font-semibold">{test.passingScore}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <p className="font-semibold text-success">Active</p>
                  </div>
                  {test.scheduledAt && (
                    <div className="col-span-2 border-t border-border/40 pt-2 mt-1">
                      <p className="text-muted-foreground text-xs">Scheduled Date & Time</p>
                      <p className="font-semibold text-warning">
                        {new Date(test.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <p className="text-sm font-semibold">Test Link</p>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/test/${test.id}`}
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyLink(test.id)}
                      className="gap-1 flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2 hover:bg-primary/5 hover:text-primary transition-colors"
                    onClick={() => handleEditClick(test)}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
                    onClick={() => handleDelete(test.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3"
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-9 h-9"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3"
            >
              Next
            </Button>
          </div>
        )}

        {tests.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">No tests created yet.</p>
              <Button onClick={() => setIsOpen(true)}>Create Your First Test</Button>
            </CardContent>
          </Card>
        )}

        {tests.length > 0 && filteredTests.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">No exams match your selected filters.</p>
              <Button variant="outline" onClick={() => { setFilterSubject('all'); setFilterGrade('all'); }}>Clear Filters</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
