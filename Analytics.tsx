import TeacherLayout from "./TeacherLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceLine,
} from "recharts";
import { AlertTriangle, BarChart3, Eye, Lightbulb, TrendingUp, TrendingDown, Users, Star, Video } from "lucide-react";
import { RadialBarChart, RadialBar } from "recharts";
import { motion } from "framer-motion";

const BEST_COLORS = ["#1e40af", "#0891b2", "#059669"];
const WORST_COLORS = ["#dc2626", "#d97706", "#7c3aed"];

function VideoWatchSection() {
  const { data: watchData, isLoading } = trpc.analytics.videoWatchSummary.useQuery();
  const lessonStats: any[] = (watchData as any)?.lessonStats ?? [];
  const studentStats: any[] = (watchData as any)?.studentStats ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            إحصائيات مشاهدة الفيديوهات
          </CardTitle>
          <p className="text-xs text-muted-foreground">نسبة المشاهدة لكل درس وكل طالب — يُحدَّث تلقائياً أثناء المشاهدة</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : lessonStats.length === 0 && studentStats.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Video className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">لا توجد بيانات مشاهدة بعد — ستظهر هنا بعد أن يشاهد الطلاب الفيديوهات</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Per-Lesson Average Watch % */}
              {lessonStats.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-3">متوسط المشاهدة لكل درس</p>
                  <div className="space-y-3">
                    {lessonStats.slice(0, 8).map((lesson: any) => (
                      <div key={lesson.lessonId}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="truncate max-w-[180px]" title={lesson.lessonTitle}>{lesson.lessonTitle}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-muted-foreground">{lesson.viewerCount} طالب</span>
                            <span className={`font-bold ${
                              lesson.avgWatchPercent >= 80 ? "text-emerald-600" :
                              lesson.avgWatchPercent >= 50 ? "text-amber-600" : "text-red-600"
                            }`}>{lesson.avgWatchPercent}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              lesson.avgWatchPercent >= 80 ? "bg-emerald-500" :
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
                  <p className="text-xs font-semibold text-muted-foreground mb-3">متوسط مشاهدة كل طالب</p>
                  <div className="space-y-2">
                    {studentStats.slice(0, 8).map((student: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold text-xs">{String(student.name ?? "").charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{student.name}</p>
                          <p className="text-[10px] text-muted-foreground">{student.lessons} درس</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${
                              student.avgPercent >= 80 ? "bg-emerald-500" :
                              student.avgPercent >= 50 ? "bg-amber-500" : "bg-red-500"
                            }`} style={{ width: `${student.avgPercent}%` }} />
                          </div>
                          <span className={`text-xs font-bold w-8 text-right ${
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
  const { data: testPerf, isLoading: perfLoading } = trpc.analytics.testPerformance.useQuery();
  const { data: trends, isLoading: trendsLoading } = trpc.analytics.studentPerformanceTrends.useQuery();
  const { data: atRisk, isLoading: riskLoading } = trpc.analytics.atRiskStudents.useQuery();
  const { data: insight, isLoading: insightLoading } = trpc.analytics.aiInsights.useQuery();
  const { data: stats } = trpc.analytics.dashboardStats.useQuery();

  // Build safe line chart data using stable keys (s0, s1, ...) instead of Arabic names
  const safeStudents: Array<{ key: string; name: string; tier: string; avgScore: number }> = [];
  const lineData: Array<Record<string, string | number>> = [];

  if (trends && Array.isArray(trends) && trends.length > 0) {
    trends.forEach((student: any, i: number) => {
      safeStudents.push({
        key: `s${i}`,
        name: String(student.name ?? `طالب ${i + 1}`),
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
    <TeacherLayout title="التحليلات والتقارير">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "إجمالي الطلاب", value: stats?.totalStudents ?? 0, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "متوسط الدرجات", value: `${stats?.avgTestScore ?? 0}%`, icon: BarChart3, color: "text-green-600 bg-green-50" },
          { label: "الطلاب في خطر", value: (atRiskList as any[]).length, icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
          { label: "الوحدات المنشورة", value: stats?.publishedUnits ?? 0, icon: Star, color: "text-purple-600 bg-purple-50" },
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
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                أكثر الأسئلة التي يخطئ فيها الطلاب
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
                    <Tooltip formatter={(v: any) => [`${v} طالب`, "عدد الأخطاء"]} contentStyle={{ fontFamily: "Cairo, sans-serif", direction: "rtl" }} />
                    <Bar dataKey="wrongCount" fill="#1e40af" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات كافية</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-background h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                تحليل الذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insightLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-4 w-full" />)}
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-amber-900">
                  {String(insight?.insight ?? "جارٍ تحليل البيانات...")}
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
                منحنيات أداء الطلاب عبر الزمن
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                {bestStudents.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                    <TrendingUp className="w-3 h-3" />
                    الأفضل أداءً
                  </div>
                )}
                {worstStudents.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                    <TrendingDown className="w-3 h-3" />
                    يحتاجون دعم
                  </div>
                )}
              </div>
            </div>
            {safeStudents.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                يعرض أعلى {bestStudents.length} طلاب أداءً (خط متصل) وأدنى {worstStudents.length} طلاب أداءً (خط منقط) فقط
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
                      contentStyle={{ fontFamily: "Cairo, sans-serif", direction: "rtl" }}
                    />
                    <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4"
                      label={{ value: "حد النجاح 60%", position: "insideTopRight", fontSize: 10, fill: "#f59e0b" }} />
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
                        <TrendingUp className="w-3 h-3" /> الأفضل أداءً
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
                        <TrendingDown className="w-3 h-3" /> يحتاجون دعم
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
              <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات كافية لعرض المنحنيات</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Video Watch Progress */}
      <VideoWatchSection />

      {/* At-Risk Students */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              الطلاب في خطر (متوسط أقل من 60%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {riskLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (Array.isArray(atRiskList) && atRiskList.length > 0) ? (
              <div className="space-y-3">
                {(atRiskList as any[]).map((student: any, i: number) => (
                  <motion.div key={student.studentId} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-700 font-bold text-sm">{String(student.name ?? "").charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{String(student.name ?? "")}</p>
                        <p className="text-xs text-muted-foreground">{student.testCount} اختبار</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-20 h-2 bg-amber-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.min(student.avgScore, 100)}%` }} />
                        </div>
                        <p className="text-sm font-bold text-amber-700">{student.avgScore}%</p>
                      </div>
                      <p className="text-xs text-muted-foreground">آخر اختبار: {student.latestScore}%</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-sm px-4 py-1">
                  جميع الطلاب يؤدون بشكل جيد!
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </TeacherLayout>
  );
}
