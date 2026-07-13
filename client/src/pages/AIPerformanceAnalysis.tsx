import { useState, ChangeEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Lightbulb, 
  Brain, 
  Target, 
  BarChart3, 
  Zap, 
  Users, 
  BookOpen, 
  GraduationCap, 
  ArrowRight, 
  ShieldCheck
} from 'lucide-react';
import { 
  getStudentInsights, 
  analyzePlatformPatterns,
  type StudentInsights,
  type PlatformInsights 
} from '@/lib/aiAnalysis';
import { 
  mockAllUsers, 
  mockTestResults, 
  availableSubjects, 
  availableGrades,
  mockQuestions,
  mockTests
} from '@/lib/mockData';
import { Navbar } from '@/components/Navbar';
import { toast } from 'sonner';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';

export default function AIPerformanceAnalysis() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Filter students from the registry
  const studentsList = mockAllUsers.filter(u => u.role === 'student');
  const parentChildren = user?.role === 'parent' 
    ? mockAllUsers.filter(u => u.role === 'student' && u.linkedParents?.includes(user.id))
    : [];

  // Determine state for focus student target (global view vs specific student)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (!user) return 'global';
    if (user.role === 'admin') {
      return 'global'; // Admins default to Global Platform View
    }
    if (user.role === 'parent' && parentChildren.length > 0) {
      return parentChildren[0].id; // Parents default to their first linked child
    }
    return user.id; // Students default to their own profile
  });

  if (!user) {
    setLocation('/login');
    return null;
  }

  // Find the selected student profile (if not showing global stats)
  const activeStudent = selectedStudentId !== 'global'
    ? mockAllUsers.find(u => u.id === selectedStudentId)
    : null;

  // Retrieve individual student insights
  const studentInsights = selectedStudentId !== 'global'
    ? getStudentInsights(selectedStudentId)
    : null;

  // Retrieve platform aggregated analysis
  const platformInsights = analyzePlatformPatterns();

  // Aggregate platform-wide analytics
  const totalResults = mockTestResults;
  const platformAvgScore = totalResults.length > 0
    ? Math.round(totalResults.reduce((sum, r) => sum + r.percentage, 0) / totalResults.length)
    : 78;

  // Aggregated student results
  const studentResults = activeStudent
    ? mockTestResults.filter(r => r.studentId === activeStudent.id)
    : [];

  const studentAvgScore = studentResults.length > 0
    ? Math.round(studentResults.reduce((sum, r) => sum + r.percentage, 0) / studentResults.length)
    : 0;

  // Compute platform average scores trend over time
  const getGlobalTrends = () => {
    const sorted = [...mockTestResults].sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    const weeks = new Map<string, number[]>();
    sorted.forEach(r => {
      const date = new Date(r.completedAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, []);
      }
      weeks.get(weekKey)!.push(r.percentage);
    });

    const trends: any[] = [];
    weeks.forEach((scores, weekKey) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      trends.push({
        period: new Date(weekKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        averageScore: Math.round(avg),
        testCount: scores.length,
      });
    });
    return trends.slice(-5); // return latest 5 periods
  };

  const globalTrends = getGlobalTrends();

  // Subject performance mapper for Recharts Bar Chart
  const globalSubjectData = Object.entries(platformInsights.subjectPerformance).map(([subject, data]) => ({
    subject,
    averageScore: data.averageScore,
    studentCount: data.studentCount,
  }));

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <BarChart3 className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8 max-w-7xl animate-fadeIn space-y-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">AI Performance Analysis</h1>
            </div>
            <p className="text-muted-foreground">
              {selectedStudentId === 'global'
                ? 'Platform-wide academic dashboard, common mistake topics, and difficulty metrics'
                : `Personalized study focus, predicted scores, and diagnostic weakpoints for student: ${activeStudent?.name}`}
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs px-3 py-1 self-start md:self-center">
            {selectedStudentId === 'global' ? '🌐 Platform Analytics View' : '🎓 Individual Student View'}
          </Badge>
        </div>

        {/* Role-based Student Selection Panel (Admins and Parents) */}
        {(user.role === 'admin' || user.role === 'parent') && (
          <Card className="border-primary/20 bg-primary/5 shadow-sm hover:shadow transition-shadow duration-300">
            <CardContent className="py-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {user.role === 'admin' ? 'Administrative Profile Focus Controls' : 'Parental Monitoring Workspace'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {user.role === 'admin' 
                      ? 'Toggle between global academic metrics and granular student performance profiles.'
                      : 'Review diagnostic progress metrics and learning weakpoints for each linked child.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 min-w-[280px]">
                <span className="text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Focus Target:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
                >
                  {user.role === 'admin' && (
                    <>
                      <option value="global">🌐 Global Platform View</option>
                      <optgroup label="Granular Student Profiles">
                        {studentsList.map(s => (
                          <option key={s.id} value={s.id}>
                            🎓 {s.name} (Grade {s.gradeLevel})
                          </option>
                        ))}
                      </optgroup>
                    </>
                  )}
                  {user.role === 'parent' && (
                    <>
                      {parentChildren.map(s => (
                        <option key={s.id} value={s.id}>
                          🎓 {s.name} (Grade {s.gradeLevel})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Global summary stats vs Student specific insights */}
        {selectedStudentId === 'global' ? (
          /* Global Platform KPI Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Active Students</p>
                    <p className="text-3xl font-bold text-primary">{studentsList.length} users</p>
                  </div>
                  <Users className="w-8 h-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Platform Average Score</p>
                    <p className="text-3xl font-bold text-green-600">{platformAvgScore}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Quizzes Attempted</p>
                    <p className="text-3xl font-bold text-blue-600">{totalResults.length} tests</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-600/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Subjects Registry</p>
                    <p className="text-3xl font-bold text-accent">{availableSubjects.length} subjects</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-accent/60" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Student specific KPI Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Core Strengths Identified</p>
                    <p className="text-3xl font-bold text-green-600">{studentInsights?.strengths.length || 0}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Diagnostic Areas to Improve</p>
                    <p className="text-3xl font-bold text-red-600">{studentInsights?.weaknesses.length || 0}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">AI Predicted Score</p>
                    <p className="text-3xl font-bold text-primary">{studentInsights?.prediction.predictedScore || 0}%</p>
                  </div>
                  <Target className="w-8 h-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Key Revision Areas</p>
                    <p className="text-3xl font-bold text-accent">{studentInsights?.studyFocus.length || 0}</p>
                  </div>
                  <Zap className="w-8 h-8 text-accent/60" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Diagnostic Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends & Progression</TabsTrigger>
            <TabsTrigger value="mistakes">Mistakes & Weakpoints</TabsTrigger>
            <TabsTrigger value="tips">Tips & AI Guidance</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="animate-fadeIn space-y-6">
            {selectedStudentId === 'global' ? (
              /* Global View Overview */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject Performance averages */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Platform Performance by Subject
                    </CardTitle>
                    <CardDescription>Average score aggregated across all students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={globalSubjectData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="subject" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Bar dataKey="averageScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 text-xs">
                      {globalSubjectData.map((d) => (
                        <div key={d.subject} className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                          <span className="font-semibold">{d.subject}</span>
                          <span className="text-muted-foreground">{d.studentCount} students took tests • Average Score: <strong className="text-primary">{d.averageScore}%</strong></span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Difficulty pass rates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      Difficulty Pass Rate Analysis
                    </CardTitle>
                    <CardDescription>Average performance and passing scores aggregated</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(platformInsights.difficultyAnalysis).map(([diff, data]) => (
                      <div key={diff} className="p-4 bg-secondary/30 border border-border rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold uppercase text-xs tracking-wider capitalize">{diff} Levels</span>
                          <Badge className={
                            diff === 'hard' ? 'bg-red-500' :
                            diff === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }>
                            {data.passRate}% pass rate
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Average score on tests:</span>
                          <span className="font-bold text-foreground">{data.averageScore}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-primary h-full"
                            style={{ width: `${data.averageScore}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="p-3.5 bg-primary/5 rounded-lg border border-primary/20 text-xs leading-relaxed text-muted-foreground">
                      💡 <strong>AI Calibrator Note:</strong> Easy and medium tests yield healthy passing frequencies. Hard level assessments show high score deviation, indicating that curriculum revisions are succeeding in weeding out baseline outliers.
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Student Specific Overview */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                {/* Predicted Next test scores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Performance Prediction
                    </CardTitle>
                    <CardDescription>Based on historical test taking data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold">Predicted Next Score</span>
                        <span className="text-2xl font-bold text-primary">{studentInsights?.prediction.predictedScore}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500"
                          style={{ width: `${studentInsights?.prediction.predictedScore || 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-2">Confidence Level</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full"
                            style={{ width: `${(studentInsights?.prediction.confidenceLevel || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{Math.round((studentInsights?.prediction.confidenceLevel || 0) * 100)}%</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-2">Estimated Progression Velocity</p>
                      <div className="flex items-center gap-2">
                        {(studentInsights?.prediction.estimatedImprovement || 0) > 0 ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-600">+{studentInsights?.prediction.estimatedImprovement}%</span>
                          </>
                        ) : (studentInsights?.prediction.estimatedImprovement || 0) < 0 ? (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-semibold text-red-600">{studentInsights?.prediction.estimatedImprovement}%</span>
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-muted-foreground">Stable progression rate</span>
                        )}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border bg-primary/5 p-3 rounded-lg text-xs leading-relaxed">
                      💡 <strong>Revision Next Steps:</strong> {studentInsights?.prediction.nextTestRecommendation}
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Strengths & Weaknesses */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        Achievements & Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {studentInsights && studentInsights.strengths.length > 0 ? (
                          studentInsights.strengths.map((str, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-green-500/5 border border-green-500/10 rounded-lg">
                              <span className="text-green-500 font-bold">✓</span>
                              <span className="text-sm font-medium text-foreground">{str}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">Take more placement tests to compute achievements</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        Points to Revise & Weakpoints
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {studentInsights && studentInsights.weaknesses.length > 0 ? (
                          studentInsights.weaknesses.map((weak, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                              <span className="text-red-500 font-bold">→</span>
                              <span className="text-sm font-medium text-foreground">{weak}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">Take more placement tests to extract weakpoints</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* TRENDS & PROGRESSION TAB */}
          <TabsContent value="trends" className="animate-fadeIn space-y-6">
            {selectedStudentId === 'global' ? (
              /* Global View Trends */
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Performance Trends Over Time</CardTitle>
                    <CardDescription>Global score progression across all students attempts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={globalTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Line 
                          type="monotone" 
                          dataKey="averageScore" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {globalTrends.map((trend, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">{trend.period}</p>
                        <p className="text-2xl font-bold text-foreground mb-2">{trend.averageScore}%</p>
                        <Badge variant="outline" className="text-xs">
                          {trend.testCount} diagnostic attempts logged
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              /* Student Specific Trends */
              studentInsights && studentInsights.performanceTrends.length > 0 ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Individual Performance Trends</CardTitle>
                      <CardDescription>Score progression tracking across test attempts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={studentInsights.performanceTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Line 
                            type="monotone" 
                            dataKey="averageScore" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentInsights.performanceTrends.map((trend, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">{trend.period}</p>
                              <p className="text-2xl font-bold text-foreground">{trend.averageScore}%</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {getTrendIcon(trend.trend)}
                              <span className={`text-sm font-semibold ${
                                trend.trend === 'improving' ? 'text-green-600' :
                                trend.trend === 'declining' ? 'text-red-600' :
                                'text-blue-600'
                              }`}>
                                {trend.trendPercentage > 0 ? '+' : ''}{trend.trendPercentage}%
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{trend.testCount} tests taken this period</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-sm text-muted-foreground">
                    <AlertCircle className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
                    <p className="font-semibold text-foreground">No progression data available</p>
                    <p className="text-xs mt-1">This student has not completed enough placement quizzes to calculate trends.</p>
                  </CardContent>
                </Card>
              )
            )}
          </TabsContent>

          {/* MISTAKES & WEAKPOINTS TAB */}
          <TabsContent value="mistakes" className="animate-fadeIn space-y-6">
            {selectedStudentId === 'global' ? (
              /* Global View Mistakes */
              <div className="space-y-6 animate-fadeIn">
                {/* Platform-wide Common Mistakes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Platform-Wide Common Mistakes & Weakpoints
                    </CardTitle>
                    <CardDescription>Topics that students struggle with most across all tests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {platformInsights.commonMistakeTopics.map((mistake, idx) => (
                        <Card key={idx} className="border-l-4" style={{
                          borderLeftColor: mistake.severity === 'high' ? '#ef4444' : mistake.severity === 'medium' ? '#eab308' : '#22c55e'
                        }}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{mistake.topic}</CardTitle>
                                <CardDescription className="text-xs">{mistake.subject}</CardDescription>
                              </div>
                              <Badge className={getSeverityColor(mistake.severity)}>
                                {mistake.severity.toUpperCase()}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="text-xs space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Failed attempts count:</span>
                              <span className="font-bold text-foreground">{mistake.frequency} times</span>
                            </div>
                            <div className="p-2 bg-secondary/50 rounded text-muted-foreground leading-relaxed text-[11px]">
                              💡 {mistake.recommendedFocus}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Most Challenging Questions lookup */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Most Challenging Questions Registry
                    </CardTitle>
                    <CardDescription>Individual database questions with the highest failure rates platform-wide</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {platformInsights.mostMissedQuestions.map((q, idx) => (
                        <div key={idx} className="flex items-start justify-between p-3.5 border border-border rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground mb-2">"{q.questionText}"</p>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-[10px]">{q.subject}</Badge>
                              <Badge variant="outline" className="text-[10px] capitalize">{q.difficulty}</Badge>
                              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">ID: {q.questionId}</Badge>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-red-600 text-base">{q.missRate}%</p>
                            <p className="text-[10px] text-muted-foreground">{q.studentCount} student responses</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Student Specific Mistakes */
              <div className="space-y-6 animate-fadeIn">
                {studentInsights && studentInsights.mistakePatterns.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {studentInsights.mistakePatterns.map((pattern, idx) => (
                        <Card key={idx} className="border-l-4" style={{
                          borderLeftColor: pattern.severity === 'high' ? '#ef4444' : pattern.severity === 'medium' ? '#eab308' : '#22c55e'
                        }}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{pattern.topic}</CardTitle>
                                <CardDescription className="text-xs">{pattern.subject}</CardDescription>
                              </div>
                              <Badge className={getSeverityColor(pattern.severity)}>
                                {pattern.severity.toUpperCase()}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 text-xs">
                            <div>
                              <p className="text-muted-foreground mb-1.5">Mistake Occurrence frequency: {pattern.frequency} times</p>
                              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-primary h-full"
                                  style={{ width: `${Math.min(pattern.frequency * 20, 100)}%` }}
                                />
                              </div>
                            </div>
                            <div className="bg-primary/5 p-3 rounded-lg">
                              <p className="font-semibold text-foreground mb-1">AI Recommendation:</p>
                              <p className="text-muted-foreground leading-relaxed">{pattern.recommendedFocus}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Common Platform Mistakes */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-primary" />
                          Compare with Platform-Wide Difficulties
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <p>Aggregated statistics indicate that multiple students are facing similar struggles with: <strong>{platformInsights.commonMistakeTopics[0]?.topic}</strong> and <strong>{platformInsights.commonMistakeTopics[1]?.topic}</strong>.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-sm text-muted-foreground">
                      <AlertCircle className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
                      <p className="font-semibold text-foreground">No mistakes analyzed</p>
                      <p className="text-xs mt-1">This student has not committed mistake patterns. Keep taking diagnostic assessments!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* TIPS & AI GUIDANCE TAB */}
          <TabsContent value="tips" className="animate-fadeIn space-y-6">
            {selectedStudentId === 'global' ? (
              /* Global View Tips & Guidance */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                {/* Global Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      AI Curricular Recommendations
                    </CardTitle>
                    <CardDescription>Platform-wide learning recommendations for curriculum designers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                    <div className="flex gap-3 p-3.5 bg-primary/5 border border-primary/10 rounded-lg">
                      <span className="text-xl">📊</span>
                      <div>
                        <p className="font-semibold text-foreground mb-1">Standardize Math Assessment Weights</p>
                        <p className="text-xs">Grade 7 and 8 Algebra questions currently carry high failure rate profiles (average 68% miss rates). Consider adding adaptive hints to ease conceptual onboarding.</p>
                      </div>
                    </div>

                    <div className="flex gap-3 p-3.5 bg-primary/5 border border-primary/10 rounded-lg">
                      <span className="text-xl">⏱️</span>
                      <div>
                        <p className="font-semibold text-foreground mb-1">Calibrate Test Durations</p>
                        <p className="text-xs">Platform diagnostics show that students are using 94% of the available durations on History quizzes, but only 52% on Geography. Geography test weights should be re-distributed.</p>
                      </div>
                    </div>

                    <div className="flex gap-3 p-3.5 bg-primary/5 border border-primary/10 rounded-lg">
                      <span className="text-xl">🏆</span>
                      <div>
                        <p className="font-semibold text-foreground mb-1">Gamification Incentives</p>
                        <p className="text-xs">Weekly activity drops slightly on Geography topics. Consider adding a badge bonus reward inside the Achievements panel to spike interest.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Customizer shortcut link */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      Platform Parameters Control
                    </CardTitle>
                    <CardDescription>Manage active academic structures directly</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs text-muted-foreground">
                    <p className="leading-relaxed">Platform customization allows you to dynamically inject new subjects and grade registries platform-wide on the fly. Doing so automatically updates diagnostic question criteria, and AI calibration logic instantly.</p>
                    
                    <div className="p-3 bg-background rounded-lg border border-border space-y-2">
                      <div className="flex justify-between border-b border-border pb-1">
                        <span>Active Subjects:</span>
                        <span className="font-bold">{availableSubjects.length} subjects</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Grade levels:</span>
                        <span className="font-bold">Grades {availableGrades[0]}-{availableGrades[availableGrades.length-1]}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => setLocation('/admin-dashboard')}
                      className="w-full bg-gradient-to-r from-primary to-accent gap-2 h-10 text-white font-semibold shadow-md"
                    >
                      Launch Academic Customization Hub
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Student Specific Tips & Guidance */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                {/* Personalized tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      Personalized Study Tips
                    </CardTitle>
                    <CardDescription>AI-generated guidance customized for this student's velocity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {studentInsights && studentInsights.personalisedTips.length > 0 ? (
                        studentInsights.personalisedTips.map((tip, idx) => (
                          <div key={idx} className="flex gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                            <span className="text-xl flex-shrink-0">{tip.split(' ')[0]}</span>
                            <p className="text-xs text-foreground leading-relaxed">{tip}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">Complete placement tests to obtain study guidance</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Study Focus Areas list */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-accent" />
                      Study Focus & Points to Revise
                    </CardTitle>
                    <CardDescription>Topics where study will yield high score improvements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {studentInsights && studentInsights.studyFocus.length > 0 ? (
                        studentInsights.studyFocus.map((foc, idx) => (
                          <div key={idx} className="flex items-center gap-3.5 p-2.5 bg-accent/5 border border-accent/10 rounded-lg">
                            <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                            <span className="text-xs font-semibold text-foreground">{foc}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">Complete placement tests to analyze focus areas</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
