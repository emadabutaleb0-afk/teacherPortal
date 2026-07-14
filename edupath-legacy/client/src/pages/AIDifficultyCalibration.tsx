import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';

interface QuestionMetric {
  id: string;
  questionText: string;
  currentDifficulty: 'easy' | 'medium' | 'hard';
  suggestedDifficulty: 'easy' | 'medium' | 'hard';
  passRate: number;
  attempts: number;
  avgTimeSpent: number;
  recommendation: string;
  reason: string;
}

const initialQuestionMetrics: QuestionMetric[] = [
  {
    id: 'q-1',
    questionText: 'What is the capital of France?',
    currentDifficulty: 'easy',
    suggestedDifficulty: 'easy',
    passRate: 98,
    attempts: 245,
    avgTimeSpent: 12,
    recommendation: 'Keep',
    reason: 'High pass rate indicates appropriate difficulty level',
  },
  {
    id: 'q-2',
    questionText: 'Solve: 2x + 5 = 17',
    currentDifficulty: 'medium',
    suggestedDifficulty: 'easy',
    passRate: 89,
    attempts: 312,
    avgTimeSpent: 45,
    recommendation: 'Move to Easy',
    reason: 'Pass rate suggests this is easier than categorized',
  },
  {
    id: 'q-3',
    questionText: 'Analyze the symbolism in metaphorical language...',
    currentDifficulty: 'hard',
    suggestedDifficulty: 'hard',
    passRate: 42,
    attempts: 156,
    avgTimeSpent: 180,
    recommendation: 'Keep',
    reason: 'Pass rate and time spent align with hard difficulty',
  },
  {
    id: 'q-4',
    questionText: 'What is photosynthesis?',
    currentDifficulty: 'easy',
    suggestedDifficulty: 'medium',
    passRate: 35,
    attempts: 89,
    avgTimeSpent: 120,
    recommendation: 'Move to Medium',
    reason: 'Low pass rate and high time suggest question is ambiguous or difficult',
  },
  {
    id: 'q-5',
    questionText: 'Calculate the derivative of f(x) = x³ + 2x²',
    currentDifficulty: 'hard',
    suggestedDifficulty: 'medium',
    passRate: 72,
    attempts: 201,
    avgTimeSpent: 90,
    recommendation: 'Move to Medium',
    reason: 'High pass rate indicates this is easier than expected',
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRecommendationIcon = (recommendation: string) => {
  switch (recommendation) {
    case 'Keep':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'Move to Easy':
    case 'Move to Medium':
    case 'Move to Hard':
      return <TrendingDown className="w-5 h-5 text-blue-600" />;
    case 'Review':
      return <AlertCircle className="w-5 h-5 text-amber-600" />;
    default:
      return null;
  }
};

export default function AIDifficultyCalibration() {
  const [metrics, setMetrics] = useState<QuestionMetric[]>(initialQuestionMetrics);

  const needsAdjustment = metrics.filter(q => q.recommendation !== 'Keep').length;

  const handleApplyRecommendation = (id: string) => {
    setMetrics(prev =>
      prev.map(q =>
        q.id === id
          ? {
              ...q,
              currentDifficulty: q.suggestedDifficulty,
              recommendation: 'Keep',
              reason: 'Difficulty calibrated successfully! ✨',
            }
          : q
      )
    );
    toast.success('Recommendation applied! Question difficulty calibrated. 🎯');
  };

  const handleReviewDetails = (metric: QuestionMetric) => {
    toast.info(`Details for ${metric.id}: Pass rate is ${metric.passRate}%, Avg Time is ${metric.avgTimeSpent}s.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">AI Difficulty Calibration</h1>
          </div>
          <p className="text-muted-foreground">Analyze question performance and optimize difficulty levels</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="hover-lift border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{metrics.length}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift border-green-200 bg-green-50/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{metrics.length - needsAdjustment}</div>
                <div className="text-sm text-muted-foreground">Well-Calibrated</div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift border-yellow-200 bg-yellow-50/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-1">{needsAdjustment}</div>
                <div className="text-sm text-muted-foreground">Need Adjustment</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {metrics.map(metric => (
            <Card key={metric.id} className="hover-lift">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Question Text */}
                  <div>
                    <p className="font-medium text-foreground mb-2">{metric.questionText}</p>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Pass Rate</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-primary">{metric.passRate}%</p>
                        {metric.passRate >= 80 && <TrendingUp className="w-4 h-4 text-green-600" />}
                        {metric.passRate < 50 && <TrendingDown className="w-4 h-4 text-red-600" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Attempts</p>
                      <p className="text-2xl font-bold text-primary">{metric.attempts}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Avg Time</p>
                      <p className="text-2xl font-bold text-primary">{metric.avgTimeSpent}s</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Data Points</p>
                      <p className="text-2xl font-bold text-primary">{Math.floor(metric.attempts * 0.8)}</p>
                    </div>
                  </div>

                  {/* Difficulty Comparison */}
                  <div className="flex items-center gap-4 py-3 border-y border-border">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Current Difficulty</p>
                      <Badge className={getDifficultyColor(metric.currentDifficulty)}>
                        {metric.currentDifficulty.charAt(0).toUpperCase() + metric.currentDifficulty.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">→</div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Suggested Difficulty</p>
                      <Badge className={getDifficultyColor(metric.suggestedDifficulty)}>
                        {metric.suggestedDifficulty.charAt(0).toUpperCase() + metric.suggestedDifficulty.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      {getRecommendationIcon(metric.recommendation)}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{metric.recommendation}</p>
                        <p className="text-sm text-muted-foreground mt-1">{metric.reason}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {metric.recommendation !== 'Keep' && (
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-primary to-primary/80"
                        onClick={() => handleApplyRecommendation(metric.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Apply Recommendation
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleReviewDetails(metric)}>
                      Review Details
                    </Button>
                    <Button variant="outline" size="sm" className="ml-auto" onClick={() => toast.success('Question editor opening... ✏️')}>
                      Edit Question
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="hover-lift mt-8">
          <CardHeader>
            <CardTitle className="text-base">Calibration Methodology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Pass Rate Analysis</p>
                <p className="text-sm text-muted-foreground">Easy: 85-100%, Medium: 50-84%, Hard: 20-49%</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Time Spent Analysis</p>
                <p className="text-sm text-muted-foreground">Compares average time with difficulty expectations</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Student Feedback</p>
                <p className="text-sm text-muted-foreground">Incorporates reported difficulty and clarity ratings</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Consistency Check</p>
                <p className="text-sm text-muted-foreground">Ensures similar questions have similar difficulty ratings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
