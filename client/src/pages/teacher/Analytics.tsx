import { useState, useEffect } from "react";
import TeacherLayout from "@/components/portal/TeacherLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceLine,
} from "recharts";
import { AlertTriangle, BarChart3, Eye, Lightbulb, TrendingUp, TrendingDown, Users, Star, Video, GraduationCap } from "lucide-react";
import { RadialBarChart, RadialBar } from "recharts";
import { motion } from "framer-motion";

const BEST_COLORS = ["#1e40af", "#0891b2", "#059669"];
const WORST_COLORS = ["#dc2626", "#d97706", "#7c3aed"];

const t = {
  ar: {
    pageTitle: "التحليلات والتقارير",
    filterTitle: "تصفية حسب الصف الدراسي",
    filterDesc: "عرض الإحصائيات والتقارير الخاصة بالصف المحدد",
    allGrades: "كل الصفوف (الكل)",
    allGradesPlaceholder: "كل الصفوف",
    totalStudents: "إجمالي الطلاب",
    avgScore: "متوسط الدرجات",
    atRiskCount: "الطلاب في خطر",
    publishedUnits: "الوحدات المنشورة",
    missedQuestionsTitle: "أكثر الأسئلة التي يخطئ فيها الطلاب",
    studentsCount: "طالب",
    errorsCount: "عدد الأخطاء",
    noSufficientData: "لا توجد بيانات كافية",
    aiInsightsTitle: "تحليل الذكاء الاصطناعي",
    aiAnalyzing: "جارٍ تحليل البيانات...",
    performanceCurvesTitle: "منحنيات أداء الطلاب عبر الزمن",
    bestPerforming: "الأفضل أداءً",
    needsSupport: "يحتاجون دعم",
    curvesSubtitle: (best: number, worst: number) => `يعرض أعلى ${best} طلاب أداءً (خط متصل) وأدنى ${worst} طلاب أداءً (خط منقط) فقط`,
    passLimit: "حد النجاح 60%",
    noCurvesData: "لا توجد بيانات كافية لعرض المنحنيات",
    videoWatchTitle: "إحصائيات مشاهدة الفيديوهات",
    videoWatchDesc: "نسبة المشاهدة لكل درس وكل طالب — يُحدَّث تلقائياً أثناء المشاهدة",
    noVideoData: "لا توجد بيانات مشاهدة بعد — ستظهر هنا بعد أن يشاهد الطلاب الفيديوهات",
    avgWatchPerLesson: "متوسط المشاهدة لكل درس",
    avgWatchPerStudent: "متوسط مشاهدة كل طالب",
    lessonLabel: "درس",
    atRiskTitle: "الطلاب في خطر (متوسط أقل من 60%)",
    testLabel: "اختبار",
    latestTest: "آخر اختبار",
    allPerformingWell: "جميع الطلاب يؤدون بشكل جيد!",
  },
  en: {
    pageTitle: "Analytics & Reports",
    filterTitle: "Filter by Grade Level",
    filterDesc: "View stats and reports for the selected grade",
    allGrades: "All Grades",
    allGradesPlaceholder: "All Grades",
    totalStudents: "Total Students",
    avgScore: "Average Score",
    atRiskCount: "At-Risk Students",
    publishedUnits: "Published Units",
    missedQuestionsTitle: "Most Missed Questions",
    studentsCount: "students",
    errorsCount: "Error count",
    noSufficientData: "No sufficient data",
    aiInsightsTitle: "AI Analysis",
    aiAnalyzing: "Analyzing data...",
    performanceCurvesTitle: "Student Performance Trends Over Time",
    bestPerforming: "Top Performers",
    needsSupport: "Needs Support",
    curvesSubtitle: (best: number, worst: number) => `Showing top ${best} performing students (solid line) and lowest ${worst} performing students (dashed line)`,
    passLimit: "Pass threshold 60%",
    noCurvesData: "No sufficient data to display performance trends",
    videoWatchTitle: "Video Watch Statistics",
    videoWatchDesc: "Watch completion percentage per lesson and student — updates automatically during playback",
    noVideoData: "No watch data yet — will appear here once students watch lecture videos",
    avgWatchPerLesson: "Average Watch % per Lesson",
    avgWatchPerStudent: "Average Watch % per Student",
    lessonLabel: "lesson",
    atRiskTitle: "At-Risk Students (Average below 60%)",
    testLabel: "tests",
    latestTest: "Latest test",
    allPerformingWell: "All students are performing well!",
  },
} as const;

function VideoWatchSection({ selectedGrade, lang }: { selectedGrade: string; lang: "ar" | "en" }) {
  const curr = t[lang];
  const { data: watchData, isLoading } = trpc.analytics.videoWatchSummary.useQuery({ gradeLevel: selectedGrade });
  const lessonStats: any[] = (watchData as any)?.lessonStats ?? [];
  const studentStats: any[] = (watchData as any)?.studentStats ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            {curr.videoWatchTitle}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{curr.videoWatchDesc}</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : lessonStats.length === 0 && studentStats.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Video className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">{curr.noVideoData}</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Per-Lesson Average Watch % */}
              {lessonStats.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-3">{curr.avgWatchPerLesson}</p>
                  <div className="space-y-3">
                    {lessonStats.slice(0, 8).map((lesson: any) => (
                      <div key={lesson.lessonId}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="truncate max-w-[180px]" title={lesson.lessonTitle}>{lesson.lessonTitle}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-muted-foreground">{lesson.viewerCount} {curr.studentsCount}</span>
                            <span className={`font-bold ${
                              lesson.avgWatchPercent >= 80 ? "text-emerald-600" :
                              lesson.avgWatchPercent >= 50 ? "text-amber-600" : "text-red-600"
                            }`}>{lesson.avgWatchPercent}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              lesson.avgWatchPercent >= 80 ? "bg-emerald-50" :
                              lesson.avgWatchPercent >= 50 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${lesson.avgWatchPercent}%` }}
                            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Per-Student Average Watch % */}
              {studentStats.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-3">{curr.avgWatchPerStudent}</p>
                  <div className="space-y-2">
                    {studentStats.slice(0, 8).map((student: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: lang === "ar" ? 10 : -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold text-xs">{String(student.name ?? "").charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{student.name}</p>
                          <p className="text-[10px] text-muted-foreground">{student.lessons} {curr.lessonLabel}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${
                              student.avgPercent >= 80 ? "bg-emerald-500" :
                              student.avgPercent >= 50 ? "bg-amber-500" : "bg-red-500"
                            }`} style={{ width: `${student.avgPercent}%` }} />
                          </div>
                          <span className={`text-xs font-bold w-8 ${lang === "ar" ? "text-right" : "text-left"} ${
                            student.avgPercent >= 80 ? "text-emerald-600" :
                            student.avgPercent >= 50 ? "text-amber-600" : "text-red-600"
                          }`}>{student.avgPercent}%</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function TeacherAnalytics() {
  const [lang, setLang] = useState<"ar" | "en">(
    () => (localStorage.getItem("lang") as "ar" | "en") || "ar"
  );

  useEffect(() => {
    const handler = () => setLang((localStorage.getItem("lang") as "ar" | "en") || "ar");
    window.addEventListener("langChange", handler);
    return () => window.removeEventListener("langChange", handler);
  }, []);

  const curr = t[lang];

  const [selectedGrade, setSelectedGrade] = useState("all");
  const { data: gradeLevels } = trpc.units.gradeLevels.useQuery();
  const { data: testPerf, isLoading: perfLoading } = trpc.analytics.testPerformance.useQuery({ gradeLevel: selectedGrade });
  const { data: trends, isLoading: trendsLoading } = trpc.analytics.studentPerformanceTrends.useQuery({ gradeLevel: selectedGrade });
  const { data: atRisk, isLoading: riskLoading } = trpc.analytics.atRiskStudents.useQuery({ gradeLevel: selectedGrade });
  const { data: insight, isLoading: insightLoading } = trpc.analytics.aiInsights.useQuery({ gradeLevel: selectedGrade });
  const { data: stats } = trpc.analytics.dashboardStats.useQuery({ gradeLevel: selectedGrade });

  // Build safe line chart data using stable keys (s0, s1, ...) instead of Arabic names
  const safeStudents: Array<{ key: string; name: string; tier: string; avgScore: number }> = [];
  const lineData: Array<Record<string, string | number>> = [];

  if (trends && Array.isArray(trends) && trends.length > 0) {
    trends.forEach((student: any, i: number) => {
      safeStudents.push({
        key: `s${i}`,
        name: String(student.name ?? (lang === "ar" ? `طالب ${i + 1}` : `Student ${i + 1}`)),
        tier: String(student.tier ?? "best"),
        avgScore: Number(student.avgScore ?? 0),
      });
    });
    const dateSet = new Set<string>();
    trends.forEach((student: any) => {
      if (Array.isArray(student.results)) {
        student.results.forEach((r: any) => { if (r?.date) dateSet.add(String(r.date)); });
      }
    });
    const allDates = Array.from(dateSet).sort();
    for (const date of allDates) {
      const entry: Record<string, string | number> = { date };
      trends.forEach((student: any, i: number) => {
        const key = `s${i}`;
        const result = Array.isArray(student.results) ? student.results.find((r: any) => r?.date === date) : null;
        if (result) entry[key] = Number(result.score ?? 0);
      });
      lineData.push(entry);
    }
  }

  const missedQuestions = testPerf?.missedQuestions ?? [];
  const atRiskList = atRisk ?? [];
  const bestStudents = safeStudents.filter(s => s.tier === "best");
  const worstStudents = safeStudents.filter(s => s.tier === "worst");

  return (
    <TeacherLayout title={curr.pageTitle}>
      <div dir={lang === "ar" ? "rtl" : "ltr"}>
        {/* Grade Filter */}
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border shadow-sm mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">{curr.filterTitle}</h2>
              <p className="text-xs text-muted-foreground">{curr.filterDesc}</p>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={curr.allGradesPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{curr.allGrades}</SelectItem>
                {(gradeLevels as string[])?.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: curr.totalStudents, value: stats?.totalStudents ?? 0, icon: Users, color: "text-blue-600 bg-blue-50" },
            { label: curr.avgScore, value: `${stats?.avgTestScore ?? 0}%`, icon: BarChart3, color: "text-green-600 bg-green-50" },
            { label: curr.atRiskCount, value: (atRiskList as any[]).length, icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
            { label: curr.publishedUnits, value: stats?.publishedUnits ?? 0, icon: Star, color: "text-purple-600 bg-purple-50" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-2xl font-black">{String(s.value)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Most Missed Questions */}
          <motion.div initial={{ opacity: 0, x: lang === "ar" ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  {curr.missedQuestionsTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {perfLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : (Array.isArray(missedQuestions) && missedQuestions.length > 0) ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={missedQuestions as any[]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="id" tick={{ fontSize: 10 }} width={30} />
                      <Tooltip formatter={(v: any) => [`${v} ${curr.studentsCount}`, curr.errorsCount]} contentStyle={{ fontFamily: "Cairo, sans-serif", direction: lang === "ar" ? "rtl" : "ltr" }} />
                      <Bar dataKey="wrongCount" fill="#1e40af" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">{curr.noSufficientData}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Insights */}
          <motion.div initial={{ opacity: 0, x: lang === "ar" ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-background h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  {curr.aiInsightsTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insightLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-4 w-full" />)}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-amber-900">
                    {String(insight?.insight ?? curr.aiAnalyzing)}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Curves: Best vs Worst */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  {curr.performanceCurvesTitle}
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  {bestStudents.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                      <TrendingUp className="w-3 h-3" />
                      {curr.bestPerforming}
                    </div>
                  )}
                  {worstStudents.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                      <TrendingDown className="w-3 h-3" />
                      {curr.needsSupport}
                    </div>
                  )}
                </div>
              </div>
              {safeStudents.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {curr.curvesSubtitle(bestStudents.length, worstStudents.length)}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : lineData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                      <Tooltip
                        formatter={(v: any, key: string) => {
                          const student = safeStudents.find(s => s.key === key);
                          return [`${v}%`, student?.name ?? key];
                        }}
                        contentStyle={{ fontFamily: "Cairo, sans-serif", direction: lang === "ar" ? "rtl" : "ltr" }}
                      />
                      <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4"
                        label={{ value: curr.passLimit, position: lang === "ar" ? "insideTopRight" : "insideTopLeft", fontSize: 10, fill: "#f59e0b" }} />
                      <Legend formatter={(key: string) => { const s = safeStudents.find(st => st.key === key); return s?.name ?? key; }} />
                      {bestStudents.map((student, i) => (
                        <Line key={student.key} type="monotone" dataKey={student.key} name={student.key}
                          stroke={BEST_COLORS[i % BEST_COLORS.length]} strokeWidth={2.5} dot={{ r: 4 }} connectNulls />
                      ))}
                      {worstStudents.map((student, i) => (
                        <Line key={student.key} type="monotone" dataKey={student.key} name={student.key}
                          stroke={WORST_COLORS[i % WORST_COLORS.length]} strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} connectNulls />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                  {/* Summary legend */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bestStudents.length > 0 && (
                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <div className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> {curr.bestPerforming}
                        </div>
                        {bestStudents.map((s, i) => (
                          <div key={s.key} className="flex items-center gap-2 text-xs text-blue-800 mb-1.5">
                            <div className="w-4 h-1 rounded-full" style={{ backgroundColor: BEST_COLORS[i] }} />
                            <span className="flex-1">{s.name}</span>
                            <span className="font-bold">{s.avgScore}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {worstStudents.length > 0 && (
                      <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                        <div className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" /> {curr.needsSupport}
                        </div>
                        {worstStudents.map((s, i) => (
                          <div key={s.key} className="flex items-center gap-2 text-xs text-red-800 mb-1.5">
                            <div className="w-4 h-0.5 rounded border-t-2 border-dashed" style={{ borderColor: WORST_COLORS[i] }} />
                            <span className="flex-1">{s.name}</span>
                            <span className="font-bold">{s.avgScore}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">{curr.noCurvesData}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Video Watch Progress */}
        <VideoWatchSection selectedGrade={selectedGrade} lang={lang} />

        {/* At-Risk Students */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {curr.atRiskTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {riskLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (Array.isArray(atRiskList) && atRiskList.length > 0) ? (
                <div className="space-y-3">
                  {(atRiskList as any[]).map((student: any, i: number) => (
                    <motion.div key={student.studentId} initial={{ opacity: 0, x: lang === "ar" ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                          <span className="text-amber-700 font-bold text-sm">{String(student.name ?? "").charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{String(student.name ?? "")}</p>
                          <p className="text-xs text-muted-foreground">{student.testCount} {curr.testLabel}</p>
                        </div>
                      </div>
                      <div className={lang === "ar" ? "text-left" : "text-right"}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-20 h-2 bg-amber-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.min(student.avgScore, 100)}%` }} />
                          </div>
                          <p className="text-sm font-bold text-amber-700">{student.avgScore}%</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{curr.latestTest}: {student.latestScore}%</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-sm px-4 py-1">
                    {curr.allPerformingWell}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TeacherLayout>
  );
}
