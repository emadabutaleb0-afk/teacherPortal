import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, RotateCcw, ArrowLeft } from 'lucide-react';
import { mockTests } from '@/lib/mockData';
import { Navbar } from '@/components/Navbar';

interface ReviewQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'trueFalse';
  options?: string[];
  correctAnswer: string | number;
  studentAnswer: string | number;
  explanation: string;
  isCorrect: boolean;
}

export default function TestReview() {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [testId, setTestId] = useState<string>('test-001');
  const [, navigate] = useLocation();

  useEffect(() => {
    const path = window.location.pathname;
    const id = path.split('/').pop();
    if (id) setTestId(id);
  }, []);

  const test = mockTests.find((t: any) => t.id === testId);

  // Mock test review data
  const mockReview = {
    testId: testId,
    testTitle: test?.title || 'Test',
    completedAt: '2026-05-08T14:30:00Z',
    score: 94,
    percentage: 94,
    questions: test?.questions.map((q: any, index: number) => ({
      id: q.id,
      question: q.text,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,
      studentAnswer: index % 3 === 0 ? 'wrong-answer' : q.correctAnswer,
      explanation: q.explanation,
      isCorrect: index % 3 !== 0,
    })) || [],
  };

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const correctCount = mockReview.questions.filter((q: ReviewQuestion) => q.isCorrect).length;
  const incorrectCount = mockReview.questions.length - correctCount;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-4xl py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-1">Test Review</h1>
            <p className="text-muted-foreground">{mockReview.testTitle}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="self-start sm:self-auto gap-2 hover-lift"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Results
          </Button>
        </div>

        {/* Score Summary */}
        <Card className="hover-lift bg-gradient-to-br from-primary/5 to-indigo-500/5 border-primary/20">
          <CardContent className="pt-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-1">{mockReview.percentage}%</div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Your Score</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-success mb-1">{correctCount}</div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Correct</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-destructive mb-1">{incorrectCount}</div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Incorrect</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-1">{mockReview.questions.length}</div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Review */}
        <div className="space-y-4">
          {mockReview.questions.map((q: ReviewQuestion, index: number) => (
            <Card
              key={q.id}
              className={`hover-lift transition-all border-2 ${
                q.isCorrect 
                  ? 'border-success/20 dark:border-success/10 bg-success/5' 
                  : 'border-destructive/20 dark:border-destructive/10 bg-destructive/5'
              }`}
            >
              <div
                className="p-5 cursor-pointer flex items-start justify-between gap-4"
                onClick={() => toggleQuestion(q.id)}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Question Number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center font-semibold text-sm border border-border">
                    {index + 1}
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-base mb-3 pr-2 leading-relaxed">{q.question}</p>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {q.isCorrect ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                          <span className="text-sm font-medium text-success">Correct</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                          <span className="text-sm font-medium text-destructive">Incorrect</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expand Button */}
                <button className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-1">
                  {expandedQuestions.has(q.id) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Expanded Content */}
              {expandedQuestions.has(q.id) && (
                <CardContent className="pt-0 border-t border-border/40">
                  <div className="space-y-5 mt-5">
                    {/* Options */}
                    {q.type === 'mcq' && q.options && (
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-3">Options:</p>
                        <div className="grid gap-3">
                          {q.options?.map((option: string, optIndex: number) => {
                            const isCorrect = option === q.correctAnswer;
                            const isStudentAnswer = option === q.studentAnswer;
                            return (
                              <div
                                key={optIndex}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                  isCorrect
                                    ? 'border-success bg-success/10 dark:bg-success/15'
                                    : isStudentAnswer && !q.isCorrect
                                      ? 'border-destructive bg-destructive/10 dark:bg-destructive/15'
                                      : 'border-border bg-background'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">{option}</p>
                                  </div>
                                  <div className="flex-shrink-0">
                                    {isCorrect && <CheckCircle className="w-5 h-5 text-success" />}
                                    {isStudentAnswer && !q.isCorrect && (
                                      <XCircle className="w-5 h-5 text-destructive" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* True/False */}
                    {q.type === 'trueFalse' && (
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-3">Answer:</p>
                        <div className="flex gap-3">
                          {['True', 'False'].map((answer: string) => {
                            const isCorrect = answer.toLowerCase() === String(q.correctAnswer).toLowerCase();
                            const isStudentAnswer =
                              answer.toLowerCase() === String(q.studentAnswer).toLowerCase();
                            return (
                              <div
                                key={answer}
                                className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                                  isCorrect
                                    ? 'border-success bg-success/10 dark:bg-success/15'
                                    : isStudentAnswer && !q.isCorrect
                                      ? 'border-destructive bg-destructive/10 dark:bg-destructive/15'
                                      : 'border-border bg-background'
                                }`}
                              >
                                <p className="font-semibold text-foreground">{answer}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Compare Answers row if incorrect */}
                    {!q.isCorrect && (
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="bg-destructive/5 border border-destructive/15 rounded-lg p-3.5">
                          <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-1">Your Answer</p>
                          <p className="text-sm text-foreground font-medium">{String(q.studentAnswer)}</p>
                        </div>
                        <div className="bg-success/5 border border-success/15 rounded-lg p-3.5">
                          <p className="text-xs font-semibold text-success uppercase tracking-wider mb-1">Correct Answer</p>
                          <p className="text-sm text-foreground font-medium">{String(q.correctAnswer)}</p>
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    <div className="bg-primary/5 border border-primary/15 rounded-lg p-4">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Explanation</p>
                      <p className="text-sm text-foreground/90 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center pt-4">
          <Button variant="outline" onClick={() => window.history.back()} className="hover-lift px-6">
            Back to Results
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-primary/80 gap-2 hover-lift px-6"
            onClick={() => navigate(test?.isAdaptive ? `/test-enhanced/${testId}` : `/test/${testId}`)}
          >
            <RotateCcw className="w-4 h-4" />
            Retake Test
          </Button>
        </div>
      </main>
    </div>
  );
}
