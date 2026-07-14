import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockTestResults, mockTests } from '@/lib/mockData';
import { Download, Share2, TrendingUp, Target, CheckCircle2, Award, Zap, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';

// Confetti Component for celebrating high scores
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -20 - Math.random() * 100;
        this.size = Math.random() * 8 + 6;
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 4 + 3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    // Spawn 120 particles
    const particles: Particle[] = Array.from({ length: 120 }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeParticlesCount = 0;
      particles.forEach(p => {
        if (p.y <= canvas.height + 20) {
          p.update();
          p.draw();
          activeParticlesCount++;
        }
      });
      if (activeParticlesCount > 0) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    const timeoutId = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 6000);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
}

export default function Results() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [displayScore, setDisplayScore] = useState(0);

  if (!user || user.role !== 'student') {
    navigate('/login');
    return null;
  }

  // Get result ID from URL
  const resultId = location.split('/').pop();
  const result = mockTestResults.find(r => r.id === resultId);
  const test = mockTests.find(t => t.id === result?.testId);

  // Animate score counter
  useEffect(() => {
    if (!result) return;
    let current = 0;
    const increment = Math.max(1, result.percentage / 30);
    const timer = setInterval(() => {
      current += increment;
      if (current >= result.percentage) {
        setDisplayScore(result.percentage);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [result]);

  if (!result || !test) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-12">
          <Card className="max-w-md mx-auto border-dashed">
            <CardContent className="pt-12 text-center space-y-4">
              <div className="text-6xl">📋</div>
              <h1 className="text-2xl font-bold">Results Not Found</h1>
              <p className="text-muted-foreground">We couldn't find your test results.</p>
              <Button onClick={() => navigate('/student-dashboard')} className="hover-lift">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const isPassed = result.percentage >= test.passingScore;
  const accuracy = Math.round((result.score / result.totalScore) * 100);

  const handleExportPDF = () => {
    window.print();
    toast.success('Opening print layout for PDF generation... 🖨️');
  };

  const handleExportCSV = () => {
    const csv = [
      ['Test Results - ' + result.testTitle],
      [''],
      ['Test Name', result.testTitle],
      ['Subject', result.subject],
      ['Score', `${result.score}/${result.totalScore}`],
      ['Percentage', `${result.percentage}%`],
      ['Time Taken', `${result.timeTaken} minutes`],
      ['Date', new Date(result.completedAt).toLocaleDateString()],
      ['Status', isPassed ? 'Passed' : 'Failed'],
      [''],
      ['Strengths', result.strengths.join(', ')],
      ['Weaknesses', result.weaknesses.join(', ')],
    ];
    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.testTitle}-results.csv`;
    a.click();
    toast.success('CSV exported successfully!');
  };

  const handleShare = () => {
    const text = `I scored ${result.percentage}% on the ${result.testTitle} test on EduPath!`;
    if (navigator.share) {
      navigator.share({
        title: 'EduPath Test Results',
        text,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Results copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Confetti active={isPassed && displayScore === result.percentage} />

      <main className="container py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 animate-fadeInDown">
          <div className="text-5xl mb-2">{isPassed ? '🎉' : '💪'}</div>
          <h1 className="text-4xl md:text-5xl font-bold">
            {isPassed ? 'Congratulations!' : 'Great Effort!'}
          </h1>
          <p className="text-lg text-muted-foreground">{result.testTitle}</p>
        </div>

        {/* Score Display with Circular Progress */}
        <div className="max-w-2xl mx-auto animate-fadeInUp">
          <Card className={`border-2 shadow-lg overflow-hidden glass ${
            isPassed ? 'border-success/30 dark:border-success/20 bg-gradient-to-br from-success/5 to-transparent' : 'border-warning/30 dark:border-warning/20 bg-gradient-to-br from-warning/5 to-transparent'
          }`}>
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                {/* Circular Progress */}
                <div className="flex justify-center">
                  <div className="relative w-40 h-40">
                    {/* Background circle */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted/30"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={`${(displayScore / 100) * 440} 440`}
                        className={`transition-all duration-500 ${
                          isPassed ? 'text-success' : 'text-warning'
                        }`}
                      />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className={`text-4xl font-bold ${isPassed ? 'text-success' : 'text-warning'}`}>
                        {displayScore}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Score</p>
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                <div className="space-y-2">
                  <p className={`text-2xl font-bold ${isPassed ? 'text-success' : 'text-warning'}`}>
                    {isPassed ? 'You Passed! 🏆' : 'Keep Practicing! 💪'}
                  </p>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {isPassed
                      ? `Excellent work! You scored ${result.percentage}% and passed the test.`
                      : `You scored ${result.percentage}%. Review the areas to improve and try again!`}
                  </p>
                </div>

                {/* Score Details Grid */}
                <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-border">
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <div className="bg-success/15 p-3 rounded-lg border border-success/20">
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Correct</p>
                    <p className="text-2xl font-bold text-success">{result.score}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <div className="bg-primary/15 p-3 rounded-lg border border-primary/20">
                        <Award className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-primary">{result.totalScore}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <div className="bg-indigo-500/15 p-3 rounded-lg border border-indigo-500/20">
                        <Zap className="w-6 h-6 text-indigo-500" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-2xl font-bold text-indigo-500">{result.timeTaken}m</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center flex-wrap pt-2">
                  <Button variant="outline" onClick={handleShare} className="gap-2 hover-lift">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  <Button variant="outline" onClick={handleExportCSV} className="gap-2 hover-lift">
                    <Download className="w-4 h-4" />
                    CSV
                  </Button>
                  <Button variant="outline" onClick={handleExportPDF} className="gap-2 hover-lift">
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Section */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Strengths */}
          <Card className="hover:shadow-lg transition-all duration-300 animate-fadeInUp border-border/60 hover:border-success/30" style={{ animationDelay: '100ms' }}>
            <CardHeader className="bg-gradient-to-r from-success/10 to-transparent">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="bg-success/15 p-2 rounded-lg border border-success/20">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                Strengths
              </CardTitle>
              <CardDescription>Topics you performed well on</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {result.strengths.map((strength, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/10 hover:border-success/30 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-foreground">{strength}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card className="hover:shadow-lg transition-all duration-300 animate-fadeInUp border-border/60 hover:border-warning/30" style={{ animationDelay: '200ms' }}>
            <CardHeader className="bg-gradient-to-r from-warning/10 to-transparent">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="bg-warning/15 p-2 rounded-lg border border-warning/20">
                  <Target className="w-5 h-5 text-warning" />
                </div>
                Areas to Improve
              </CardTitle>
              <CardDescription>Topics to focus on next time</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {result.weaknesses.map((weakness, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/10 hover:border-warning/30 transition-colors">
                  <Target className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-foreground">{weakness}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Performance Breakdown */}
        <div className="max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '300ms' }}>
          <Card className="hover:shadow-lg transition-all duration-300 border-border/60">
            <CardHeader>
              <CardTitle>Performance Breakdown</CardTitle>
              <CardDescription>Detailed analysis of your test performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Accuracy</span>
                  <span className="text-sm font-bold text-primary">{accuracy}%</span>
                </div>
                <Progress value={accuracy} className="h-3" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Passing Requirement</span>
                  <span className="text-sm font-bold text-muted-foreground">{test.passingScore}%</span>
                </div>
                <Progress value={test.passingScore} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Questions Answered</p>
                  <p className="text-2xl font-bold text-primary">{result.score}/{result.totalScore}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Time Efficiency</p>
                  <p className="text-2xl font-bold text-indigo-500">
                    {Math.round((result.timeTaken / test.duration) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <div className="max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          <Card className="bg-gradient-to-br from-primary/5 to-indigo-500/5 border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>Continue your learning journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 flex-col sm:flex-row">
                <Button
                  className="flex-1 hover-lift bg-gradient-to-r from-primary to-primary/80 gap-2"
                  onClick={() => navigate(`/test-review/${resultId}`)}
                >
                  <FileText className="w-4 h-4" />
                  Review Questions
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 hover-lift"
                  onClick={() => navigate('/student-dashboard')}
                >
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 hover-lift bg-secondary/30"
                  onClick={() => navigate('/tests')}
                >
                  Take Another Test
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {isPassed
                  ? '🎯 Great job! Try a harder test to challenge yourself further.'
                  : '📚 Review the areas to improve and take the test again to boost your score!'}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
