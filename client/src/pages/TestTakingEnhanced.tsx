import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { mockTests, mockQuestions, Question, getAdaptiveDifficulty, shuffleArray, generatePlacementRecommendation } from '@/lib/mockData';
import { saveResultToDB } from '@/lib/dbSync';
import { Clock, Flag, ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle, AlertTriangle, Zap, AlertCircle, Sparkles, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface QuestionState {
  questionId: string;
  answered: boolean;
  answer?: string | number;
  flagged: boolean;
  skipped: boolean;
}

interface TestTakingEnhancedProps {
  params?: {
    id?: string;
  };
}

export default function TestTakingEnhanced({ params }: TestTakingEnhancedProps = {}) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [testId, setTestId] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [showReviewScreen, setShowReviewScreen] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isScheduledLocked, setIsScheduledLocked] = useState(false);
  const [test, setTest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Subject and Grade selection for unauthenticated placement
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [selectedGrade, setSelectedGrade] = useState<number>(6);

  // Get test ID from URL or params
  useEffect(() => {
    if (params?.id) {
      setTestId(params.id);
    } else {
      const path = window.location.pathname;
      const id = path.split('/').pop();
      if (id) setTestId(id);
    }
  }, [params]);

  // Redirect grade automatically if student is signed in
  useEffect(() => {
    if (user && user.gradeLevel) {
      setSelectedGrade(user.gradeLevel);
    }
  }, [user]);

  useEffect(() => {
    if (testId === 'test-005') {
      // Allow guests for diagnostic assessments
    } else if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }

    const loadTest = async () => {
      setIsLoading(true);
      try {
        let testObj = mockTests.find(t => t.id === testId) || (testId === 'test-005' ? mockTests.find(t => t.id === 'test-005') : null);
        
        if (!testObj && testId) {
          const res = await fetch('/api/tests');
          if (res.ok) {
            const testsData = await res.json();
            testObj = testsData.find((t: any) => t.id === testId);
          }
        }

        if (testObj) {
          setTest(testObj);
          
          if (testObj.scheduledAt && new Date(testObj.scheduledAt).getTime() > Date.now()) {
            setIsScheduledLocked(true);
            setIsLoading(false);
            return;
          }

          let testQuestions = testObj.questions || [];

          if (testObj.isPlacementTest) {
            const filtered = mockQuestions.filter(
              q => q.subject.toLowerCase() === selectedSubject.toLowerCase() && q.gradeLevel === selectedGrade
            );
            if (filtered.length > 0) {
              testQuestions = filtered;
            } else {
              const subjectOnly = mockQuestions.filter(q => q.subject.toLowerCase() === selectedSubject.toLowerCase());
              if (subjectOnly.length > 0) {
                testQuestions = subjectOnly;
              }
            }
          }

          const initialQuestions = testObj.isAdaptive
            ? shuffleArray(testQuestions)
            : testObj; 
          
          const finalInitialQuestions = Array.isArray(initialQuestions) ? initialQuestions : testQuestions;
          const limitedQuestions = finalInitialQuestions.slice(0, 15); 
          setQuestions(limitedQuestions);
          setTimeRemaining(testObj.duration * 60); 
          
          const states: QuestionState[] = limitedQuestions.map(q => ({
            questionId: q.id,
            answered: false,
            flagged: false,
            skipped: false,
          }));
          setQuestionStates(states);
          setCurrentQuestionIndex(0); 
        }
      } catch (e) {
        console.error('Failed to load test in enhanced mode', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadTest();
  }, [testId, user, navigate, selectedSubject, selectedGrade]);

  // Timer effect
  useEffect(() => {
    if (!testStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining < 60) return 'text-red-500 animate-pulse';
    if (timeRemaining < 300) return 'text-amber-500';
    return 'text-foreground';
  };

  const handleStartTest = () => {
    setTestStarted(true);
    toast.success('Test started! Good luck! 🚀');
  };

  const handleAnswerQuestion = (answer: string | number) => {
    const newStates = [...questionStates];
    newStates[currentQuestionIndex] = {
      ...newStates[currentQuestionIndex],
      answered: true,
      answer,
      skipped: false,
    };
    setQuestionStates(newStates);

    if (test?.isAdaptive) {
      const correctAnswers = newStates.filter(
        (s, idx) => s.answered && questions[idx].correctAnswer === s.answer
      ).length;
      const newDifficulty = getAdaptiveDifficulty(correctAnswers, questions.length, currentQuestionIndex + 1);
      setCurrentDifficulty(newDifficulty);
    }
  };

  const handleSkipQuestion = () => {
    const newStates = [...questionStates];
    newStates[currentQuestionIndex] = {
      ...newStates[currentQuestionIndex],
      skipped: true,
    };
    setQuestionStates(newStates);
    moveToNextQuestion();
    toast.info('Question skipped. You can review it later.');
  };

  const handleFlagQuestion = () => {
    const newStates = [...questionStates];
    newStates[currentQuestionIndex] = {
      ...newStates[currentQuestionIndex],
      flagged: !newStates[currentQuestionIndex].flagged,
    };
    setQuestionStates(newStates);
    toast.success(
      newStates[currentQuestionIndex].flagged
        ? '🚩 Question flagged for review'
        : 'Flag removed'
    );
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowFeedback(false);
    }
  };

  const moveToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowFeedback(false);
    }
  };

  const handleSubmitTest = () => {
    const unanswered = questionStates.filter(s => !s.answered && !s.skipped).length;
    if (unanswered > 0) {
      toast.error(`You have ${unanswered} unanswered questions. Answer or skip them first.`);
      return;
    }
    setShowReviewScreen(true);
  };

  const handleFinalSubmit = async () => {
    const correctCount = questionStates.filter(
      (s, idx) => s.answered && questions[idx].correctAnswer === s.answer
    ).length;
    
    const percentage = Math.round((correctCount / questions.length) * 100);
    const resultId = `result-${Date.now()}`;
    
    const newResult = {
      id: resultId,
      studentId: user?.id || 'guest-student',
      testId: test?.id || 'test-005',
      testTitle: test?.title || 'AI Smart-Guidance Placement Assessment',
      subject: test?.subject || selectedSubject,
      score: correctCount,
      totalScore: questions.length,
      percentage,
      timeTaken: Math.floor(Math.random() * 120) + 120,
      completedAt: new Date().toISOString(),
      answers: questionStates.reduce((acc, s, idx) => {
        if (s.answered && s.answer !== undefined) {
          acc[questions[idx].id] = s.answer;
        }
        return acc;
      }, {} as any),
      strengths: percentage >= 70 ? ['Core Principles', 'Analytical Reasoning'] : ['Fundamental Facts'],
      weaknesses: percentage < 70 ? ['Advanced Applications'] : ['High-complexity nuances'],
      isPlacementTest: test?.isPlacementTest || false,
      placementRecommendation: test?.isPlacementTest ? generatePlacementRecommendation(
        percentage,
        test?.subject || selectedSubject,
        selectedGrade,
        ['Core Logic', 'Foundational Analysis'],
        ['Complex Applications']
      ) : undefined
    };

    await saveResultToDB(newResult as any);
    
    if (test?.isPlacementTest) {
      navigate(`/placement-report?score=${percentage}&correct=${correctCount}&total=${questions.length}&resultId=${resultId}`);
    } else {
      navigate(`/results/${resultId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar />
        <main className="container py-24 flex justify-center items-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground font-semibold text-sm">Syncing placement questions...</p>
          </div>
        </main>
      </div>
    );
  }

  // Deduplicated Scheduled Locked Screen check
  if (isScheduledLocked) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar />
        <main className="container py-16 flex justify-center items-center">
          <Card className="max-w-md w-full shadow-xl border border-border/85 rounded-2xl overflow-hidden animate-scale-in">
            <div className="h-1.5 bg-yellow-500" />
            <CardHeader className="text-center pb-2 pt-6">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400 mx-auto mb-3">
                <AlertCircle className="w-6 h-6 animate-pulse-subtle" />
              </div>
              <CardTitle className="text-xl font-bold">Assessment Scheduled</CardTitle>
              <CardDescription className="text-xs">
                This test is scheduled for a future date and cannot be started yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4 pt-4">
              <div className="p-3.5 bg-yellow-500/5 dark:bg-yellow-950/20 border border-yellow-500/20 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400">
                <span>Scheduled Time: </span>
                {test?.scheduledAt ? new Date(test.scheduledAt).toLocaleString() : 'N/A'}
              </div>
              <Button onClick={() => navigate('/student-dashboard')} className="w-full rounded-xl border border-border/80 hover:bg-muted/30">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar />
        <main className="container py-12 max-w-2xl text-left">
          <Card className="shadow-lg rounded-2xl overflow-hidden animate-slide-up border border-border/85 bg-card">
            <div className="h-1.5 bg-gradient-to-r from-primary to-emerald-500" />
            <CardHeader className="space-y-2 p-6">
              <CardTitle className="text-3xl font-extrabold tracking-tight">{test?.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">{test?.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6 pt-0">
              {test?.isPlacementTest && (
                <div className="space-y-4 p-5 bg-gradient-to-br from-primary/[0.04] via-emerald-500/[0.02] to-transparent border border-border/80 dark:border-white/5 rounded-2xl animate-fade-in">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                    <Zap className="w-4.5 h-4.5 text-accent animate-pulse-subtle" />
                    Configure Your AI Smart-Path Assessment
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="placement-subject" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Subject</Label>
                      <select
                        id="placement-subject"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full px-3 py-2 border border-border/80 rounded-xl bg-background text-foreground focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all text-sm font-medium"
                        disabled={!!user} 
                      >
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="Geography">Geography</option>
                        <option value="History">History</option>
                        <option value="English">English</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="placement-grade" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Grade Level</Label>
                      <select
                        id="placement-grade"
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-border/80 rounded-xl bg-background text-foreground focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all text-sm font-medium"
                        disabled={!!user} 
                      >
                        {Array.from({ length: 9 }, (_, i) => i + 4).map(grade => (
                          <option key={grade} value={grade}>Grade {grade}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {user ? (
                    <p className="text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
                      <span>✨ Your grade level is automatically set to <strong className="text-foreground">Grade {user.gradeLevel}</strong> based on your account.</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
                      <span>💡 Guest mode: customize your grade and subject freely to explore our adaptive assessment.</span>
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-4 bg-muted/40 dark:bg-muted/15 border border-border/60 rounded-2xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Duration</p>
                  <p className="text-xl font-extrabold text-foreground">{test?.duration} <span className="text-xs font-medium text-muted-foreground">mins</span></p>
                </div>
                <div className="p-4 bg-muted/40 dark:bg-muted/15 border border-border/60 rounded-2xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Questions count</p>
                  <p className="text-xl font-extrabold text-foreground">{questions.length}</p>
                </div>
                <div className="p-4 bg-muted/40 dark:bg-muted/15 border border-border/60 rounded-2xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Passing Score</p>
                  <p className="text-xl font-extrabold text-foreground">{test?.passingScore}%</p>
                </div>
                <div className="p-4 bg-muted/40 dark:bg-muted/15 border border-border/60 rounded-2xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Assessment Type</p>
                  <p className="text-xl font-extrabold text-foreground">
                    {test?.isAdaptive ? 'AI Adaptive' : 'Standard'}
                  </p>
                </div>
              </div>

              {test?.isAdaptive && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Adaptive calibration</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Questions dynamically get harder or easier based on your accuracy to establish your learning boundary.
                    </p>
                  </div>
                </div>
              )}

              <Button onClick={handleStartTest} className="w-full hover-lift active-scale bg-primary text-white h-11 rounded-xl shadow-md font-bold text-sm" size="lg">
                Start Assessment
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (showReviewScreen) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar />
        <main className="container py-8 max-w-3xl text-left">
          <Card className="shadow-lg rounded-2xl border border-border/80 overflow-hidden animate-slide-up bg-card">
            <div className="h-1.5 bg-gradient-to-r from-primary to-emerald-500" />
            <CardHeader className="p-6 border-b border-border/60 bg-muted/10">
              <CardTitle className="text-2xl font-bold tracking-tight">Review Your Answers</CardTitle>
              <CardDescription className="text-xs">Check your questions before final submission</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300">
                  <p className="text-[10px] font-bold uppercase tracking-wider">Answered</p>
                  <p className="text-2xl font-extrabold">{questionStates.filter(s => s.answered).length}</p>
                </div>
                <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-700 dark:text-yellow-300">
                  <p className="text-[10px] font-bold uppercase tracking-wider">Flagged</p>
                  <p className="text-2xl font-extrabold">{questionStates.filter(s => s.flagged).length}</p>
                </div>
                <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 text-orange-700 dark:text-orange-300">
                  <p className="text-[10px] font-bold uppercase tracking-wider">Skipped</p>
                  <p className="text-2xl font-extrabold">{questionStates.filter(s => s.skipped).length}</p>
                </div>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const state = questionStates[idx];
                  return (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:border-primary/45 ${
                        state.flagged
                          ? 'border-yellow-500/30 bg-yellow-500/[0.02]'
                          : state.skipped
                          ? 'border-orange-500/30 bg-orange-500/[0.02]'
                          : state.answered
                          ? 'border-border/80 bg-background'
                          : 'border-border/40 bg-muted/20'
                      }`}
                      onClick={() => {
                        setShowReviewScreen(false);
                        setCurrentQuestionIndex(idx);
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-foreground">Question {idx + 1}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-md mt-0.5">{q.text}</p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          {state.flagged && <Badge className="bg-yellow-500 hover:bg-yellow-500/95 text-white text-[9px] h-5 rounded-lg">🚩 Flagged</Badge>}
                          {state.answered && <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-[9px] h-5 rounded-lg">Answered</Badge>}
                          {state.skipped && <Badge variant="secondary" className="text-[9px] h-5 rounded-lg">Skipped</Badge>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4 border-t border-border/60">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewScreen(false)}
                  className="flex-1 rounded-xl h-11 font-semibold border-border/85 hover:bg-muted/30"
                >
                  Continue Reviewing
                </Button>
                <Button onClick={handleFinalSubmit} className="flex-1 rounded-xl h-11 font-bold bg-primary text-white hover:bg-primary/95 shadow shadow-primary/10">
                  Submit Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentState = questionStates[currentQuestionIndex];
  const answeredCount = questionStates.filter(s => s.answered).length;
  const flaggedCount = questionStates.filter(s => s.flagged).length;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />

      <main className="container py-8 max-w-4xl text-left space-y-6">
        {/* Header with Timer */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{test?.title}</h1>
            {test?.isAdaptive && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                AI Difficulty calibration: <Badge variant="outline" className="capitalize text-[10px] font-semibold">{currentDifficulty}</Badge>
              </p>
            )}
          </div>
          
          <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border border-border/80 shrink-0 bg-muted/40 dark:bg-muted/15`}>
            <Clock className={`w-5 h-5 ${timeRemaining < 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
            <div className="text-left leading-none">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Time Remaining</span>
              <span className={`text-lg font-bold tracking-tight font-mono ${getTimeColor()}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress KPI panel */}
        <Card className="shadow-sm border-border/60 rounded-2xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div>
              <div className="flex justify-between mb-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span>Progress Tracker</span>
                <span>
                  {currentQuestionIndex + 1} of {questions.length} Questions
                </span>
              </div>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-1.5" />
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-emerald-500/[0.04] p-3 rounded-xl border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Answered</p>
                <p className="font-extrabold text-lg leading-tight mt-0.5">{answeredCount}</p>
              </div>
              <div className="bg-yellow-500/[0.04] p-3 rounded-xl border border-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Flagged</p>
                <p className="font-extrabold text-lg leading-tight mt-0.5">{flaggedCount}</p>
              </div>
              <div className="bg-orange-500/[0.04] p-3 rounded-xl border border-orange-500/20 text-orange-700 dark:text-orange-400">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Skipped</p>
                <p className="font-extrabold text-lg leading-tight mt-0.5">
                  {questionStates.filter(s => s.skipped).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question card */}
        <Card className="shadow-md rounded-2xl overflow-hidden border-border/80 bg-card">
          <CardHeader className="bg-gradient-to-r from-primary/[0.05] via-emerald-500/[0.02] to-transparent p-5 border-b border-border/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold">Question {currentQuestionIndex + 1}</CardTitle>
                <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                  {currentQuestion?.subject} • <span className="capitalize">{currentQuestion?.difficulty} difficulty</span>
                </CardDescription>
              </div>
              <Button
                variant={currentState?.flagged ? 'default' : 'outline'}
                size="sm"
                onClick={handleFlagQuestion}
                className="gap-1.5 hover-lift rounded-xl text-xs h-8 border-border/85"
              >
                <Flag className="w-3.5 h-3.5" />
                {currentState?.flagged ? 'Flagged' : 'Flag'}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-5 space-y-6">
            <p className="text-lg font-semibold leading-relaxed text-foreground">{currentQuestion?.text}</p>

            {currentQuestion?.type === 'mcq' && (
              <RadioGroup
                value={currentState?.answer?.toString() || ''}
                onValueChange={(value) => handleAnswerQuestion(parseInt(value))}
                className="space-y-2.5"
              >
                {currentQuestion.options?.map((option, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleAnswerQuestion(idx)}
                    className={`flex items-center space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer active-scale ${
                      currentState?.answer === idx
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-border/85 hover:bg-muted/40'
                    }`}
                  >
                    <RadioGroupItem value={idx.toString()} id={`option-${idx}`} className="pointer-events-none" />
                    <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1 font-semibold text-sm text-foreground text-left leading-tight">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion?.type === 'trueFalse' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['true', 'false'].map((value) => (
                  <div
                    key={value}
                    onClick={() => handleAnswerQuestion(value)}
                    className={`p-4 rounded-xl border border-border/80 cursor-pointer transition-all active-scale text-center ${
                      currentState?.answer === value
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                        : 'hover:bg-muted/40'
                    }`}
                  >
                    <p className="font-bold capitalize text-base text-foreground">
                      {value === 'true' ? '✓ True' : '✗ False'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation bottom bar */}
        <div className="flex gap-3 justify-between items-center flex-wrap pt-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={moveToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="gap-1.5 hover-lift rounded-xl text-xs h-10 border-border/85"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleSkipQuestion}
              className="gap-1.5 hover-lift rounded-xl text-xs h-10 border-border/85"
            >
              Skip
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReviewScreen(true)}
              className="gap-1.5 hover-lift rounded-xl text-xs h-10 border-border/85"
            >
              <Eye className="w-4 h-4" />
              Review Index
            </Button>
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleSubmitTest} className="gap-1.5 hover-lift rounded-xl text-xs h-10 bg-primary text-white hover:bg-primary/95 shadow shadow-primary/15 font-bold">
                <Send className="w-3.5 h-3.5" /> Submit Assessment
              </Button>
            ) : (
              <Button
                onClick={moveToNextQuestion}
                className="gap-1.5 hover-lift rounded-xl text-xs h-10 bg-primary text-white hover:bg-primary/95 shadow shadow-primary/15 font-bold"
              >
                Next Question
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator (Responsive grid layout) */}
        <Card className="shadow-sm border-border/60 rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/10 p-4 border-b border-border/60">
            <CardTitle className="text-sm font-bold">Question Navigator Grid</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {questions.map((_, idx) => {
                const state = questionStates[idx];
                let bgStyle = 'bg-muted text-muted-foreground border-border/65';
                
                if (state?.flagged) {
                  bgStyle = 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
                } else if (state?.answered) {
                  bgStyle = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
                } else if (state?.skipped) {
                  bgStyle = 'bg-orange-500/10 text-orange-600 border-orange-500/20';
                }
                
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-9 h-9 rounded-xl font-bold border transition-all text-xs active-scale ${bgStyle} ${
                      currentQuestionIndex === idx
                        ? 'ring-2 ring-offset-2 ring-primary scale-105 shadow-sm'
                        : 'hover:brightness-95'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Loader2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}
