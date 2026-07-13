import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, BookOpen, Zap, Activity } from 'lucide-react';
import { mockAdminAnalytics } from '@/lib/mockData';
import { Navbar } from '@/components/Navbar';

export default function AdminAnalytics() {
  // Daily active users trend (mock data)
  const dailyTrend = [
    { date: 'May 1', users: 120, tests: 45 },
    { date: 'May 2', users: 135, tests: 52 },
    { date: 'May 3', users: 128, tests: 48 },
    { date: 'May 4', users: 145, tests: 58 },
    { date: 'May 5', users: 152, tests: 61 },
    { date: 'May 6', users: 148, tests: 59 },
    { date: 'May 7', users: 156, tests: 65 },
    { date: 'May 8', users: 156, tests: 67 },
  ];

  // Pass rate by difficulty
  const passRateData = [
    { difficulty: 'Easy', passRate: 92 },
    { difficulty: 'Medium', passRate: 78 },
    { difficulty: 'Hard', passRate: 54 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Platform-wide statistics and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Tests Taken</p>
                  <p className="text-3xl font-bold text-primary">{mockAdminAnalytics.totalTestsTaken}</p>
                </div>
                <BookOpen className="w-8 h-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-primary">{mockAdminAnalytics.averageScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-primary">{mockAdminAnalytics.activeUsers}</p>
                </div>
                <Users className="w-8 h-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Daily Active</p>
                  <p className="text-3xl font-bold text-primary">{mockAdminAnalytics.dailyActiveUsers}</p>
                </div>
                <Activity className="w-8 h-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                  <p className="text-3xl font-bold text-primary">
                    {Math.round(mockAdminAnalytics.engagementMetrics.completionRate * 100)}%
                  </p>
                </div>
                <Zap className="w-8 h-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Trend */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle>Daily Activity Trend</CardTitle>
              <CardDescription>Active users and tests completed per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTrend}>
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
                  <Line type="monotone" dataKey="users" stroke="var(--color-primary)" strokeWidth={2} />
                  <Line type="monotone" dataKey="tests" stroke="var(--color-accent)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pass Rate by Difficulty */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle>Pass Rate by Difficulty</CardTitle>
              <CardDescription>Percentage of students passing by question difficulty</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={passRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="difficulty" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="passRate" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Question Metrics */}
        <Card className="hover-lift mb-8">
          <CardHeader>
            <CardTitle>Question Performance</CardTitle>
            <CardDescription>Top performing and struggling questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAdminAnalytics.questionMetrics.map((metric, index) => (
                <div key={index} className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-1">{metric.questionText}</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {metric.difficulty}
                        </span>
                        <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded">
                          {metric.timesAnswered} attempts
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-primary">{metric.passRate}%</p>
                      <p className="text-xs text-muted-foreground">Pass Rate</p>
                    </div>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500"
                      style={{ width: `${metric.passRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tests Per Day</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{mockAdminAnalytics.engagementMetrics.testsPerDay}</p>
              <p className="text-xs text-muted-foreground mt-1">Average tests completed daily</p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Avg Session Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {mockAdminAnalytics.engagementMetrics.averageSessionDuration}m
              </p>
              <p className="text-xs text-muted-foreground mt-1">Average minutes per session</p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Return Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {Math.round(mockAdminAnalytics.engagementMetrics.returnRate * 100)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Users returning within 7 days</p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {Math.round(mockAdminAnalytics.engagementMetrics.completionRate * 100)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Tests completed vs started</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
