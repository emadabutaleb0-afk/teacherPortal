import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { mockTestResults } from '@/lib/mockData';
import { 
  BarChart3, TrendingUp, BookOpen, AlertCircle, Brain, Target, Lightbulb, 
  TrendingDown, Users, Atom, Compass, History, Trophy, ArrowUpRight, 
  Video, File, CheckCircle2 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStudentInsights } from '@/lib/aiAnalysis';

const getSubjectStyle = (sub: string) => {
  switch (sub) {
    case 'Mathematics':
      return {
        icon: <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
        color: 'from-indigo-500 to-blue-500',
        textClass: 'text-indigo-600 dark:text-indigo-400',
        bgClass: 'bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/5'
      };
    case 'Science':
      return {
        icon: <Atom className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        color: 'from-emerald-500 to-teal-500',
        textClass: 'text-emerald-600 dark:text-emerald-400',
        bgClass: 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5'
      };
    case 'Geography':
      return {
        icon: <Compass className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
        color: 'from-sky-500 to-cyan-500',
        textClass: 'text-sky-600 dark:text-sky-400',
        bgClass: 'bg-sky-500/10 border-sky-500/20 shadow-sky-500/5'
      };
    case 'History':
      return {
        icon: <History className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
        color: 'from-amber-500 to-orange-500',
        textClass: 'text-amber-600 dark:text-amber-400',
        bgClass: 'bg-amber-500/10 border-amber-500/20 shadow-amber-500/5'
      };
    case 'English':
      return {
        icon: <BookOpen className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
        color: 'from-rose-500 to-pink-500',
        textClass: 'text-rose-600 dark:text-rose-400',
        bgClass: 'bg-rose-500/10 border-rose-500/20 shadow-rose-500/5'
      };
    default:
      return {
        icon: <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-400" />,
        color: 'from-slate-500 to-slate-600',
        textClass: 'text-slate-600 dark:text-slate-400',
        bgClass: 'bg-slate-500/10 border-slate-500/20 shadow-slate-500/5'
      };
  }
};

export default function ParentDashboard() {
  const { user, getAllUsers } = useAuth();
  const [, navigate] = useLocation();
  
  const allUsersList = getAllUsers();
  const linkedStudents = allUsersList.filter(u => 
    u.role === 'student' && 
    (user?.linkedStudents?.includes(u.id) || (user?.id ? u.linkedParents?.includes(user.id) : false))
  );

  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Curriculum States for selected child
  const [curriculumUnits, setCurriculumUnits] = useState<any[]>([]);
  const [curriculumLessons, setCurriculumLessons] = useState<any[]>([]);
  const [curriculumMaterials, setCurriculumMaterials] = useState<Record<string, any[]>>({});
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);
  const [selectedCurriculumSubject, setSelectedCurriculumSubject] = useState('Mathematics');
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCurriculum = async () => {
      if (!selectedStudent) return;
      setIsLoadingCurriculum(true);
      try {
        const unitsRes = await fetch(`/api/units?subject=${selectedCurriculumSubject}&gradeLevel=${selectedStudent.gradeLevel}`);
        const unitsData = await unitsRes.json();
        setCurriculumUnits(unitsData);

        if (unitsData.length > 0) {
          setExpandedUnits({ [unitsData[0].id]: true });
        } else {
          setExpandedUnits({});
        }

        const allLessons: any[] = [];
        const materialsMap: Record<string, any[]> = {};

        for (const unit of unitsData) {
          const lessonsRes = await fetch(`/api/lessons?unitId=${unit.id}`);
          const lessonsData = await lessonsRes.json();
          allLessons.push(...lessonsData);

          for (const lesson of lessonsData) {
            const matRes = await fetch(`/api/lessons/${lesson.id}/materials`);
            const matData = await matRes.json();
            materialsMap[lesson.id] = matData;
          }
        }
        setCurriculumLessons(allLessons);
        setCurriculumMaterials(materialsMap);
      } catch (err) {
        console.error('Error fetching parent-child curriculum:', err);
      } finally {
        setIsLoadingCurriculum(false);
      }
    };

    fetchCurriculum();
  }, [selectedCurriculumSubject, selectedStudent]);

  // Initialize selected student dynamically
  useEffect(() => {
    if (linkedStudents.length > 0) {
      if (!selectedStudent || !linkedStudents.some(s => s.id === selectedStudent.id)) {
        setSelectedStudent(linkedStudents[0]);
      }
    } else {
      setSelectedStudent(null);
    }
  }, [linkedStudents, selectedStudent]);

  if (!user || user.role !== 'parent') {
    navigate('/login');
    return null;
  }

  const hasLinkedStudents = linkedStudents.length > 0 && selectedStudent;

  const studentResults = hasLinkedStudents
    ? mockTestResults.filter(r => r.studentId === selectedStudent.id)
    : [];

  const averageScore = studentResults.length > 0
    ? Math.round(studentResults.reduce((sum, r) => sum + r.percentage, 0) / studentResults.length)
    : 0;

  const subjectPerformance = studentResults.reduce((acc, result) => {
    if (!acc[result.subject]) {
      acc[result.subject] = { correct: 0, total: 0, count: 0, maxPercentage: 0 };
    }
    acc[result.subject].correct += result.score;
    acc[result.subject].total += result.totalScore;
    acc[result.subject].count += 1;
    if (result.percentage > acc[result.subject].maxPercentage) {
      acc[result.subject].maxPercentage = result.percentage;
    }
    return acc;
  }, {} as Record<string, { correct: number; total: number; count: number; maxPercentage: number }>);

  const studentInsights = hasLinkedStudents ? getStudentInsights(selectedStudent.id) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="min-h-screen animate-fadeIn">
        {/* Banner Section */}
        <div className="relative h-48 md:h-56 bg-gradient-to-r from-accent/20 via-primary/20 to-indigo-500/20 border-b border-border overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="parentDots" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <circle cx="25" cy="25" r="4" fill="currentColor" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="1200" height="300" fill="url(#parentDots)" />
          </svg>
          
          <div className="container h-full flex items-center relative z-10 px-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 tracking-tight">Welcome, {user.name}! 👨‍👩‍👧‍👦</h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
                Monitor your children's academic progress, track active study paths, and celebrate accomplishments.
              </p>
            </div>
          </div>
        </div>

        <div className="container py-8 px-4 space-y-8 max-w-6xl">
        {!hasLinkedStudents ? (
          <Card className="border-dashed border-2 py-16 text-center max-w-lg mx-auto mt-8 shadow-md bg-card/65 backdrop-blur">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">No Linked Students</h2>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                You haven't linked any student profiles to your parent account yet. Link your children's profiles to monitor their test results and academic progress.
              </p>
              <Button
                onClick={() => navigate('/profile')}
                className="bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-md px-6 py-2 rounded-xl mt-2 hover:opacity-90"
              >
                Go to Profile to Link Students
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Student Selection */}
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Your Students
                </h2>
                <Button
                  onClick={() => navigate('/ai/parent-reports')}
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold shadow-md transition-all duration-300 hover-lift h-9"
                  size="sm"
                >
                  <Brain className="w-4 h-4" />
                  AI Parent Report Summarizer
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {linkedStudents.map((student) => {
                  const isSelected = selectedStudent && selectedStudent.id === student.id;
                  const avatarSeed = encodeURIComponent(student.name);
                  const avatarUrl = student.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

                  return (
                    <Card
                      key={student.id}
                      className={`cursor-pointer transition-all duration-350 border bg-card/50 backdrop-blur hover-lift ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/40 bg-primary/5 shadow-md shadow-primary/5'
                          : 'border-border/80 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={avatarUrl}
                            alt={student.name}
                            className={`w-12 h-12 rounded-full border-2 bg-background object-cover ${
                              isSelected ? 'border-primary' : 'border-border'
                            }`}
                          />
                          <div>
                            <p className="font-bold text-foreground leading-snug">{student.name}</p>
                            <Badge variant="outline" className="text-[10px] mt-1 bg-secondary/80 text-muted-foreground border-border/80">
                              Grade {student.gradeLevel}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* AI Insights for Selected Student */}
            {studentInsights && (studentInsights.performanceTrends.length > 0 || studentInsights.personalisedTips.length > 0) && (
              <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-indigo-500/10 rounded-2xl p-6 border border-primary/20 animate-slide-up space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">AI Analysis for {selectedStudent.name}</h2>
                    <p className="text-xs text-muted-foreground">Personalized evaluation based on diagnostic assessment records.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Performance Prediction */}
                  <Card className="hover-lift border border-border/80 bg-card/60">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Predicted Score</p>
                          <p className="text-3xl font-extrabold text-primary mt-1">{studentInsights.prediction.predictedScore}%</p>
                        </div>
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <div className="w-full bg-secondary dark:bg-secondary/40 rounded-full h-2 overflow-hidden border">
                        <div
                          className="bg-gradient-to-r from-primary to-accent h-full"
                          style={{ width: `${studentInsights.prediction.predictedScore}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trend Analysis */}
                  {studentInsights.performanceTrends.length > 0 && (
                    <Card className="hover-lift border border-border/80 bg-card/60">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Progress Trend</p>
                            <p className="text-2xl font-bold mt-1 text-foreground">
                              {studentInsights.performanceTrends[studentInsights.performanceTrends.length - 1].averageScore}%
                            </p>
                          </div>
                          {studentInsights.performanceTrends[studentInsights.performanceTrends.length - 1].trend === 'improving' ? (
                            <TrendingUp className="w-5 h-5 text-success" />
                          ) : studentInsights.performanceTrends[studentInsights.performanceTrends.length - 1].trend === 'declining' ? (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          ) : (
                            <BarChart3 className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground mt-2">
                          {studentInsights.performanceTrends[studentInsights.performanceTrends.length - 1].trend === 'improving'
                            ? '📈 Great progress!'
                            : studentInsights.performanceTrends[studentInsights.performanceTrends.length - 1].trend === 'declining'
                            ? '⚠️ Needs support'
                            : '➡️ Steady performance'}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Areas to Focus */}
                  {studentInsights.studyFocus.length > 0 && (
                    <Card className="hover-lift border border-border/80 bg-card/60">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Focus Areas</p>
                            <p className="text-3xl font-extrabold text-accent mt-1">{studentInsights.studyFocus.length}</p>
                          </div>
                          <Lightbulb className="w-5 h-5 text-accent" />
                        </div>
                        <div className="space-y-1">
                          {studentInsights.studyFocus.slice(0, 2).map((focus, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground truncate font-medium">• {focus}</p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* AI Mastery & Retraining Profile for Child */}
                <Card className="border-primary/20 bg-card/40 backdrop-blur shadow-sm">
                  <CardHeader className="pb-3 text-left">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                      <Brain className="w-5 h-5 text-primary" />
                      AI Mastery & Competency Profile
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Monitor {selectedStudent.name}'s current subject competencies and active practice progression.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Strengths Column */}
                      <div className="space-y-3 text-left">
                        <h3 className="text-xs font-bold text-success flex items-center gap-1.5 uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4" /> Academic Strengths
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {studentInsights.strengths.length > 0 ? (
                            studentInsights.strengths.map((str, idx) => (
                              <Badge key={idx} variant="outline" className="bg-success/10 text-success border-success/20 text-xs px-2.5 py-1 font-semibold rounded-lg flex items-center gap-1 shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {str}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No strengths identified yet.</p>
                          )}
                        </div>
                      </div>

                      {/* Weaknesses Column */}
                      <div className="space-y-3 text-left">
                        <h3 className="text-xs font-bold text-warning flex items-center gap-1.5 uppercase tracking-wider">
                          <AlertCircle className="w-4 h-4" /> Academic Focus Areas
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {studentInsights.weaknesses.length > 0 ? (
                            studentInsights.weaknesses.map((weak, idx) => (
                              <Badge key={idx} variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs px-2.5 py-1 font-semibold rounded-lg flex items-center gap-1 shadow-sm">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {weak}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-xs text-success font-semibold italic flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-success" /> All focus areas successfully cleared!
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Retraining Progress & History */}
                    {(() => {
                      const childRetrainingResults = mockTestResults.filter(
                        r => r.studentId === selectedStudent.id && r.testId.startsWith('retrain-')
                      );
                      const resolvedWeaknesses = studentInsights.strengths.filter(s => 
                        childRetrainingResults.some(r => r.testTitle.toLowerCase().includes(s.toLowerCase()) && r.percentage >= 80)
                      ).length;
                      const activeWeaknesses = studentInsights.weaknesses.length;
                      const total = resolvedWeaknesses + activeWeaknesses;
                      const progress = total > 0 ? Math.round((resolvedWeaknesses / total) * 100) : 100;

                      return (
                        <div className="pt-4 border-t border-border/60 space-y-4 text-left">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              <span>Practice Mastery Progress</span>
                              <span>{resolvedWeaknesses} of {total} Topics Mastered ({progress}%)</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Retraining Practice History</h4>
                            {childRetrainingResults.length > 0 ? (
                              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                                {childRetrainingResults.map((r) => {
                                  const passed = r.percentage >= 80;
                                  return (
                                    <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-background hover:bg-secondary/20 transition-colors">
                                      <div>
                                        <p className="font-semibold text-xs text-foreground">{r.testTitle}</p>
                                        <p className="text-[10px] text-muted-foreground">{new Date(r.completedAt).toLocaleString()}</p>
                                      </div>
                                      <Badge className={
                                        passed 
                                          ? 'bg-success/15 text-success border-success/20 font-bold text-[10px] py-0.5' 
                                          : 'bg-warning/15 text-warning border-warning/20 font-bold text-[10px] py-0.5'
                                      } variant="outline">
                                        {r.percentage}% • {passed ? 'Mastered ✓' : 'Practice Again'}
                                      </Badge>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">No retraining quizzes completed yet.</p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                {studentInsights.personalisedTips.length > 0 && (
                  <div className="p-4 bg-card/60 backdrop-blur-md rounded-xl border border-primary/10">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">📋 Recommendations for {selectedStudent.name}</p>
                    <div className="space-y-1.5 text-left text-sm text-muted-foreground">
                      {studentInsights.personalisedTips.slice(0, 3).map((tip, idx) => (
                        <p key={idx} className="font-medium">• {tip}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
              {/* Card 1: Tests Completed */}
              <Card className="relative overflow-hidden border-blue-500/20 dark:border-blue-900/40 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent hover:shadow-xl transition-all duration-300 hover-lift group">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Tests Completed</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-foreground">{studentResults.length}</span>
                      <span className="text-xs text-muted-foreground">exams</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Active learning progression</p>
                  </div>
                  <div className="p-3 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-500/25 transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-blue-500/10">
                    <BookOpen className="w-7 h-7" />
                  </div>
                </CardContent>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Card>

              {/* Card 2: Average Score */}
              <Card className="relative overflow-hidden border-purple-500/20 dark:border-purple-900/40 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent hover:shadow-xl transition-all duration-300 hover-lift group">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Average Score</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-foreground">{averageScore}%</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {averageScore >= 85 ? '🥇 Excellent mastery' : averageScore >= 70 ? '🥈 Proficient skill' : '🥉 Developing level'}
                    </p>
                  </div>
                  
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="26" className="stroke-muted/30 dark:stroke-muted/10" strokeWidth="4.5" fill="transparent" />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-purple-500 dark:stroke-purple-400 transition-all duration-1000 ease-out"
                        strokeWidth="4.5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 * (1 - averageScore / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute text-[10px] font-bold text-purple-600 dark:text-purple-400">
                      {averageScore}%
                    </div>
                  </div>
                </CardContent>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Card>

              {/* Card 3: Subjects */}
              <Card className="relative overflow-hidden border-emerald-500/20 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent hover:shadow-xl transition-all duration-300 hover-lift group">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Subjects</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-foreground">{Object.keys(subjectPerformance).length}</span>
                      <span className="text-xs text-muted-foreground">registered</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                      {Object.keys(subjectPerformance).join(', ') || 'No subjects'}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/25 transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-emerald-500/10">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                </CardContent>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Card>

              {/* Card 4: Pass Rate */}
              {(() => {
                const passRate = studentResults.length > 0
                  ? Math.round(
                      (studentResults.filter(r => r.percentage >= 60).length /
                        studentResults.length) *
                        100
                    )
                  : 0;
                return (
                  <Card className="relative overflow-hidden border-amber-500/20 dark:border-amber-900/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent hover:shadow-xl transition-all duration-300 hover-lift group">
                    <CardContent className="pt-6 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pass Rate</p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-extrabold text-foreground">{passRate}%</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Passing threshold: 60%</p>
                      </div>
                      
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="32" cy="32" r="26" className="stroke-muted/30 dark:stroke-muted/10" strokeWidth="4.5" fill="transparent" />
                          <circle
                            cx="32"
                            cy="32"
                            r="26"
                            className="stroke-amber-500 dark:stroke-amber-400 transition-all duration-1000 ease-out"
                            strokeWidth="4.5"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 26}
                            strokeDashoffset={2 * Math.PI * 26 * (1 - passRate / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          {passRate}%
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </Card>
                );
              })()}
            </div>

            {/* Subject Performance */}
            <div className="grid lg:grid-cols-3 gap-8 animate-slide-up">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Subject Mastery</h2>
                  <p className="text-xs text-muted-foreground">Topic comprehension levels and highest exam scores</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(subjectPerformance).map(([subject, performance]) => {
                    const percentage = Math.round((performance.correct / performance.total) * 100);
                    const style = getSubjectStyle(subject);
                    
                    const tier = 
                      percentage >= 85 ? { name: 'Mastery 🏆', class: 'bg-success/15 text-success border-success/20' } :
                      percentage >= 70 ? { name: 'Proficient ⭐', class: 'bg-primary/15 text-primary border-primary/20' } :
                      { name: 'Developing 📚', class: 'bg-warning/15 text-warning border-warning/20' };

                    return (
                      <Card key={subject} className="relative overflow-hidden border-border/80 bg-card hover:shadow-lg transition-all duration-300 hover-lift group">
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.color}`} />
                        
                        <CardContent className="pt-5 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl border ${style.bgClass} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                                {style.icon}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-foreground">{subject}</h4>
                                <p className="text-[10px] text-muted-foreground">{performance.count} {performance.count === 1 ? 'Exam' : 'Exams'} Completed</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-xl font-extrabold text-foreground">{percentage}%</div>
                              <p className="text-[9px] text-muted-foreground">avg score</p>
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
                              <span>Progress Meter</span>
                              <span className={style.textClass}>{percentage}%</span>
                            </div>
                            <div className="w-full bg-secondary dark:bg-secondary/40 rounded-full h-2 overflow-hidden shadow-inner">
                              <div
                                className={`bg-gradient-to-r ${style.color} h-full rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t border-border/60 text-[11px] text-muted-foreground flex-wrap gap-2">
                            <Badge variant="outline" className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${tier.class}`}>
                              {tier.name}
                            </Badge>
                            <div className="flex gap-2.5">
                              <span>Best: <strong className="text-foreground">{performance.maxPercentage}%</strong></span>
                              <span>Correct: <strong className="text-foreground">{performance.correct}/{performance.total}</strong></span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Recent Tests */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Recent Tests</h2>
                <div className="space-y-3">
                  {studentResults.slice(0, 5).map((result) => (
                    <Card key={result.id} className="hover:shadow-md transition-shadow duration-300 border border-border/60 bg-card/40 backdrop-blur">
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <p className="font-semibold text-sm text-foreground">{result.testTitle}</p>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground text-xs">{result.subject}</span>
                            <span className={`font-bold ${
                              result.percentage >= 70
                                ? 'text-success'
                                : result.percentage >= 60
                                ? 'text-warning'
                                : 'text-destructive'
                            }`}>
                              {result.percentage}%
                            </span>
                          </div>
                          <Progress value={result.percentage} className="h-1.5" />
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(result.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Child's Learning Syllabus */}
            <Card className="hover:shadow-md transition-shadow duration-300 border border-border/80 bg-card/50 backdrop-blur animate-slide-up">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 text-left border-b">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Active Curriculum Syllabus Path 📚
                  </CardTitle>
                  <CardDescription>
                    Track units and lessons mapped for {selectedStudent.name} (Grade {selectedStudent.gradeLevel})
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Subject:</span>
                  <select
                    value={selectedCurriculumSubject}
                    onChange={(e) => setSelectedCurriculumSubject(e.target.value)}
                    className="px-3 py-1 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/45 text-sm font-semibold text-foreground"
                  >
                    {Object.keys(subjectPerformance).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {isLoadingCurriculum ? (
                  <div className="py-8 text-center text-muted-foreground animate-pulse text-sm font-semibold">
                    Fetching child's syllabus...
                  </div>
                ) : curriculumUnits.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-border rounded-xl bg-muted/5 space-y-2">
                    <p className="font-semibold text-muted-foreground text-sm">No curriculum syllabus assigned yet</p>
                    <p className="text-xs text-muted-foreground">There are no units or lessons currently created by teachers for this subject in Grade {selectedStudent.gradeLevel}.</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-left">
                    {curriculumUnits.map((unit) => {
                      const unitLessons = curriculumLessons.filter(l => l.unitId === unit.id);
                      const isExpanded = expandedUnits[unit.id];

                      return (
                        <div key={unit.id} className="border border-border/60 rounded-xl overflow-hidden bg-card/65">
                          <div 
                            className="flex items-center justify-between p-3.5 bg-secondary/35 border-b border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors"
                            onClick={() => setExpandedUnits(prev => ({ ...prev, [unit.id]: !prev[unit.id] }))}
                          >
                            <div className="flex-1 pr-4 min-w-0">
                              <h4 className="font-bold text-sm text-foreground truncate">{unit.name}</h4>
                              <p className="text-[11px] text-muted-foreground line-clamp-1">{unit.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="outline" className="text-[9px] bg-secondary/80 font-semibold px-2 py-0.5">
                                {unitLessons.length} Lessons
                              </Badge>
                              <span className="text-sm font-bold text-muted-foreground">{isExpanded ? '−' : '+'}</span>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-3 space-y-3 bg-secondary/5 border-t border-border/50">
                              {unitLessons.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-2">No lessons in this unit yet.</p>
                              ) : (
                                unitLessons.map((lesson) => {
                                  const lessonMats = curriculumMaterials[lesson.id] || [];
                                  const isLessonExpanded = expandedLessons[lesson.id];

                                  return (
                                    <div key={lesson.id} className="border border-border/60 rounded-lg bg-background overflow-hidden">
                                      <div 
                                        className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-muted/20 transition-colors"
                                        onClick={() => setExpandedLessons(prev => ({ ...prev, [lesson.id]: !prev[lesson.id] }))}
                                      >
                                        <div>
                                          <p className="font-semibold text-xs text-foreground">
                                            Lesson {lesson.orderNum}: {lesson.name}
                                          </p>
                                          <p className="text-[10px] text-muted-foreground">{lesson.description}</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground">{isLessonExpanded ? '▲' : '▼'}</span>
                                      </div>

                                      {isLessonExpanded && (
                                        <div className="p-3 border-t border-border/50 bg-secondary/5 grid sm:grid-cols-2 gap-3">
                                          {lessonMats.length === 0 ? (
                                            <p className="text-[10px] text-muted-foreground col-span-2 text-center py-1">No learning resources available yet.</p>
                                          ) : (
                                            lessonMats.map((mat) => (
                                              <div key={mat.id} className="p-3 border border-border/60 rounded-lg bg-background flex items-start gap-3 hover:shadow-md transition-shadow">
                                                <div className="mt-0.5">
                                                  {mat.type === 'video' ? (
                                                    <div className="p-1.5 bg-rose-500/10 text-rose-500 rounded">
                                                      <Video className="w-4 h-4" />
                                                    </div>
                                                  ) : (
                                                    <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded">
                                                      <File className="w-4 h-4" />
                                                    </div>
                                                  )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <p className="font-bold text-xs truncate leading-snug">{mat.title}</p>
                                                  <p className="text-[10px] text-muted-foreground line-clamp-1">{mat.details || 'Study guide details'}</p>
                                                  <a 
                                                    href={mat.url} 
                                                    target={mat.url.startsWith('data:') ? undefined : "_blank"} 
                                                    download={mat.url.startsWith('data:') ? mat.title : undefined}
                                                    rel="noopener noreferrer" 
                                                    className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-primary hover:underline mt-1.5"
                                                  >
                                                    {mat.url.startsWith('data:') ? 'Download File' : 'View resource'} <ArrowUpRight className="w-3 h-3" />
                                                  </a>
                                                </div>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insights & Recommendations */}
            <Card className="border border-border/80 bg-card/60 backdrop-blur shadow-sm animate-slide-up">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-indigo-500" />
                  Insights & Recommendations
                </CardTitle>
                <CardDescription>Based on {selectedStudent.name}'s performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(subjectPerformance).map(([subject, performance]) => {
                    const percentage = Math.round((performance.correct / performance.total) * 100);
                    if (percentage < 70) {
                      return (
                        <div key={subject} className="p-3 bg-warning/10 border border-warning/25 rounded-xl text-sm text-warning-foreground dark:text-warning leading-relaxed">
                          <p className="font-bold mb-1 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-warning" /> {subject} Needs Attention
                          </p>
                          <p>
                            {selectedStudent.name} is scoring {percentage}% in {subject}. Consider allocating additional study practice in this area.
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                <div className="p-3 bg-primary/10 border border-primary/25 rounded-xl text-sm text-primary-foreground dark:text-primary leading-relaxed">
                  <p className="font-bold mb-1 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-primary" /> Consistent Practice Tip
                  </p>
                  <p>
                    Encourage {selectedStudent.name} to complete regular practice quizzes to build diagnostic consistency and improve weaker topics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        </div>
      </main>
    </div>
  );
}
