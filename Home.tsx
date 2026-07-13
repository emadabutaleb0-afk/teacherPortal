import { useState, useEffect } from "react";
import StudentLayout from "./StudentLayout";
import LiveLectureBanner from "./LiveLectureBanner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { BookOpen, Lock, Play, CheckCircle, Trophy, TrendingUp, Sparkles, Star, GraduationCap, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const statColorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  'bg-blue-600': { bg: 'bg-blue-100', text: 'text-blue-600', darkBg: 'dark:bg-blue-950/40', darkText: 'dark:text-blue-400' },
  'bg-green-600': { bg: 'bg-green-100', text: 'text-green-600', darkBg: 'dark:bg-green-950/40', darkText: 'dark:text-green-400' },
  'bg-emerald-600': { bg: 'bg-emerald-100', text: 'text-emerald-600', darkBg: 'dark:bg-emerald-950/40', darkText: 'dark:text-emerald-400' },
  'bg-amber-500': { bg: 'bg-amber-100', text: 'text-amber-600', darkBg: 'dark:bg-amber-950/40', darkText: 'dark:text-amber-400' },
  'bg-purple-600': { bg: 'bg-purple-100', text: 'text-purple-600', darkBg: 'dark:bg-purple-950/40', darkText: 'dark:text-purple-400' },
  'bg-red-600': { bg: 'bg-red-100', text: 'text-red-600', darkBg: 'dark:bg-red-950/40', darkText: 'dark:text-red-400' },
};

function StatCard({ label, value, color, icon: Icon, delay }: { label: string; value: string | number; color: string; icon: any; delay: number }) {
  const mapped = statColorMap[color] ?? { bg: 'bg-gray-100', text: 'text-gray-600', darkBg: 'dark:bg-gray-950/40', darkText: 'dark:text-gray-400' };
  const shadowColor = color.includes("blue")
    ? "hover:shadow-blue-500/10"
    : color.includes("emerald") || color.includes("green")
    ? "hover:shadow-emerald-500/10"
    : color.includes("amber")
    ? "hover:shadow-amber-500/10"
    : "hover:shadow-purple-500/10";
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="flex-1">
      <Card className={`overflow-hidden card-hover border-border/50 ${shadowColor}`}>
        <div className={`h-1.5 ${color}`} />
        <CardContent className="p-4 text-center flex flex-col items-center">
          <div className={`w-10 h-10 rounded-2xl mb-2 flex items-center justify-center ${mapped.bg} ${mapped.darkBg} border border-white/40 dark:border-white/10`}>
            <Icon className={`w-5 h-5 ${mapped.text} ${mapped.darkText}`} />
          </div>
          <p className="text-[11px] text-muted-foreground mb-1 font-medium">{label}</p>
          <p className={`text-xl md:text-2xl font-black ${mapped.text} ${mapped.darkText}`}>{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function StudentHome() {
  const { user } = useAuth();
  const unitsQuery = trpc.units.list.useQuery();
  const studentDataQuery = trpc.students.getMyProfile.useQuery();
  const enrollmentsQuery = trpc.students.getEnrollments.useQuery();
  const myResultsQuery = trpc.testTaking.myResults.useQuery();
  const aiRecQuery = trpc.analytics.studentRecommendation.useQuery();

  const units = unitsQuery.data;
  const studentData = studentDataQuery.data;
  const enrollments = enrollmentsQuery.data;
  const myResults = myResultsQuery.data;
  const aiRec = aiRecQuery.data;

  const isLoading = unitsQuery.isLoading || studentDataQuery.isLoading || enrollmentsQuery.isLoading;
  const isError = unitsQuery.isError || studentDataQuery.isError || enrollmentsQuery.isError;

  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "ar");

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem("lang") || "ar");
    };
    window.addEventListener("storage", handleLangChange);
    window.addEventListener("langChange", handleLangChange);
    return () => {
      window.removeEventListener("storage", handleLangChange);
      window.removeEventListener("langChange", handleLangChange);
    };
  }, []);

  const tHome = {
    ar: {
      welcome: "أهلاً بك مجدداً",
      progress: "تقدمك في المنهج",
      activeUnitsDesc: (enrolled: number, total: number) => `${enrolled} من ${total} وحدات مفعّلة`,
      activeUnits: "الوحدات المفعلة",
      avgScore: "متوسط الدرجات",
      passedTests: "الاختبارات الناجحة",
      aiRec: "توصية الذكاء الاصطناعي",
      courseUnits: "الوحدات الدراسية",
      unitsCount: (count: number) => `${count} وحدة`,
      selectGradeWarning: "حدد صفك الدراسي من صفحة الملف الشخصي لعرض الوحدات المناسبة لك فقط",
      profilePage: "صفحة الملف الشخصي",
      active: "مفعّل",
      locked: "مقفل",
      quizAvg: "متوسط الاختبارات",
      noQuiz: "لم تجرِ أي اختبار في هذه الوحدة بعد",
      joinLive: "🔴 انضم للبث",
      enterUnit: "ادخل الوحدة",
      subscribeAccess: "اشترك للوصول",
      noUnits: "لا توجد وحدات منشورة بعد",
      student: "طالب",
      loadingSkeleton: "جارٍ التحميل...",
      errorMsg: "حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.",
      retry: "إعادة المحاولة",
    },
    en: {
      welcome: "Welcome Back",
      progress: "Course Progress",
      activeUnitsDesc: (enrolled: number, total: number) => `${enrolled} of ${total} active units`,
      activeUnits: "Active Units",
      avgScore: "Average Score",
      passedTests: "Passed Quizzes",
      aiRec: "AI Recommendation",
      courseUnits: "Course Units",
      unitsCount: (count: number) => `${count} Unit${count !== 1 ? "s" : ""}`,
      selectGradeWarning: "Set your grade level in the profile page to show only units matching your grade",
      profilePage: "profile page",
      active: "Active",
      locked: "Locked",
      quizAvg: "Quiz Average",
      noQuiz: "No quizzes taken in this unit yet",
      joinLive: "🔴 Join Stream",
      enterUnit: "Enter Unit",
      subscribeAccess: "Unlock Unit",
      noUnits: "No units published yet",
      student: "Student",
      loadingSkeleton: "Loading...",
      errorMsg: "Something went wrong while loading data. Please try again.",
      retry: "Retry",
    }
  };

  const curr = tHome[lang as "ar" | "en"] || tHome.ar;

  const enrolledUnitIds = new Set((enrollments ?? []).map((e: any) => e.unitId));
  const allPublishedUnits = (units ?? []).filter((u: any) => u.isPublished);
  // Filter by student's grade if set
  const studentGrade = (studentData as any)?.gradeLevel;
  const publishedUnits = studentGrade
    ? allPublishedUnits.filter((u: any) => !u.gradeLevel || u.gradeLevel === studentGrade)
    : allPublishedUnits;

  const totalTests = (myResults as any[])?.length ?? 0;
  const passedTests = (myResults as any[])?.filter((r: any) => r.passed).length ?? 0;
  const avgScore = totalTests > 0
    ? Math.round((myResults as any[]).reduce((sum: number, r: any) => sum + Number(r.percentage), 0) / totalTests)
    : 0;

  const progressPct = publishedUnits.length > 0 ? Math.round((enrolledUnitIds.size / publishedUnits.length) * 100) : 0;
  const studentName = studentData?.nameAr ?? user?.name ?? curr.student;

  // Loading skeleton
  if (isLoading) {
    return (
      <StudentLayout>
        <div className="space-y-6 animate-pulse">
          {/* Hero skeleton */}
          <div className="rounded-2xl bg-muted/60 h-40" />
          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-muted/60 h-28" />
            ))}
          </div>
          {/* Units skeleton */}
          <div className="space-y-4">
            <div className="h-6 w-32 bg-muted/60 rounded" />
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl bg-muted/60 h-44" />
              ))}
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Error fallback
  if (isError) {
    return (
      <StudentLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <BookOpen className="w-7 h-7 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">{curr.errorMsg}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            {curr.retry}
          </Button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      {/* Live Lecture Banner */}
      <div className="mb-4">
        <LiveLectureBanner />
      </div>
      {/* Welcome Hero */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-primary via-primary/95 to-indigo-800 text-primary-foreground p-6 shadow-lg shadow-primary/15"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      >
        {/* Background glow and graphics */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-400 rounded-full blur-2xl" />
          <div className="absolute top-1/2 -right-8 w-40 h-40 bg-cyan-400 rounded-full blur-2xl" />
        </div>
        {/* Fine pattern overlay */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-primary-foreground/75 text-xs mb-1 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                {curr.welcome}
              </p>
              <h2 className="text-2xl font-black tracking-tight">{studentName}</h2>
            </div>
            <motion.div
              className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner"
              animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </motion.div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-primary-foreground/85">{curr.progress}</span>
              <span className="font-bold text-amber-300">{progressPct}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
              />
            </div>
            <p className="text-[11px] text-primary-foreground/75 mt-1">{curr.activeUnitsDesc(enrolledUnitIds.size, publishedUnits.length)}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label={curr.activeUnits} value={enrolledUnitIds.size} color="bg-blue-600" icon={BookOpen} delay={0.1} />
        <StatCard
          label={curr.avgScore}
          value={`${avgScore}%`}
          color={avgScore >= 80 ? "bg-emerald-600" : avgScore >= 60 ? "bg-amber-500" : "bg-red-600"}
          icon={TrendingUp}
          delay={0.15}
        />
        <StatCard label={curr.passedTests} value={`${passedTests}/${totalTests}`} color="bg-purple-600" icon={Trophy} delay={0.2} />
      </div>

      {/* AI Recommendation */}
      <AnimatePresence>
        {aiRec?.recommendation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="border-amber-200 bg-gradient-to-l from-amber-50 to-yellow-50 overflow-hidden dark:from-slate-900 dark:to-amber-950/20 dark:border-amber-900/40">
              <div className="h-1 bg-gradient-to-l from-amber-400 to-yellow-400" />
              <CardContent className="p-4 flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {curr.aiRec}
                  </p>
                  <p className="text-sm text-amber-900 dark:text-slate-300 leading-relaxed">{aiRec.recommendation}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Units Grid */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{curr.courseUnits}</h3>
        <div className="flex items-center gap-2">
          {studentGrade && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1">
              <GraduationCap className="w-3 h-3" />
              {studentGrade}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">{curr.unitsCount(publishedUnits.length)}</Badge>
        </div>
      </div>

      {!studentGrade && allPublishedUnits.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 flex items-center gap-2 dark:bg-amber-950/20 dark:border-amber-900/35 dark:text-amber-400">
          <GraduationCap className="w-4 h-4 flex-shrink-0" />
          <span>
            {lang === "ar" ? (
              <>حدد صفك الدراسي من <Link href="/student/profile" className="underline font-semibold">صفحة الملف الشخصي</Link> لعرض الوحدات المناسبة لك فقط</>
            ) : (
              <>Set your grade level in the <Link href="/student/profile" className="underline font-semibold">profile page</Link> to show only units matching your grade</>
            )}
          </span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {publishedUnits.map((unit: any, idx: number) => {
          const isEnrolled = enrolledUnitIds.has(unit.id);
          const unitResults = (myResults as any[] ?? []).filter((r: any) => r.unitId === unit.id);
          const unitAvg = unitResults.length > 0
            ? Math.round(unitResults.reduce((s: number, r: any) => s + Number(r.percentage), 0) / unitResults.length)
            : null;

          return (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.07 }}
              whileHover={{ y: -2 }}
            >
              <Card className={`h-full overflow-hidden transition-all duration-300 ${isEnrolled ? "border-primary/40 shadow-md shadow-primary/10" : "border-border hover:border-border/80 hover:shadow-md"}`}>
                {isEnrolled && <div className="h-1 bg-gradient-to-l from-primary to-indigo-500" />}
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${isEnrolled ? "bg-gradient-to-br from-primary/20 to-indigo-100 dark:from-primary/20 dark:to-indigo-950/40" : "bg-muted"}`}>
                        {isEnrolled ? (
                          <span className="text-primary font-black text-lg">{idx + 1}</span>
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm leading-snug">
                          {lang === "en" ? unit.titleEn : unit.titleAr}
                        </h4>
                        <p className="text-xs text-muted-foreground italic">
                          {lang === "en" ? unit.titleAr : unit.titleEn}
                        </p>
                      </div>
                    </div>
                  {isEnrolled ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs border-0 gap-1 flex-shrink-0">
                      <CheckCircle className="w-3 h-3" />
                      {curr.active}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">{curr.locked}</Badge>
                  )}
                  </div>

                  {unit.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{unit.description}</p>
                  )}

                  {isEnrolled && unitAvg !== null && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">{curr.quizAvg}</span>
                        <span className={`font-bold ${unitAvg >= 80 ? "text-emerald-600" : unitAvg >= 60 ? "text-amber-600" : "text-red-600"}`}>{unitAvg}%</span>
                      </div>
                      <Progress value={unitAvg} className="h-1.5" />
                    </div>
                  )}

                  {isEnrolled && unitAvg === null && (
                    <p className="text-xs text-muted-foreground mb-3 italic">{curr.noQuiz}</p>
                  )}

                  <div className="flex gap-2 mt-auto">
                    {isEnrolled ? (
                      <Link href={unit.isLivePass ? `/student/live/${unit.id}` : `/student/lesson/${unit.id}`} className="flex-1">
                        <Button
                          className={`w-full gap-2 h-8 text-xs shadow-sm ${unit.isLivePass ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
                          size="sm"
                        >
                          {unit.isLivePass ? (
                            <>{curr.joinLive}</>
                          ) : (
                            <><Play className="w-3 h-3" /> {curr.enterUnit}</>
                          )}
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/student/wallet" className="flex-1">
                        <Button className="w-full gap-2 h-8 text-xs" size="sm" variant="outline">
                          <ArrowLeft className={`w-3 h-3 ${lang === "ar" ? "" : "rotate-180"}`} />
                          {curr.subscribeAccess}
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {publishedUnits.length === 0 && (
        <motion.div className="text-center py-16 text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>{curr.noUnits}</p>
        </motion.div>
      )}
    </StudentLayout>
  );
}
