import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { mockProgressHistory, mockLearningGoals } from '@/lib/mockData';
import { Navbar } from '@/components/Navbar';

export default function ProgressTimeline() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Prepare chart data
  const chartData = mockProgressHistory.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: entry.percentage,
    subject: entry.subject,
  }));

  // Subject performance data
  const subjectData = mockProgressHistory.reduce(
    (acc, entry) => {
      const existing = acc.find(s => s.subject === entry.subject);
      if (existing) {
        existing.scores.push(entry.percentage);
        existing.count += 1;
      } else {
        acc.push({
          subject: entry.subject,
          scores: [entry.percentage],
          count: 1,
        });
      }
      return acc;
    },
    [] as Array<{ subject: string; scores: number[]; count: number }>
  );

  const subjectChartData = subjectData.map(s => ({
    name: s.subject,
    average: Math.round(s.scores.reduce((a, b) => a + b, 0) / s.count),
    tests: s.count,
  }));

  // Class average comparison (mock)
  const classAverageData = [
    { subject: 'Mathematics', student: 94, classAverage: 82 },
    { subject: 'English', student: 92, classAverage: 85 },
    { subject: 'Science', student: 88, classAverage: 80 },
    { subject: 'History', student: 85, classAverage: 78 },
    { subject: 'Geography', student: 87, classAverage: 79 },
  ];

  const getGoalStatus = (goal: any) => {
    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return {
      daysLeft,
      isOnTrack: goal.currentPercentage >= goal.targetPercentage * 0.8,
      isAchieved: goal.achieved,
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container max-w-6xl py-8 space-y-8">
        {/* Header */}
        <div className="animate-fadeIn">
          <h1 className="text-4xl font-bold text-foreground mb-1">Progress Timeline</h1>
          <p className="text-muted-foreground">Track your learning journey and set goals</p>
        </div>

        {/* Goals Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Learning Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockLearningGoals.map(goal => {
              const status = getGoalStatus(goal);
              return (
                <Card
                  key={goal.id}
                  className={`hover-lift transition-all border-2 ${
                    status.isAchieved
                      ? 'border-success/20 dark:border-success/10 bg-success/5'
                      : status.isOnTrack
                        ? 'border-primary/20 bg-primary/5'
                        : 'border-warning/20 dark:border-warning/10 bg-warning/5'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{goal.subject}</CardTitle>
                        <CardDescription className="text-xs">
                          Target: {goal.targetPercentage}% by {new Date(goal.deadline).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {status.isAchieved ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : status.isOnTrack ? (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-warning" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-semibold text-muted-foreground">Progress</span>
                        <span className={`text-sm font-bold ${
                          status.isAchieved
                            ? 'text-success'
                            : status.isOnTrack
                              ? 'text-primary'
                              : 'text-warning'
                        }`}>{goal.currentPercentage}%</span>
                      </div>
                      <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden border border-border/40">
                        <div
                          className={`h-full transition-all duration-500 ${
                            status.isAchieved
                              ? 'bg-success'
                              : status.isOnTrack
                                ? 'bg-primary'
                                : 'bg-warning'
                          }`}
                          style={{ width: `${Math.min(goal.currentPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {status.daysLeft > 0
                        ? `${status.daysLeft} days remaining`
                        : status.isAchieved
                          ? 'Goal achieved! 🎉'
                          : 'Deadline passed'}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Timeline */}
          <Card className="hover-lift border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                Score Timeline
              </CardTitle>
              <CardDescription>Your test scores over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" domain={[0, 100]} fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      color: 'var(--color-foreground)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-primary)"
                    dot={{ fill: 'var(--color-primary)', r: 4 }}
                    activeDot={{ r: 6 }}
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <Card className="hover-lift border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Subject Performance</CardTitle>
              <CardDescription>Average scores by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" domain={[0, 100]} fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="average" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Class Comparison */}
        <Card className="hover-lift border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Your Performance vs Class Average</CardTitle>
            <CardDescription>See how you compare to your classmates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classAverageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="subject" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" domain={[0, 100]} fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                  }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="student" fill="var(--color-primary)" name="Your Score" radius={[6, 6, 0, 0]} maxBarSize={35} />
                <Bar dataKey="classAverage" fill="var(--color-chart-4)" name="Class Average" radius={[6, 6, 0, 0]} maxBarSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Tests */}
        <Card className="hover-lift border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-primary" />
              Recent Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {mockProgressHistory.slice(0, 8).map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-secondary/35 border border-border/40 rounded-xl hover:bg-secondary/60 transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-semibold text-foreground truncate">{entry.testTitle}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{entry.subject}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-primary text-base">{entry.percentage}%</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
