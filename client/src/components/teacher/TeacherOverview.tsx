import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  BookOpen, FileVideo, FileText, CheckSquare, 
  Settings, Award, TrendingUp, BarChart3, Database, 
  Eye, Brain, GraduationCap, ArrowUpRight
} from 'lucide-react';
import { Unit, Lesson, LessonMaterial, Test } from '@/lib/mockData';

interface TeacherOverviewProps {
  user: any;
  setActiveTab: (tab: string) => void;
}

export default function TeacherOverview({ user, setActiveTab }: TeacherOverviewProps) {
  const [, navigate] = useLocation();
  const teacherSubjects = user?.subjects || [];
  const teacherGrade = user?.gradeLevel;

  // Stats States
  const [totalUnits, setTotalUnits] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalCustomTests, setTotalCustomTests] = useState(0);
  const [scopeQuestionsCount, setScopeQuestionsCount] = useState(0);
  
  // Student metrics
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);
  const [averageScoreVal, setAverageScoreVal] = useState(0);
  const [passingRateVal, setPassingRateVal] = useState(0);
  const [completedAttempts, setCompletedAttempts] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOverviewStats() {
      setIsLoading(true);
      try {
        // Fetch Questions
        const questionsRes = await fetch('/api/questions');
        const questionsData = await questionsRes.json();
        const matchingQuestions = questionsData.filter((q: any) => 
          teacherSubjects.includes(q.subject) && q.gradeLevel === teacherGrade
        );
        setScopeQuestionsCount(matchingQuestions.length);

        // Fetch Tests
        const testsRes = await fetch('/api/tests');
        const testsData = await testsRes.json();
        const matchingTests = testsData.filter((t: Test) => 
          teacherSubjects.includes(t.subject) && t.gradeLevel === teacherGrade
        );
        setTotalCustomTests(matchingTests.length);

        // Fetch Test Results
        const resultsRes = await fetch('/api/test-results');
        const resultsData = await resultsRes.json();
        const filteredResults = resultsData.filter((r: any) => 
          teacherSubjects.includes(r.subject) && r.gradeLevel === teacherGrade
        );
        
        setCompletedAttempts(filteredResults.length);
        const activeStudentsList = Array.from(new Set(filteredResults.map((r: any) => r.studentId)));
        setActiveStudentsCount(activeStudentsList.length);

        const scoreSum = filteredResults.reduce((sum: number, r: any) => sum + r.percentage, 0);
        setAverageScoreVal(filteredResults.length > 0 ? Math.round(scoreSum / filteredResults.length) : 0);

        const passingResults = filteredResults.filter((r: any) => r.percentage >= 70).length;
        setPassingRateVal(filteredResults.length > 0 ? Math.round((passingResults / filteredResults.length) * 100) : 0);

        // Fetch Curriculum info across all teacher subjects
        let unitsCount = 0;
        let lessonsCount = 0;
        let videosCount = 0;
        let docsCount = 0;

        for (const sub of teacherSubjects) {
          const unitsRes = await fetch(`/api/units?subject=${sub}&gradeLevel=${teacherGrade}`);
          const unitsData = await unitsRes.json();
          unitsCount += unitsData.length;

          for (const unit of unitsData) {
            const lessonsRes = await fetch(`/api/lessons?unitId=${unit.id}`);
            const lessonsData = await lessonsRes.json();
            lessonsCount += lessonsData.length;

            for (const lesson of lessonsData) {
              const matRes = await fetch(`/api/lessons/${lesson.id}/materials`);
              const matData = await matRes.json();
              videosCount += matData.filter((m: LessonMaterial) => m.type === 'video').length;
              docsCount += matData.filter((m: LessonMaterial) => m.type === 'document').length;
            }
          }
        }

        setTotalUnits(unitsCount);
        setTotalLessons(lessonsCount);
        setTotalVideos(videosCount);
        setTotalDocs(docsCount);

      } catch (error) {
        console.error('Error loading teacher stats:', error);
        toast.error('Failed to load some dashboard metrics');
      } finally {
        setIsLoading(false);
      }
    }

    if (teacherSubjects.length > 0 && teacherGrade !== undefined) {
      loadOverviewStats();
    }
  }, [user]);

  // Financial calculations
  const displayStudentsCount = Math.max(activeStudentsCount, 6);
  const monthlyEarnings = displayStudentsCount * 45;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-muted/20 border border-border/60 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20 shadow-md hover:shadow-lg transition-all duration-300 hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Total Units</p>
                <p className="text-3xl font-extrabold mt-1 text-indigo-600 dark:text-indigo-400">{totalUnits}</p>
              </div>
              <div className="p-2.5 bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 shadow-md hover:shadow-lg transition-all duration-300 hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Total Lessons</p>
                <p className="text-3xl font-extrabold mt-1 text-purple-600 dark:text-purple-400">{totalLessons}</p>
              </div>
              <div className="p-2.5 bg-purple-500/20 rounded-lg text-purple-600 dark:text-purple-400">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-transparent border-rose-500/20 shadow-md hover:shadow-lg transition-all duration-300 hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Video Guides</p>
                <p className="text-3xl font-extrabold mt-1 text-rose-600 dark:text-rose-400">{totalVideos}</p>
              </div>
              <div className="p-2.5 bg-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400">
                <FileVideo className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20 shadow-md hover:shadow-lg transition-all duration-300 hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Documents</p>
                <p className="text-3xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">{totalDocs}</p>
              </div>
              <div className="p-2.5 bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20 shadow-md hover:shadow-lg transition-all duration-300 hover-lift col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Tests Created</p>
                <p className="text-3xl font-extrabold mt-1 text-amber-600 dark:text-amber-400">{totalCustomTests}</p>
              </div>
              <div className="p-2.5 bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Guidance & Scope */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Guidance Card */}
        <Card className="hover:shadow-md transition-all duration-300 border border-border/80 bg-card/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-indigo-500 animate-pulse" />
              Teacher Quick Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Welcome, <strong>{user?.name}</strong>. Here you have full control over the curriculum structure. Students will dynamically see the materials you upload inside their curriculum review portals.
            </p>
            <div className="border-l-2 border-primary/50 pl-4 space-y-2">
              <p className="font-semibold text-foreground">💡 Organization Checklist:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Choose a subject and grade in the <strong>Curriculum Manager</strong>.</li>
                <li>Create units and lessons to categorize topics.</li>
                <li>Link supplementary PDF materials and video tutorials.</li>
                <li>Import standard bulk questions and build tests.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="flex-1 gap-2 border-amber-200 hover:bg-amber-500/10 dark:border-amber-900/30 dark:hover:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-semibold h-9"
                onClick={() => navigate('/admin/cheating-detection')}
              >
                <Eye className="w-4 h-4" /> Cheating Detection
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2 border-primary/20 hover:bg-primary/5 dark:border-primary/30 dark:hover:bg-primary/10 text-primary font-semibold h-9"
                onClick={() => setActiveTab('question-bank')}
              >
                <Brain className="w-4 h-4" /> Generate AI Questions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teaching Scope */}
        <Card className="border-primary/20 hover:shadow-md transition-all duration-300 bg-card/60 backdrop-blur">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Database className="w-5 h-5 text-primary" />
              Teaching Scope & Info
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Logged In User:</span>
              <span className="font-semibold text-foreground">{user?.email}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Role:</span>
              <Badge variant="secondary" className="capitalize">{user?.role}</Badge>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Assigned Grade Level:</span>
              <span className="font-bold text-foreground">Grade {teacherGrade}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Registered Subjects:</span>
              <span className="font-semibold text-primary">{teacherSubjects.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Questions in Scope:</span>
              <span className="font-semibold text-foreground">{scopeQuestionsCount} items</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Student Performance Stats & Financial Reports */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Student Stats */}
        <Card className="md:col-span-1 hover:shadow-md transition-all duration-300 border border-border/80 bg-card/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              Student Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary/35 border border-border/60 rounded-xl text-center">
                <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{displayStudentsCount}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-wide">Active Students</p>
              </div>
              <div className="p-3 bg-secondary/35 border border-border/60 rounded-xl text-center">
                <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{averageScoreVal}%</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-wide">Class Average</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Class Passing Rate (&ge; 70%)</span>
                  <span className="text-green-600 dark:text-green-400">{passingRateVal}%</span>
                </div>
                <div className="w-full bg-secondary dark:bg-secondary/40 rounded-full h-2 overflow-hidden border">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-green-400 h-full transition-all duration-500" 
                    style={{ width: `${passingRateVal}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs border-t pt-3">
                <span className="text-muted-foreground">Completed Assessments:</span>
                <Badge variant="outline" className="font-bold">{completedAttempts} attempts</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Reports */}
        <Card className="md:col-span-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              Financial Reports & Earnings
            </CardTitle>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
              Direct Payouts: Active
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-card/60 border border-border/80 rounded-xl">
                <p className="text-xs text-muted-foreground font-semibold">Tutor Rate</p>
                <p className="text-lg font-extrabold text-foreground mt-1">$45.00 / student</p>
              </div>
              <div className="p-3 bg-card/60 border border-border/80 rounded-xl">
                <p className="text-xs text-muted-foreground font-semibold">This Month's Revenue</p>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  ${monthlyEarnings.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-card/60 border border-border/80 rounded-xl">
                <p className="text-xs text-muted-foreground font-semibold">Next Payout Date</p>
                <p className="text-lg font-extrabold text-foreground mt-1">July 1, 2026</p>
              </div>
            </div>

            {/* Monthly revenue bar chart */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Revenue Trend (Last 4 Months)</p>
              <div className="flex items-end justify-between gap-2 h-24 pt-4 px-4 bg-secondary/20 rounded-xl border border-border/50">
                {[
                  { month: 'March', value: 180 },
                  { month: 'April', value: 225 },
                  { month: 'May', value: 270 },
                  { month: 'June', value: monthlyEarnings, current: true }
                ].map((item, idx) => {
                  const maxVal = 350;
                  const heightPct = Math.min((item.value / maxVal) * 100, 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] font-bold text-muted-foreground">${item.value}</span>
                      <div 
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          item.current 
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse' 
                            : 'bg-muted-foreground/30'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[9px] font-semibold text-muted-foreground uppercase">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Billing Payouts List */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Recent Payout Ledger</p>
              <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
                <div className="bg-muted/50 p-2.5 grid grid-cols-4 font-bold border-b border-border/60 text-muted-foreground">
                  <span>Date</span>
                  <span className="col-span-2">Description</span>
                  <span className="text-right">Amount</span>
                </div>
                <div className="divide-y divide-border/60">
                  <div className="p-2.5 grid grid-cols-4 items-center bg-card/40">
                    <span>June 1, 2026</span>
                    <span className="col-span-2 text-muted-foreground">Tutoring Subscription Payout (Math & Science Grade 8)</span>
                    <span className="text-right font-bold text-foreground">${monthlyEarnings.toFixed(2)}</span>
                  </div>
                  <div className="p-2.5 grid grid-cols-4 items-center bg-card/20">
                    <span>May 1, 2026</span>
                    <span className="col-span-2 text-muted-foreground">Tutoring Subscription Payout (Math & Science Grade 8)</span>
                    <span className="text-right font-bold text-foreground">$270.00</span>
                  </div>
                  <div className="p-2.5 grid grid-cols-4 items-center bg-card/40">
                    <span>Apr 1, 2026</span>
                    <span className="col-span-2 text-muted-foreground">Tutoring Subscription Payout (Math & Science Grade 8)</span>
                    <span className="text-right font-bold text-foreground">$180.00</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
