import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

interface FlaggedAttempt {
  id: string;
  studentName: string;
  testName: string;
  date: string;
  confidenceScore: number;
  flags: string[];
  status: 'pending' | 'reviewed' | 'cleared';
}

const initialFlaggedAttempts: FlaggedAttempt[] = [
  {
    id: 'flag-1',
    studentName: 'Jordan Smith',
    testName: 'Algebra Final Exam',
    date: '2026-05-08',
    confidenceScore: 87,
    flags: [
      'Unusually fast completion time',
      'Score jump from 45% to 92%',
      'Multiple perfect streaks on difficult questions',
      'Inconsistent performance pattern',
    ],
    status: 'pending',
  },
  {
    id: 'flag-2',
    studentName: 'Casey Johnson',
    testName: 'English Writing Test',
    date: '2026-05-07',
    confidenceScore: 62,
    flags: [
      'Slight time anomaly',
      'Minor score deviation from baseline',
      'Writing style inconsistency',
    ],
    status: 'reviewed',
  },
  {
    id: 'flag-3',
    studentName: 'Alex Johnson',
    testName: 'Science Quiz',
    date: '2026-05-06',
    confidenceScore: 45,
    flags: [
      'Slightly elevated answer selection speed',
      'Score within expected range',
    ],
    status: 'cleared',
  },
];

const getSeverityColor = (score: number) => {
  if (score >= 80) return 'bg-red-100 text-red-800 border-red-200';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-green-100 text-green-800 border-green-200';
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Pending Review</Badge>;
    case 'reviewed':
      return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">Under Review</Badge>;
    case 'cleared':
      return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">Cleared</Badge>;
    default:
      return null;
  }
};

export default function AICheatingDetection() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<FlaggedAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [flagsRes, usersRes, testsRes] = await Promise.all([
          fetch('/api/cheating-flags'),
          fetch('/api/users'),
          fetch('/api/tests')
        ]);
        
        const flagsData = await flagsRes.json();
        const usersData = await usersRes.json();
        const testsData = await testsRes.json();
        
        const formattedFlags = flagsData.map((x: any) => ({
          id: x.id,
          studentName: x.studentName || x.student_name,
          testName: x.testName || x.test_name,
          date: x.date,
          confidenceScore: x.confidenceScore || x.confidence_score,
          flags: Array.isArray(x.flags) ? x.flags : (typeof x.flags === 'string' ? JSON.parse(x.flags) : [x.reasoning || 'Suspicious behavior']),
          status: x.status
        }));
        
        if (user && user.role === 'teacher') {
          const teacherGrade = (user.gradeLevel || '8').toString().replace(/grade\s+/i, '').trim();
          const teacherSubjects = user.subjects || [];
          
          const filtered = formattedFlags.filter((flag: any) => {
            const studentUser = usersData.find((u: any) => u.name === flag.studentName && u.role === 'student');
            if (!studentUser) return false;
            
            const studentGrade = (studentUser.gradeLevel || '').toString().replace(/grade\s+/i, '').trim();
            const gradeMatches = studentGrade === teacherGrade;
            
            const test = testsData.find((t: any) => t.title.toLowerCase() === flag.testName.toLowerCase() || t.id === flag.testId);
            let subjectMatches = false;
            if (test) {
              subjectMatches = teacherSubjects.includes(test.subject);
            } else {
              subjectMatches = teacherSubjects.some((sub: string) => flag.testName.toLowerCase().includes(sub.toLowerCase()) || sub.toLowerCase().includes(flag.testName.toLowerCase()));
            }
            
            return gradeMatches && subjectMatches;
          });
          setAttempts(filtered);
        } else {
          setAttempts(formattedFlags);
        }
      } catch (err) {
        console.error('Failed to load cheating flags data:', err);
        setAttempts(initialFlaggedAttempts);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  const pendingCount = attempts.filter(a => a.status === 'pending').length;
  const reviewedCount = attempts.filter(a => a.status === 'reviewed').length;
  const clearedCount = attempts.filter(a => a.status === 'cleared').length;

  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'reviewed' | 'cleared') => {
    try {
      const res = await fetch(`/api/cheating-flags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setAttempts(prev =>
          prev.map(attempt =>
            attempt.id === id ? { ...attempt, status: newStatus } : attempt
          )
        );
        const studentName = attempts.find(a => a.id === id)?.studentName || 'Student';
        if (newStatus === 'cleared') {
          toast.success(`Flag cleared for ${studentName}! ✨`);
        } else if (newStatus === 'reviewed') {
          toast.info(`${studentName}'s attempt is now marked as Under Review.`);
        } else {
          toast.warning(`${studentName}'s attempt is back to Pending Review.`);
        }
      } else {
        toast.error('Failed to update status on the server');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to connect to the server');
    }
  };

  const handleReviewDetails = (attempt: FlaggedAttempt) => {
    toast.info(`Anomalies for ${attempt.studentName}: ${attempt.flags.join(', ')}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">AI Cheating Detection</h1>
          </div>
          <p className="text-muted-foreground">Monitor test integrity and identify suspicious patterns</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="hover-lift border-yellow-200 bg-yellow-50/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-1">{pendingCount}</div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift border-blue-200 bg-blue-50/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{reviewedCount}</div>
                <div className="text-sm text-muted-foreground">Under Review</div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift border-green-200 bg-green-50/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{clearedCount}</div>
                <div className="text-sm text-muted-foreground">Cleared</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 bg-card border border-border rounded-lg shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground font-semibold">Analyzing integrity records...</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="all">All Flags</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed ({reviewedCount})</TabsTrigger>
            <TabsTrigger value="cleared">Cleared ({clearedCount})</TabsTrigger>
          </TabsList>

          {/* All Flags */}
          <TabsContent value="all" className="animate-fadeIn space-y-4">
            {attempts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No flags recorded.</p>
            ) : (
              attempts.map(attempt => (
                <Card key={attempt.id} className="hover-lift">
                  <CardHeader className="border-b border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{attempt.studentName}</h3>
                          {getStatusBadge(attempt.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{attempt.testName} • {attempt.date}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-lg font-bold border ${getSeverityColor(attempt.confidenceScore)}`}>
                        {attempt.confidenceScore}% Risk
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-3">Detected Anomalies:</p>
                      <ul className="space-y-2">
                        {attempt.flags.map((flag, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleReviewDetails(attempt)}>
                        <Eye className="w-4 h-4" />
                        Review Details
                      </Button>
                      {attempt.status !== 'cleared' && (
                        <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleUpdateStatus(attempt.id, 'cleared')}>
                          Clear
                        </Button>
                      )}
                      {attempt.status !== 'reviewed' && (
                        <Button variant="outline" size="sm" className="ml-auto text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleUpdateStatus(attempt.id, 'reviewed')}>
                          Flag for Investigation
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Pending */}
          <TabsContent value="pending" className="animate-fadeIn space-y-4">
            {attempts.filter(a => a.status === 'pending').length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending flags.</p>
            ) : (
              attempts
                .filter(a => a.status === 'pending')
                .map(attempt => (
                  <Card key={attempt.id} className="hover-lift border-l-4 border-l-yellow-600">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{attempt.studentName}</h3>
                          <p className="text-sm text-muted-foreground">{attempt.testName}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-lg font-bold border ${getSeverityColor(attempt.confidenceScore)}`}>
                          {attempt.confidenceScore}% Risk
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Button className="flex-1 gap-2" onClick={() => handleUpdateStatus(attempt.id, 'reviewed')}>
                          Review This Attempt
                        </Button>
                        <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleUpdateStatus(attempt.id, 'cleared')}>
                          Clear
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          {/* Reviewed */}
          <TabsContent value="reviewed" className="animate-fadeIn space-y-4">
            {attempts.filter(a => a.status === 'reviewed').length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No attempts currently under review.</p>
            ) : (
              attempts
                .filter(a => a.status === 'reviewed')
                .map(attempt => (
                  <Card key={attempt.id} className="hover-lift border-l-4 border-l-blue-600">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{attempt.studentName}</h3>
                          <p className="text-sm text-muted-foreground">{attempt.testName}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">Under Review</Badge>
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleUpdateStatus(attempt.id, 'cleared')}>
                            Clear
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
            )}
          </TabsContent>

          {/* Cleared */}
          <TabsContent value="cleared" className="animate-fadeIn space-y-4">
            {attempts.filter(a => a.status === 'cleared').length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No cleared flags.</p>
            ) : (
              attempts
                .filter(a => a.status === 'cleared')
                .map(attempt => (
                  <Card key={attempt.id} className="hover-lift border-l-4 border-l-green-600">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{attempt.studentName}</h3>
                          <p className="text-sm text-muted-foreground">{attempt.testName}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Badge className="bg-green-100 text-green-800 border-green-200">Cleared</Badge>
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(attempt.id, 'pending')}>
                            Re-flag
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
            )}
          </TabsContent>
        </Tabs>
        )}

        {/* Info Card */}
        <Card className="hover-lift mt-8">
          <CardHeader>
            <CardTitle className="text-base">How Cheating Detection Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Answer Pattern Analysis</p>
                <p className="text-sm text-muted-foreground">Detects unusual answer sequences or patterns</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Score Anomalies</p>
                <p className="text-sm text-muted-foreground">Identifies sudden score jumps inconsistent with performance history</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Flags unusually fast or slow completion times</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Behavioral Consistency</p>
                <p className="text-sm text-muted-foreground">Compares current behavior with historical patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
