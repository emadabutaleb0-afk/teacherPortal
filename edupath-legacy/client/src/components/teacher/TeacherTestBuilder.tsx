import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { HelpCircle } from 'lucide-react';
import { Question } from '@/lib/mockData';

interface TeacherTestBuilderProps {
  user: any;
}

export default function TeacherTestBuilder({ user }: TeacherTestBuilderProps) {
  const teacherSubjects = user?.subjects || [];
  const teacherGrade = user?.gradeLevel;

  // Test Configurations States
  const [testTitle, setTestTitle] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [testSubject, setTestSubject] = useState(() => {
    return teacherSubjects.length > 0 ? teacherSubjects[0] : 'Mathematics';
  });
  const [testGrade, setTestGrade] = useState(() => {
    return teacherGrade?.toString() || '8';
  });
  const [testDuration, setTestDuration] = useState('30');
  const [testPassingScore, setTestPassingScore] = useState('70');
  const [testDifficulty, setTestDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [isCreatingTest, setIsCreatingTest] = useState(false);

  // Available Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Sync settings with profile on load
  useEffect(() => {
    if (user) {
      if (teacherSubjects.length > 0) {
        setTestSubject(teacherSubjects[0]);
      }
      if (teacherGrade !== undefined) {
        setTestGrade(teacherGrade.toString());
      }
    }
    fetchQuestions();
  }, [user]);

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      setQuestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Filter matching questions for the builder
  const testBuilderQuestions = questions.filter(q => 
    q.subject === testSubject && q.gradeLevel === parseInt(testGrade)
  );

  const handleCreateTest = async () => {
    if (!testTitle.trim() || !testDesc.trim()) {
      toast.error('Please fill in test title and description');
      return;
    }
    if (selectedQuestionIds.length === 0) {
      toast.error('Please select at least one question for the test');
      return;
    }

    setIsCreatingTest(true);
    const testId = `test-${Date.now()}`;
    const selectedQuestions = questions.filter(q => selectedQuestionIds.includes(q.id));

    const newTest = {
      id: testId,
      title: testTitle.trim(),
      description: testDesc.trim(),
      subject: testSubject,
      gradeLevel: parseInt(testGrade),
      duration: parseInt(testDuration) || 30,
      passingScore: parseInt(testPassingScore) || 70,
      difficulty: testDifficulty,
      questions: selectedQuestions,
      isAdaptive: false,
      isPlacementTest: false
    };

    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Test "${testTitle}" generated successfully! 📝`);
        setTestTitle('');
        setTestDesc('');
        setSelectedQuestionIds([]);
      } else {
        toast.error(data.error || 'Failed to build test');
      }
    } catch (error) {
      console.error('Error building test:', error);
      toast.error('Connection failure while generating test');
    } finally {
      setIsCreatingTest(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Config */}
        <Card className="lg:col-span-1 border border-border bg-card/65 backdrop-blur shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Test Configurations</CardTitle>
            <CardDescription>Setup details and academic parameters for your custom test.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-title">Test Title</Label>
              <Input 
                id="test-title" 
                placeholder="e.g. Mid-Term Geometry Exam" 
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-desc">Description</Label>
              <Textarea 
                id="test-desc" 
                placeholder="Explain to students what concepts this test covers..." 
                value={testDesc}
                onChange={(e) => setTestDesc(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={testSubject} onValueChange={(val) => {
                  setTestSubject(val);
                  setSelectedQuestionIds([]);
                }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherSubjects.map((sub: string) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Grade Level</Label>
                <Select value={testGrade} onValueChange={(val) => {
                  setTestGrade(val);
                  setSelectedQuestionIds([]);
                }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={`Grade ${teacherGrade}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherGrade !== undefined && (
                      <SelectItem value={teacherGrade.toString()}>Grade {teacherGrade}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test-dur">Duration (min)</Label>
                <Input 
                  id="test-dur" 
                  type="number" 
                  value={testDuration} 
                  onChange={(e) => setTestDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-score">Passing Score (%)</Label>
                <Input 
                  id="test-score" 
                  type="number" 
                  value={testPassingScore} 
                  onChange={(e) => setTestPassingScore(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Overall Difficulty</Label>
              <Select value={testDifficulty} onValueChange={(val: any) => setTestDifficulty(val)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-secondary/35 rounded-xl border border-border/80 space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-foreground">
                <span>Questions Selected:</span>
                <span className="text-primary text-sm font-bold">{selectedQuestionIds.length}</span>
              </div>
              <p className="text-muted-foreground">Select questions from the matching question list on the right to compile the test.</p>
            </div>

            <Button 
              className="w-full mt-4 bg-primary hover:opacity-90 font-bold text-white shadow-md transition-all duration-300" 
              onClick={handleCreateTest}
              disabled={isCreatingTest || selectedQuestionIds.length === 0}
            >
              {isCreatingTest ? 'Generating Test...' : '🔨 Generate Custom Test'}
            </Button>
          </CardContent>
        </Card>

        {/* Question Selection Checkbox List */}
        <Card className="lg:col-span-2 border border-border bg-card/65 backdrop-blur shadow-sm flex flex-col h-[600px]">
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle>Select Questions</CardTitle>
              <CardDescription>
                Displaying questions matching: <strong>{testSubject} (Grade {testGrade})</strong>
              </CardDescription>
            </div>
            <Badge className="bg-primary/15 text-primary border-primary/20">
              {testBuilderQuestions.length} Available
            </Badge>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoadingQuestions ? (
              <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse font-semibold">
                Loading matching questions...
              </div>
            ) : testBuilderQuestions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <HelpCircle className="w-10 h-10 text-muted-foreground/30 mb-2" />
                <p className="font-semibold text-muted-foreground text-sm">No questions in library for this subject & grade</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
                  Go to the <strong>Question Bank &gt; Bulk Import</strong> tab to load questions or refine the selected subject and grade.
                </p>
              </div>
            ) : (
              <div className="space-y-3 animate-slide-up">
                {testBuilderQuestions.map((q) => {
                  const isChecked = selectedQuestionIds.includes(q.id);

                  return (
                    <div 
                      key={q.id} 
                      className={`p-3 border rounded-xl cursor-pointer transition-all flex items-start gap-3 hover:bg-secondary/20 ${
                        isChecked ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/60'
                      }`}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedQuestionIds(prev => prev.filter(id => id !== q.id));
                        } else {
                          setSelectedQuestionIds(prev => [...prev, q.id]);
                        }
                      }}
                    >
                      <div className="mt-1 flex items-center">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          readOnly
                          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 accent-primary" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-relaxed">{q.text}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary" className="text-[10px] py-0">{q.type === 'mcq' ? 'MCQ' : 'True/False'}</Badge>
                          <Badge variant="outline" className={`text-[10px] py-0 capitalize ${
                            q.difficulty === 'easy' ? 'text-green-600 bg-green-500/5 border-green-200/50' : 
                            q.difficulty === 'medium' ? 'text-yellow-600 bg-yellow-500/5 border-yellow-200/50' : 
                            'text-red-600 bg-red-500/5 border-red-200/50'
                          }`}>{q.difficulty}</Badge>
                          {q.weight && <Badge variant="outline" className="text-[10px] py-0">Weight: {q.weight}</Badge>}
                        </div>
                        {q.explanation && (
                          <p className="text-[10px] text-muted-foreground mt-2 italic bg-muted/40 p-2 rounded-lg border border-border/50">
                            Explain: {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
