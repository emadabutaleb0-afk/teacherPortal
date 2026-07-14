import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, Users, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAdvancedAnalytics() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [reportType, setReportType] = useState('overview');
  const [exportFormat, setExportFormat] = useState('csv');

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  // Mock data for charts
  const performanceData = [
    { name: 'Grade 4', avg: 72, count: 45 },
    { name: 'Grade 5', avg: 75, count: 52 },
    { name: 'Grade 6', avg: 78, count: 48 },
    { name: 'Grade 7', avg: 76, count: 55 },
    { name: 'Grade 8', avg: 80, count: 61 },
  ];

  const engagementData = [
    { date: 'Mon', tests: 145, users: 89 },
    { date: 'Tue', tests: 167, users: 102 },
    { date: 'Wed', tests: 152, users: 95 },
    { date: 'Thu', tests: 189, users: 118 },
    { date: 'Fri', tests: 201, users: 135 },
    { date: 'Sat', tests: 98, users: 62 },
    { date: 'Sun', tests: 112, users: 71 },
  ];

  const subjectDistribution = [
    { name: 'Math', value: 35, color: 'var(--color-primary)' },
    { name: 'English', value: 28, color: 'var(--color-success)' },
    { name: 'Science', value: 22, color: 'var(--color-warning)' },
    { name: 'History', value: 15, color: 'var(--color-chart-4)' },
  ];

  const questionPerformance = [
    { id: 'Q1', passRate: 92, difficulty: 'Easy' },
    { id: 'Q2', passRate: 78, difficulty: 'Medium' },
    { id: 'Q3', passRate: 65, difficulty: 'Medium' },
    { id: 'Q4', passRate: 45, difficulty: 'Hard' },
    { id: 'Q5', passRate: 38, difficulty: 'Hard' },
  ];

  const handleExport = () => {
    toast.success(`Exporting report as ${exportFormat.toUpperCase()}... 📊`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="min-h-screen">
        {/* Banner Section */}
        <div className="relative h-48 md:h-56 bg-gradient-to-r from-chart-1/20 via-chart-2/20 to-chart-3/20 border-b border-border overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="analyticsGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="60" y2="60" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                <line x1="60" y1="0" x2="0" y2="60" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="1200" height="300" fill="url(#analyticsGrid)" />
          </svg>
          
          <div className="container h-full flex items-center relative z-10">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Advanced Analytics 📊</h1>
              <p className="text-lg text-muted-foreground">Platform insights, reports, and data export</p>
            </div>
          </div>
        </div>

        <div className="container py-8 space-y-8">
          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tests</p>
                    <p className="text-3xl font-bold text-primary">1,264</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-3xl font-bold text-accent">672</p>
                  </div>
                  <Users className="w-8 h-8 text-accent/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-chart-1/10 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-3xl font-bold text-chart-1">76.4%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-chart-1/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-chart-3/10 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pass Rate</p>
                    <p className="text-3xl font-bold text-chart-3">82.1%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-chart-3/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4 flex-wrap">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Platform Overview</SelectItem>
                  <SelectItem value="performance">Performance by Grade</SelectItem>
                  <SelectItem value="engagement">Engagement Metrics</SelectItem>
                  <SelectItem value="questions">Question Analytics</SelectItem>
                </SelectContent>
              </Select>

              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleExport} className="gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Performance by Grade */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Grade Level</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="avg" fill="var(--color-primary)" radius={[6, 6, 0, 0]} name="Avg Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subject Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Tests by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={subjectDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {subjectDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Engagement */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Weekly Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="tests" stroke="var(--color-primary)" strokeWidth={2} name="Tests Taken" />
                    <Line type="monotone" dataKey="users" stroke="var(--color-success)" strokeWidth={2} name="Active Users" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Question Performance */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Question Performance</CardTitle>
                <CardDescription>Pass rates by question difficulty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {questionPerformance.map((q) => (
                    <div key={q.id} className="flex items-center gap-4">
                      <span className="font-medium min-w-12">{q.id}</span>
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            q.passRate >= 80 ? 'bg-green-500' :
                            q.passRate >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${q.passRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{q.passRate}%</span>
                      <span className="text-xs text-muted-foreground">{q.difficulty}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
