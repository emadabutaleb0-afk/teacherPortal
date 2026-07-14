import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { mockTests, availableGrades } from '@/lib/mockData';
import { BookOpen, Clock, AlertCircle, Search, Filter, Brain, Atom, Compass, History, GraduationCap, ArrowRight, HelpCircle, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

const getSubjectIcon = (sub: string) => {
  switch (sub) {
    case 'Mathematics': return <Brain className="w-3.5 h-3.5" />;
    case 'Science': return <Atom className="w-3.5 h-3.5" />;
    case 'Geography': return <Compass className="w-3.5 h-3.5" />;
    case 'History': return <History className="w-3.5 h-3.5" />;
    case 'English': return <BookOpen className="w-3.5 h-3.5" />;
    default: return <HelpCircle className="w-3.5 h-3.5" />;
  }
};

const getSubjectColor = (sub: string) => {
  switch (sub) {
    case 'Mathematics': return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-800/40';
    case 'Science': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/40';
    case 'Geography': return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/50 dark:border-sky-800/40';
    case 'History': return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/40';
    case 'English': return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200/50 dark:border-rose-800/40';
    default: return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-800/40';
  }
};

export default function Tests() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>(user?.gradeLevel?.toString() || '8');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset pagination when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject, selectedDifficulty, selectedGrade]);

  if (!user || user.role !== 'student') {
    navigate('/login');
    return null;
  }

  const allAvailableTests = mockTests.filter(test => {
    const matchesGrade = test.gradeLevel === user.gradeLevel;
    const matchesUserSubjects = !user.subjects || user.subjects.length === 0 || user.subjects.includes(test.subject);
    return matchesGrade && matchesUserSubjects;
  });

  const subjects = ['All', ...Array.from(new Set(allAvailableTests.map(t => t.subject)))];
  const difficulties = ['All', 'easy', 'medium', 'hard'];

  const filteredTests = allAvailableTests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          test.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || test.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'All' || test.difficulty === selectedDifficulty;
    const matchesGrade = selectedGrade === 'All' || test.gradeLevel?.toString() === selectedGrade;
    
    return matchesSearch && matchesSubject && matchesDifficulty && matchesGrade;
  });

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const paginatedTests = filteredTests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />

      <main className="py-8 bg-gradient-to-b from-background via-background to-secondary/15">
        <div className="container space-y-6 max-w-6xl">
          {/* Header */}
          <div className="text-left animate-slide-up">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              Available Tests Library 📝
            </h1>
            <p className="text-sm text-muted-foreground">Challenge yourself, practice concepts, and measure your academic learning progression.</p>
          </div>

          {/* Active Enrollment Matrix */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/[0.06] via-blue-500/[0.02] to-transparent border border-border/80 rounded-2xl animate-fade-in text-left">
            <div className="flex items-center gap-3.5 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-foreground">Active Enrollment Matrix</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-primary text-white font-bold px-2 py-0.5 text-[9px] h-5 rounded-lg">
                    Grade {user.gradeLevel}
                  </Badge>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-[11px] font-semibold text-muted-foreground">Registered Courses:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.subjects && user.subjects.length > 0 ? (
                      user.subjects.map(sub => (
                        <Badge key={sub} variant="outline" className={`flex items-center gap-1.5 h-5 px-2.5 text-[9px] font-bold border rounded-lg ${getSubjectColor(sub)} bg-background`}>
                          {getSubjectIcon(sub)}
                          {sub}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-yellow-600 font-medium">None registered</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
              className="text-xs font-semibold hover:bg-muted/30 border-border/85 rounded-xl transition-all gap-1.5 flex-shrink-0 h-9 hover-lift"
            >
              Add Subjects
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Search & Filter Controls */}
          <Card className="shadow-sm border-border/60 rounded-2xl">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search tests by title or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-muted/40 dark:bg-muted/20 border border-border/80 focus:border-primary/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-foreground"
                  />
                </div>

                {/* Subject Selector */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-muted/40 dark:bg-muted/20 border border-border/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all text-foreground font-medium"
                  >
                    <option value="All">All Registered Subjects</option>
                    {subjects.filter(s => s !== 'All').map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Selector */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-muted/40 dark:bg-muted/20 border border-border/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all text-foreground capitalize font-medium"
                  >
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff === 'All' ? 'All Difficulties' : `${diff} Difficulty`}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedTests.length > 0 ? (
              paginatedTests.map((test) => (
                <Card key={test.id} className="hover:shadow-xl hover:border-primary/45 transition-all duration-300 border border-border/80 flex flex-col justify-between overflow-hidden hover-lift group bg-card rounded-2xl">
                  {/* Subject Border Bar */}
                  <div className={`h-1 w-full bg-gradient-to-r ${
                    test.subject === 'Mathematics' ? 'from-indigo-500 to-indigo-600' :
                    test.subject === 'Science' ? 'from-emerald-500 to-emerald-600' :
                    test.subject === 'Geography' ? 'from-sky-500 to-sky-600' :
                    test.subject === 'History' ? 'from-amber-500 to-amber-600' :
                    'from-rose-500 to-rose-600'
                  }`} />
                  
                  <CardHeader className="pb-3 pt-5 text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <Badge variant="outline" className={`flex items-center gap-1 h-5 px-2.5 text-[9px] font-bold border rounded-lg ${getSubjectColor(test.subject)} bg-background`}>
                            {getSubjectIcon(test.subject)}
                            {test.subject}
                          </Badge>
                          
                          {/* Scheduled badge fix for dark mode safety */}
                          {test.scheduledAt && new Date(test.scheduledAt).getTime() > Date.now() && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-250 animate-pulse text-[9px] h-5 rounded-lg dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900/60">
                              🔒 Scheduled
                            </Badge>
                          )}
                          
                          {test.isAdaptive && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/40 text-[9px] h-5 font-bold rounded-lg flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Adaptive
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors leading-snug truncate">{test.title}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-relaxed">{test.description}</CardDescription>
                      </div>
                      
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase border flex-shrink-0 select-none ${
                        test.difficulty === 'easy'
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/60'
                          : test.difficulty === 'medium'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900/60'
                          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60'
                      }`}>
                        {test.difficulty}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 pt-0">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground bg-muted/40 dark:bg-muted/15 p-2.5 rounded-xl border border-border/30">
                      <div className="flex items-center gap-1 font-medium">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold text-foreground">{test.totalQuestions}</span> questions
                      </div>
                      <span className="text-muted-foreground/30">|</span>
                      <div className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold text-foreground">{test.duration}</span> minutes
                      </div>
                      <span className="text-muted-foreground/30">|</span>
                      <div className="flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 text-primary" />
                        Passing: <span className="font-bold text-foreground">{test.passingScore}%</span>
                      </div>
                    </div>

                    <Button
                      className={`w-full font-bold shadow rounded-xl hover-lift active-scale ${
                        test.isAdaptive 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white' 
                          : 'bg-primary text-white hover:bg-primary/95 shadow-primary/10'
                      }`}
                      disabled={!!(test.scheduledAt && new Date(test.scheduledAt).getTime() > Date.now())}
                      onClick={() => test.isAdaptive ? navigate(`/test-enhanced/${test.id}`) : navigate(`/test/${test.id}`)}
                    >
                      {test.scheduledAt && new Date(test.scheduledAt).getTime() > Date.now()
                        ? `Locked until: ${new Date(test.scheduledAt).toLocaleString()}`
                        : test.isAdaptive ? 'Launch Adaptive Diagnostic' : 'Start Assessment'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="md:col-span-2 text-center py-12 bg-card rounded-2xl border border-dashed border-border/80 flex flex-col items-center justify-center space-y-4">
                <AlertCircle className="w-12 h-12 text-muted-foreground/40 animate-pulse-subtle" />
                <div>
                  <p className="text-muted-foreground font-semibold text-base">No tests match your active filters</p>
                  <p className="text-muted-foreground/75 text-xs mt-1">Try clearing your difficulty filters or adding registered subjects on your profile details.</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setSearchQuery(''); setSelectedSubject('All'); setSelectedDifficulty('All'); }}>Reset Filters</Button>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 rounded-xl border-border/85 h-9"
              >
                Previous
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-9 h-9 rounded-xl border-border/85"
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 rounded-xl border-border/85 h-9"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
