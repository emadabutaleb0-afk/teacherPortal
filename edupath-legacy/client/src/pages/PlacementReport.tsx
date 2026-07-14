import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockTestResults, generatePlacementRecommendation } from '@/lib/mockData';
import { Download, TrendingUp, AlertCircle, CheckCircle, ArrowRight, Share2, Brain } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function PlacementReport() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Read query params if any
  const searchParams = new URLSearchParams(window.location.search);
  const scoreParam = searchParams.get('score');
  const correctParam = searchParams.get('correct');
  const totalParam = searchParams.get('total');

  // Authentication check (bypass if we have score query param, i.e. guest completed test)
  if (!user && !scoreParam) {
    navigate('/login');
    return null;
  }

  const currentUser = user || {
    id: 'guest-student',
    name: 'Guest Student',
    email: 'guest@edupath.edu',
    role: 'student' as const,
  };

  // Generate dynamic placement result for guest OR find the latest placement test result
  const guestResult = scoreParam ? {
    id: 'guest-placement-result',
    studentId: 'guest-student',
    testId: 'test-005',
    testTitle: 'Math Placement Test',
    subject: 'Mathematics',
    score: parseInt(correctParam || '0'),
    totalScore: parseInt(totalParam || '15'),
    percentage: parseInt(scoreParam || '0'),
    timeTaken: 15,
    completedAt: new Date().toISOString(),
    answers: {},
    strengths: ['Algebra', 'Percentages', 'Problem-solving'],
    weaknesses: ['Word problems', 'Geometry'],
    isPlacementTest: true,
    placementRecommendation: generatePlacementRecommendation(
      parseInt(scoreParam || '0'),
      'Mathematics',
      8, // default starting grade
      ['Algebra', 'Percentages', 'Problem-solving'],
      ['Word problems', 'Geometry']
    )
  } : null;

  const placementResult = guestResult || mockTestResults.find(
    r => r.isPlacementTest && r.studentId === currentUser.id
  );

  if (!placementResult) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-12">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No placement test results found</p>
              <Button onClick={() => navigate('/')}>
                Back to Homepage
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const recommendation = placementResult.placementRecommendation;

  // Find previous best test score (excluding placement test itself)
  const previousBestResult = mockTestResults
    .filter(r => r.studentId === currentUser.id && !r.isPlacementTest)
    .sort((a, b) => b.percentage - a.percentage)[0];

  const previousBestTitle = previousBestResult?.testTitle || 'None';
  const previousBestPercentage = previousBestResult?.percentage || 0;

  const handleExportPDF = () => {
    window.print();
    toast.success('Opening print layout for PDF generation... 🖨️');
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [
          ["Placement Report", placementResult.testTitle],
          ["Student ID", currentUser.id],
          ["Student Name", currentUser.name],
          ["Overall Score", `${placementResult.percentage}%`],
          ["Correct Answers", `${placementResult.score}/${placementResult.totalScore}`],
          ["Time Taken", `${placementResult.timeTaken} minutes`],
          ["Recommended Level", `Grade ${recommendation?.recommendedGrade || 'N/A'}`],
          ["Confidence", `${Math.round((recommendation?.confidenceScore || 0) * 100)}%`],
          ["Strengths", recommendation?.strengths.join('; ') || 'N/A'],
          ["Areas to Improve", recommendation?.areasToImprove.join('; ') || 'N/A']
        ].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `placement_report_${placementResult.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Placement report exported as CSV! 📊');
  };

  const handleShareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: `EduPath Placement Report - ${currentUser.name}`,
        text: `Check out my placement recommendation of Grade ${recommendation?.recommendedGrade} in ${recommendation?.subject}!`,
        url: window.location.href,
      })
      .then(() => toast.success('Report shared successfully! 🔗'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Report link copied to clipboard! 🔗');
    }
  };

  // Construct cognitive profiling data for the Radar Chart
  const cognitiveData = [
    { skill: 'Logic & Reasoning', score: Math.min(100, Math.max(30, placementResult.percentage + 5)) },
    { skill: 'Pacing & Speed', score: Math.min(100, Math.max(30, Math.round(100 - (placementResult.timeTaken / 40) * 80))) },
    { skill: 'Accuracy Rate', score: Math.min(100, Math.max(30, Math.round((placementResult.score / placementResult.totalScore) * 100))) },
    { skill: 'Recall Speed', score: Math.min(100, Math.max(30, placementResult.percentage - 3)) },
    { skill: 'Focus & Attention', score: Math.min(100, Math.max(30, placementResult.percentage + (placementResult.percentage < 70 ? 12 : 3))) }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8 space-y-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div>
            <h1 className="text-3xl font-bold">Placement Report</h1>
            <p className="text-muted-foreground">
              {placementResult.testTitle} • {new Date(placementResult.completedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF} className="gap-2 hover-lift">
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button variant="outline" onClick={handleExportCSV} className="gap-2 hover-lift">
              <Download className="w-4 h-4" />
              CSV
            </Button>
          </div>
        </div>

        {!user && (
          <Card className="border-2 border-primary bg-primary/5 shadow-md animate-fadeIn mb-6">
            <CardContent className="pt-6 pb-6 text-center space-y-4">
              <h3 className="text-xl font-bold text-primary flex items-center justify-center gap-2">
                🎉 Placement Test Completed! Save Your Progress!
              </h3>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                Sign up for a free account to save this placement report, track your learning progress, and unlock more than 40+ practice tests tailored just for you.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/register')} className="bg-gradient-to-r from-primary to-primary/80 hover-lift">
                  Register Free
                </Button>
                <Button variant="outline" onClick={() => navigate('/login')} className="hover-lift">
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score Overview */}
        <Card className="border-2 border-primary/30 dark:border-primary/25 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Score Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-4xl md:text-5xl font-extrabold text-primary mb-2">{placementResult.percentage}%</p>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Overall Score</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-extrabold text-success mb-2">{placementResult.score}</p>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Correct Answers</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-extrabold text-indigo-500 mb-2">{placementResult.timeTaken}</p>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Minutes Taken</p>
              </div>
            </div>

            <Progress value={placementResult.percentage} className="h-3" />

            <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-xl">
              <div>
                <p className="font-bold text-success text-sm">Status</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {placementResult.percentage >= 60 ? 'Successfully passed base validation level' : 'Needs foundational practice'}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </CardContent>
        </Card>

        {/* Placement Recommendation */}
        {recommendation && (
          <Card className="border-2 border-indigo-500/30 dark:border-indigo-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Placement Recommendation
              </CardTitle>
              <CardDescription>Tailored learning pathway recommendation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 bg-primary/5 border border-primary/10 rounded-xl relative overflow-hidden group hover:shadow-md transition-all">
                  <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Recommended Level</p>
                  <p className="text-3xl font-extrabold text-primary">Grade {recommendation.recommendedGrade}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Confidence Interval: <span className="text-primary font-semibold">{Math.round(recommendation.confidenceScore * 100)}%</span>
                  </p>
                </div>

                <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl group hover:shadow-md transition-all">
                  <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-1">Subject Focus</p>
                  <p className="text-3xl font-extrabold text-indigo-500">{recommendation.subject}</p>
                </div>
              </div>

              {/* Strengths */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <h3 className="font-bold text-foreground">Identified Strengths</h3>
                </div>
                <div className="grid gap-2">
                  {recommendation.strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-success/5 rounded-lg border border-success/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                      <p className="text-sm text-foreground/90 font-medium">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas to Improve */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  <h3 className="font-bold text-foreground">Areas to Focus & Improve</h3>
                </div>
                <div className="grid gap-2">
                  {recommendation.areasToImprove.map((area, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-warning/5 rounded-lg border border-warning/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0" />
                      <p className="text-sm text-foreground/90 font-medium">{area}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Next Steps */}
              <div className="space-y-3">
                <h3 className="font-bold text-foreground">Suggested Next Steps</h3>
                <div className="grid gap-3">
                  {recommendation.suggestedNextSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 p-3.5 bg-primary/5 rounded-xl border border-primary/10">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-foreground/80 font-medium pt-0.5 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Analysis with Radar Chart */}
        <Card className="border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Cognitive Profile Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Radar Chart */}
              <div className="flex justify-center min-h-[220px]">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={cognitiveData}>
                    <PolarGrid stroke="var(--color-border)" opacity={0.5} />
                    <PolarAngleAxis dataKey="skill" stroke="var(--color-muted-foreground)" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={8} opacity={0.5} />
                    <Radar name="Skills Profile" dataKey="score" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Accuracy by Difficulty */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Accuracy by Difficulty</h3>
                <div className="space-y-3">
                  {['easy', 'medium', 'hard'].map((difficulty, idx) => {
                    const accuracy = Math.max(0, Math.min(100, placementResult.percentage + (5 - idx * 8)));
                    return (
                      <div key={difficulty} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="capitalize">{difficulty}</span>
                          <span className="text-muted-foreground">{accuracy}%</span>
                        </div>
                        <Progress value={accuracy} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison with Previous Tests */}
        <Card className="border-border/60 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Progress Comparison</CardTitle>
            <CardDescription>Comparison with your historical scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-4 bg-secondary/35 border border-border/40 rounded-xl">
                <div>
                  <p className="font-semibold text-sm">Current Placement Test</p>
                  <p className="text-xs text-muted-foreground">{placementResult.testTitle}</p>
                </div>
                <Badge className="bg-primary/15 text-primary border-primary/25 font-bold">{placementResult.percentage}%</Badge>
              </div>
              {previousBestResult && (
                <div className="flex items-center justify-between p-4 bg-secondary/35 border border-border/40 rounded-xl">
                  <div>
                    <p className="font-semibold text-sm">Previous Best Test</p>
                    <p className="text-xs text-muted-foreground">{previousBestTitle}</p>
                  </div>
                  <Badge variant="outline" className="font-bold">{previousBestPercentage}%</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/60 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-bold text-sm mb-1">Continue Learning</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Challenge yourself and complete adaptive practice assessments.
              </p>
              <Button className="w-full hover-lift" onClick={() => navigate('/student-dashboard')}>
                View Practice Tests
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-bold text-sm mb-1">Share Report</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Share this report with your teachers or parents for alignment.
              </p>
              <Button variant="outline" className="w-full hover-lift gap-2" onClick={handleShareReport}>
                <Share2 className="w-4 h-4" />
                Share Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
