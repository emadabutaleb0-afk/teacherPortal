import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { mockTests, shuffleArray, Question, TestResult } from '@/lib/mockData';
import { saveResultToDB } from '@/lib/dbSync';
import { Clock, CheckCircle2, XCircle, AlertCircle, Sparkles, Send } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TestTakingProps {
  params?: {
    id?: string;
  };
}

export default function TestTaking({ params }: TestTakingProps = {}) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [testId, setTestId] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [isScheduledLocked, setIsScheduledLocked] = useState(false);
  const [test, setTest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

  // Initialize test
  useEffect(() => {
    if (!testId) return;
    
    const loadTest = async () => {
      setIsLoading(true);
      try {
        let testObj = mockTests.find(t => t.id === testId);
        
        if (!testObj) {
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
          setShuffledQuestions(shuffleArray(testObj.questions || []));
          setTimeLeft(testObj.duration * 60);
        }
      } catch (e) {
        console.error('Failed to load test', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadTest();
  }, [testId]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || testSubmitted) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, testSubmitted]);

  if (!user || user.role !== 'student' || !testId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar />
        <main className="container py-24 flex justify-center items-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground font-semibold text-sm">Synchronizing quiz questions...</p>
          </div>
        </main>
      </div>
    );
  }

  if (isScheduledLocked) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar />
        <main className="container py-16 flex justify-center items-center">
          <Card className="max-w-md w-full shadow-xl border border-border/80 rounded-2xl overflow-hidden animate-scale-in">
            <div className="h-1.5 bg-yellow-500" />
            <CardHeader className="text-center pb-2 pt-6">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400 mx-auto mb-3">
                <AlertCircle className="w-6 h-6 animate-pulse-subtle" />
              </div>
              <CardTitle className="text-xl font-bold">Assessment Scheduled</CardTitle>
              <CardDescription className="text-xs">
                This test is scheduled for a future date and cannot be launched yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4 pt-4">
              <div className="p-3.5 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400">
                <span>Start Time: </span>
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

  if (!test || shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar />
        <main className="container py-16 flex justify-center items-center">
          <Card className="max-w-md w-full shadow-xl border border-border/80 rounded-2xl overflow-hidden animate-scale-in">
            <div className="h-1.5 bg-red-500" />
            <CardHeader className="text-center pb-2 pt-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl font-bold">Assessment Unresolved</CardTitle>
              <CardDescription className="text-xs">
                The requested test could not be resolved or contains no questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Button onClick={() => navigate('/student-dashboard')} className="w-full rounded-xl border border-border/80">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const isAnswered = currentQuestionIndex.toString() in answers;
  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredCount = Object.keys(answers).length;
  const isTimerLow = timeLeft < 60;

  const handleAnswer = (value: string | number) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex.toString()]: value,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowFeedback(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowFeedback(false);
    }
  };

  const submitTestExecution = async () => {
    const score = shuffledQuestions.filter((q, i) => answers[i.toString()] === q.correctAnswer).length;
    const percentage = Math.round((score / shuffledQuestions.length) * 100);

    if (!user || !test) return;

    setTestSubmitted(true);
    toast.success('Assessment submitted successfully!');

    const resultId = `result-${Date.now()}`;
    const newResult: TestResult = {
      id: resultId,
      studentId: user.id,
      testId: test.id,
      testTitle: test.title,
      subject: test.subject,
      score,
      totalScore: shuffledQuestions.length,
      percentage,
      timeTaken: Math.floor(Math.random() * 120) + 120,
      completedAt: new Date().toISOString(),
      answers: answers,
      strengths: percentage >= 70 ? ['Core Principles', 'Analytical Reasoning'] : ['Fundamental Facts'],
      weaknesses: percentage < 70 ? ['Advanced Applications'] : ['High-complexity nuances'],
      isPlacementTest: test.isPlacementTest || false
    };

    await saveResultToDB(newResult);

    setTimeout(() => {
      if (test.isPlacementTest) {
        navigate(`/placement-report?score=${percentage}&correct=${score}&total=${shuffledQuestions.length}&resultId=${resultId}`);
      } else {
        navigate(`/results/${resultId}`);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />

      <main className="container py-8 max-w-4xl">
        {/* Header Summary */}
        <div className="mb-6 space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{test.subject} Assessment</span>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-snug">{test.title}</h1>
            </div>
            
            {/* Timer Widget */}
            <div className="flex items-center gap-3 bg-muted/40 dark:bg-muted/15 px-4 py-2 rounded-2xl border border-border/80 shrink-0">
              <Clock className={`w-5 h-5 ${isTimerLow ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
              <div className="text-left leading-none">
                <span className="text-[9px] font-bold text-muted-foreground uppercase block">Time Left</span>
                <span className={`text-lg font-bold tracking-tight ${isTimerLow ? 'text-red-600 font-extrabold animate-pulse' : 'text-foreground'}`}>
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>Question {currentQuestionIndex + 1} of {shuffledQuestions.length}</span>
              <span>{answeredCount} / {shuffledQuestions.length} Answered</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-muted dark:bg-muted/30" />
          </div>
        </div>

        {/* Question Panel */}
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-2xl border border-border/70 shadow-md overflow-hidden bg-card text-left">
            <div className="p-5 border-b border-border/60 bg-muted/10">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                {currentQuestion.type === 'trueFalse' ? 'True or False Module' : 'Multiple Choice Select'}
              </span>
              <h3 className="text-lg font-bold text-foreground leading-snug mt-1">{currentQuestion.text}</h3>
            </div>
            
            <CardContent className="p-5 space-y-5">
              {/* Answer Option choices */}
              <RadioGroup
                value={answers[currentQuestionIndex.toString()]?.toString() || ''}
                onValueChange={handleAnswer}
                className="space-y-2.5"
              >
                {currentQuestion.type === 'trueFalse' ? (
                  ['True', 'False'].map((option) => (
                    <div
                      key={option}
                      onClick={() => handleAnswer(option.toLowerCase())}
                      className={`flex items-center space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer active-scale ${
                        answers[currentQuestionIndex.toString()] === option.toLowerCase()
                          ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                          : 'border-border/80 hover:bg-muted/40'
                      }`}
                    >
                      <RadioGroupItem value={option.toLowerCase()} id={`opt-${option}`} className="pointer-events-none" />
                      <Label htmlFor={`opt-${option}`} className="flex-1 cursor-pointer font-semibold text-sm text-foreground text-left leading-none">
                        {option}
                      </Label>
                    </div>
                  ))
                ) : (
                  currentQuestion.options?.map((option, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAnswer(idx.toString())}
                      className={`flex items-center space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer active-scale ${
                        answers[currentQuestionIndex.toString()] === idx.toString()
                          ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                          : 'border-border/80 hover:bg-muted/40'
                      }`}
                    >
                      <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} className="pointer-events-none" />
                      <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer font-semibold text-sm text-foreground text-left leading-tight">
                        {option}
                      </Label>
                    </div>
                  ))
                )}
              </RadioGroup>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border/60">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="font-bold text-xs h-10 px-4 rounded-xl border-border/85 hover:bg-muted/30"
                >
                  Previous
                </Button>

                {currentQuestionIndex < shuffledQuestions.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    className="flex-1 font-bold text-xs h-10 bg-primary hover:bg-primary/95 text-white rounded-xl hover-lift shadow shadow-primary/10"
                  >
                    Next Question
                  </Button>
                ) : (
                  <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="flex-1 font-bold text-xs h-10 bg-gradient-to-r from-primary to-emerald-500 hover:opacity-90 text-white rounded-xl shadow shadow-primary/10 hover-lift active-scale"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" /> Submit Assessment
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl border border-border shadow-2xl bg-card animate-scale-in">
                      <AlertDialogHeader className="text-left">
                        <AlertDialogTitle className="font-bold">Submit Assessment?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground leading-normal">
                          You have answered <strong className="text-foreground">{answeredCount} of {shuffledQuestions.length}</strong> questions. Once submitted, you will receive real-time analytics and strength updates.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="pt-2 border-t border-border/60">
                        <AlertDialogCancel className="rounded-xl text-xs font-semibold h-10 border-border/80 hover:bg-muted/30">Go Back</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={submitTestExecution}
                          className="rounded-xl text-xs font-semibold h-10 bg-primary text-white hover:bg-primary/95 shadow shadow-primary/10"
                        >
                          Submit Test
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              {/* Unanswered Remaining Warnings */}
              {answeredCount < shuffledQuestions.length && (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 animate-fade-in text-left">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>{shuffledQuestions.length - answeredCount} question(s) remaining unanswered.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Inline Helper spinner
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
