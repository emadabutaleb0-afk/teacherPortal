import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockAdminStats, mockTestResults, mockTests, mockQuestions, availableSubjects, availableGrades, addSubject, addGrade } from '@/lib/mockData';
import { Users, BookOpen, HelpCircle, TrendingUp, BarChart3, Settings, AlertCircle, Brain, Target, Plus, ShieldAlert } from 'lucide-react';
import { analyzePlatformPatterns } from '@/lib/aiAnalysis';
import { useState, ChangeEvent } from 'react';
import { syncAcademicRegistry } from '@/lib/dbSync';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const platformInsights = analyzePlatformPatterns();

  // Platform customization states
  const [subjectsList, setSubjectsList] = useState<string[]>([...availableSubjects]);
  const [gradesList, setGradesList] = useState<number[]>([...availableGrades]);
  const [newSubject, setNewSubject] = useState('');
  const [newGrade, setNewGrade] = useState('');

  const handleAddSubject = async () => {
    if (!newSubject.trim()) {
      toast.error('Subject name cannot be empty');
      return;
    }
    const success = addSubject(newSubject.trim());
    if (success) {
      await syncAcademicRegistry('subject', newSubject.trim());
      setSubjectsList([...availableSubjects]);
      setNewSubject('');
      toast.success(`Subject "${newSubject.trim()}" added to platform successfully! 📚`);
    } else {
      toast.error('Subject already exists');
    }
  };

  const handleAddGrade = async () => {
    const gradeNum = parseInt(newGrade);
    if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
      toast.error('Please enter a valid Grade Level (1-12)');
      return;
    }
    const success = addGrade(gradeNum);
    if (success) {
      await syncAcademicRegistry('grade', `Grade ${gradeNum}`);
      setGradesList([...availableGrades]);
      setNewGrade('');
      toast.success(`Grade ${gradeNum} added to platform successfully! 🎓`);
    } else {
      toast.error('Grade level already exists');
    }
  };

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="min-h-screen">
        {/* Banner Section */}
        <div className="relative h-48 md:h-56 bg-gradient-to-r from-chart-3/20 via-primary/20 to-accent/20 border-b border-border overflow-hidden">
          {/* SVG Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="adminGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 0 0 L 60 0 L 60 60 L 0 60 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="1200" height="300" fill="url(#adminGrid)" />
          </svg>
          
          {/* Content */}
          <div className="container h-full flex items-center relative z-10">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard ⚙️</h1>
              <p className="text-lg text-muted-foreground">Manage tests, questions, and monitor platform activity</p>
            </div>
          </div>
        </div>

        <div className="container py-8 space-y-8 animate-slide-up">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 hover:shadow-lg transition-all duration-300 hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold text-primary">{mockAdminStats.totalStudents}</p>
                </div>
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/20 hover:shadow-lg transition-all duration-300 hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tests</p>
                  <p className="text-3xl font-bold text-accent">{mockAdminStats.totalTests}</p>
                </div>
                <div className="p-3 bg-accent/20 rounded-lg">
                  <BookOpen className="w-8 h-8 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-1/10 to-transparent border-chart-1/20 hover:shadow-lg transition-all duration-300 hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                  <p className="text-3xl font-bold text-chart-1">{mockAdminStats.totalQuestions}</p>
                </div>
                <div className="p-3 bg-chart-1/20 rounded-lg">
                  <HelpCircle className="w-8 h-8 text-chart-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-3/10 to-transparent border-chart-3/20 hover:shadow-lg transition-all duration-300 hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-3xl font-bold text-chart-3">{mockAdminStats.averageScore}%</p>
                </div>
                <div className="p-3 bg-chart-3/20 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-2/10 to-transparent border-chart-2/20 hover:shadow-lg transition-all duration-300 hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Today</p>
                  <p className="text-2xl font-bold">{mockAdminStats.activeStudentsToday}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-chart-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Platform Insights */}
        <div className="grid lg:grid-cols-2 gap-6" style={{ marginTop: '2rem' }}>
          {/* Platform-Wide Common Mistakes */}
          <Card className="hover:shadow-lg transition-shadow border border-destructive/20 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Common Mistake Topics
              </CardTitle>
              <CardDescription>Topics students struggle with platform-wide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {platformInsights.commonMistakeTopics.slice(0, 5).map((mistake, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                  <div>
                    <p className="font-semibold text-sm">{mistake.topic}</p>
                    <p className="text-xs text-muted-foreground">{mistake.subject}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      mistake.severity === 'high' ? 'bg-destructive text-destructive-foreground' :
                      mistake.severity === 'medium' ? 'bg-warning text-warning-foreground' :
                      'bg-success text-success-foreground'
                    }>
                      {mistake.severity}
                    </Badge>
                    <p className="text-xs font-semibold mt-1">{mistake.frequency}x</p>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate('/ai/performance-analysis')}
              >
                View Detailed Analysis
              </Button>
            </CardContent>
          </Card>

          {/* Subject Performance Analysis */}
          <Card className="hover:shadow-lg transition-shadow border border-primary/20 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Subject Performance
              </CardTitle>
              <CardDescription>Average scores by subject</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(platformInsights.subjectPerformance).map(([subject, data]) => (
                <div key={subject} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">{subject}</p>
                    <span className="text-sm font-bold text-primary">{data.averageScore}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/80 h-full"
                      style={{ width: `${data.averageScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{data.studentCount} students</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Difficulty Analysis & Most Missed Questions */}
        <div className="grid lg:grid-cols-2 gap-6" style={{ marginTop: '2rem' }}>
          {/* Difficulty Analysis */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Performance by Difficulty
              </CardTitle>
              <CardDescription>Pass rates and average scores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(platformInsights.difficultyAnalysis).map(([difficulty, data]) => (
                <div key={difficulty} className="p-3 bg-secondary/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold capitalize">{difficulty} Tests</p>
                    <span className="text-sm font-bold">{data.passRate}% Pass Rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-full"
                        style={{ width: `${data.averageScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{data.averageScore}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Most Missed Questions */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Most Challenging Questions
              </CardTitle>
              <CardDescription>Questions with highest miss rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {platformInsights.mostMissedQuestions.slice(0, 5).map((q, idx) => (
                <div key={idx} className="p-2 bg-warning/5 rounded border border-warning/10 text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-xs flex-1">{q.questionText}</p>
                    <span className="text-destructive font-bold ml-2">{q.missRate}%</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">{q.subject}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{q.difficulty}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Centralized Academic Customization Hub */}
        <Card className="border-2 border-primary/20 hover:shadow-xl transition-all duration-300" style={{ marginTop: '2rem' }}>
          <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Academic Customization & Controls 🛠️</CardTitle>
                <CardDescription>Configure subjects, grade levels, and core platform registries dynamically</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Subjects customizer */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    Subject Registry
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Add or review active course subjects available platform-wide</p>
                </div>
                
                <div className="flex flex-wrap gap-2 p-4 bg-muted/40 rounded-lg border border-border">
                  {subjectsList.map((subj) => (
                    <Badge 
                      key={subj} 
                      className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/25 transition-all cursor-default"
                    >
                      {subj}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Science, Computing, Spanish"
                    value={newSubject}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewSubject(e.target.value)}
                    className="max-w-[280px]"
                  />
                  <Button onClick={handleAddSubject} className="gap-1 bg-primary text-white hover:brightness-110">
                    <Plus className="w-4 h-4" />
                    Add Subject
                  </Button>
                </div>
              </div>

              {/* Grades customizer */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                    Grade Registry
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Configure academic grade-levels available for tests and students</p>
                </div>

                <div className="flex flex-wrap gap-2 p-4 bg-muted/40 rounded-lg border border-border">
                  {gradesList.map((grade) => (
                    <Badge 
                      key={grade} 
                      className="px-3 py-1 text-xs font-bold border-accent/20 text-accent-foreground bg-accent/15 hover:bg-accent/25 transition-colors cursor-default"
                    >
                      Grade {grade}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. 3, 13"
                    type="number"
                    value={newGrade}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewGrade(e.target.value)}
                    className="max-w-[150px]"
                  />
                  <Button onClick={handleAddGrade} variant="outline" className="gap-1 border-accent text-accent hover:bg-accent/5">
                    <Plus className="w-4 h-4" />
                    Add Grade
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Tools */}
        <div className="grid md:grid-cols-2 gap-6" style={{ marginTop: '2rem' }}>
          {/* Question Bank Manager */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Question Bank
              </CardTitle>
              <CardDescription>
                {mockQuestions.length} questions across all subjects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Easy Questions</span>
                  <span className="font-semibold">{mockQuestions.filter(q => q.difficulty === 'easy').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medium Questions</span>
                  <span className="font-semibold">{mockQuestions.filter(q => q.difficulty === 'medium').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hard Questions</span>
                  <span className="font-semibold">{mockQuestions.filter(q => q.difficulty === 'hard').length}</span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate('/admin/questions')}
              >
                Manage Questions
              </Button>
            </CardContent>
          </Card>

          {/* Test Creator */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Test Management
              </CardTitle>
              <CardDescription>
                {mockTests.length} active tests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Easy Tests</span>
                  <span className="font-semibold">{mockTests.filter(t => t.difficulty === 'easy').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medium Tests</span>
                  <span className="font-semibold">{mockTests.filter(t => t.difficulty === 'medium').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hard Tests</span>
                  <span className="font-semibold">{mockTests.filter(t => t.difficulty === 'hard').length}</span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate('/admin/tests')}
              >
                Manage Tests
              </Button>
            </CardContent>
          </Card>

          {/* Reports */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Reports & Analytics
              </CardTitle>
              <CardDescription>
                View student results and insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Test Results</span>
                  <span className="font-semibold">{mockTestResults.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Score</span>
                  <span className="font-semibold">
                    {mockTestResults.length > 0
                      ? Math.round(
                          mockTestResults.reduce((sum, r) => sum + r.percentage, 0) /
                            mockTestResults.length
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate('/admin/reports')}
              >
                View Reports
              </Button>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </CardTitle>
              <CardDescription>
                Configure platform settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Status</span>
                  <span className="font-semibold text-success">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/admin/platform-settings')}
              >
                Platform Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links to Admin Features */}
        <div className="grid md:grid-cols-3 gap-4" style={{ marginTop: '2rem' }}>
          <Button
            variant="outline"
            className="h-auto py-4"
            onClick={() => navigate('/admin/advanced-users')}
          >
            <div className="text-left">
              <p className="font-semibold">Advanced User Management</p>
              <p className="text-xs text-muted-foreground">Manage users & permissions</p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4"
            onClick={() => navigate('/admin/content-management')}
          >
            <div className="text-left">
              <p className="font-semibold">Content Management</p>
              <p className="text-xs text-muted-foreground">Manage tests & content</p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4"
            onClick={() => navigate('/admin/communication')}
          >
            <div className="text-left">
              <p className="font-semibold">Communication Tools</p>
              <p className="text-xs text-muted-foreground">Send announcements</p>
            </div>
          </Button>
        </div>
        </div>
      </main>
    </div>
  );
}
