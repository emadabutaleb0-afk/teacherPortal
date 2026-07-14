import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { mockTestResults, mockTests } from '@/lib/mockData';
import { Download, Filter, TrendingUp, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminReports() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [filterTest, setFilterTest] = useState('all-tests');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [searchStudent, setSearchStudent] = useState('');

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  let filteredResults = mockTestResults;

  if (filterTest && filterTest !== 'all-tests') {
    filteredResults = filteredResults.filter(r => r.testId === filterTest);
  }

  if (searchStudent) {
    filteredResults = filteredResults.filter(r =>
      r.studentId.toLowerCase().includes(searchStudent.toLowerCase())
    );
  }

  const stats = {
    totalTests: filteredResults.length,
    averageScore: filteredResults.length > 0
      ? Math.round(filteredResults.reduce((sum, r) => sum + r.percentage, 0) / filteredResults.length)
      : 0,
    passRate: filteredResults.length > 0
      ? Math.round((filteredResults.filter(r => r.percentage >= 60).length / filteredResults.length) * 100)
      : 0,
    topScore: filteredResults.length > 0
      ? Math.max(...filteredResults.map(r => r.percentage))
      : 0,
  };

  const handleExportReport = () => {
    const csv = [
      ['Student Test Results Report'],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['Student ID', 'Test Name', 'Subject', 'Score', 'Percentage', 'Date'],
      ...filteredResults.map(r => [
        r.studentId,
        r.testTitle,
        r.subject,
        `${r.score}/${r.totalScore}`,
        `${r.percentage}%`,
        new Date(r.completedAt).toLocaleDateString(),
      ]),
    ];

    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Report exported successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8 space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">View and analyze student test results</p>
          </div>
          <Button onClick={handleExportReport} className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Tests Taken</p>
                <p className="text-3xl font-bold">{stats.totalTests}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-3xl font-bold">{stats.averageScore}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className="text-3xl font-bold">{stats.passRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Highest Score</p>
                <p className="text-3xl font-bold">{stats.topScore}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Test</Label>
                <Select value={filterTest} onValueChange={setFilterTest}>
                  <SelectTrigger>
                    <SelectValue placeholder="All tests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-tests">All Tests</SelectItem>
                    {mockTests.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search Student</Label>
                <Input
                  placeholder="Student ID or name"
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setFilterTest('all-tests');
                    setFilterDateRange('all');
                    setSearchStudent('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <div className="space-y-3">
          {filteredResults.map((result) => (
            <Card key={result.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{result.testTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        Student: {result.studentId} • {result.subject} • {new Date(result.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-lg font-bold ${
                      result.percentage >= 70
                        ? 'text-success'
                        : result.percentage >= 60
                        ? 'text-warning'
                        : 'text-destructive'
                    }`}>
                      {result.percentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Score</p>
                      <p className="font-semibold">{result.score}/{result.totalScore}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time Taken</p>
                      <p className="font-semibold">{result.timeTaken} minutes</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className={`font-semibold ${
                        result.percentage >= 60 ? 'text-success' : 'text-destructive'
                      }`}>
                        {result.percentage >= 60 ? 'Passed' : 'Failed'}
                      </p>
                    </div>
                  </div>

                  <Progress value={result.percentage} className="h-2" />

                  {/* Insights */}
                  <div className="grid md:grid-cols-2 gap-3 pt-2 border-t border-border">
                    <div className="flex gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-success flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-success">Strengths</p>
                        <p className="text-muted-foreground">{result.strengths.join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-warning">To Improve</p>
                        <p className="text-muted-foreground">{result.weaknesses.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResults.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground mb-4">No results found matching your filters</p>
              <Button
                onClick={() => {
                  setFilterTest('');
                  setFilterDateRange('all');
                  setSearchStudent('');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
