import { useState, useEffect } from "react";
import TeacherLayout from "./TeacherLayout";
import LiveLectureBanner from "./LiveLectureBanner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BookOpen, CreditCard, GraduationCap, Lightbulb, TrendingUp, Users, Sparkles, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const CHART_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e"];

/* ─── Bilingual translations ─── */
const t = {
  ar: {
    pageTitle: "لوحة القيادة",
    totalRevenue: "إجمالي الإيرادات",
    totalStudents: "إجمالي الطلاب",
    avgScore: "متوسط الدرجات",
    publishedUnits: "الوحدات المنشورة",
    currency: "جنيه",
    missedQuestionsTitle: "أكثر الأسئلة التي يخطئ فيها الطلاب",
    noDataYet: "لا توجد بيانات كافية بعد",
    chartTooltipStudent: "طالب",
    chartTooltipLabel: "عدد الأخطاء",
    aiInsightsTitle: "تحليل الذكاء الاصطناعي",
    aiAnalyzing: "جاري التحليل...",
    aiPowered: "مدعوم بالذكاء الاصطناعي",
    recentTransactions: "آخر المعاملات المالية",
    transactionCount: "معاملة",
    noTransactions: "لا توجد معاملات بعد",
    studentLabel: "طالب",
    statusSuccess: "ناجح",
    statusPending: "معلق",
    statusFailed: "فاشل",
    vodafoneCash: "فودافون كاش",
    fawry: "فوري",
    coupon: "كوبون",
    manual: "يدوي",
    dateLocale: "ar-EG",
    sampleUnits: "وحدات",
  },
  en: {
    pageTitle: "Dashboard",
    totalRevenue: "Total Revenue",
    totalStudents: "Total Students",
    avgScore: "Average Score",
    publishedUnits: "Published Units",
    currency: "EGP",
    missedQuestionsTitle: "Most Missed Questions by Students",
    noDataYet: "No sufficient data yet",
    chartTooltipStudent: "student(s)",
    chartTooltipLabel: "Wrong Answers",
    aiInsightsTitle: "AI Analysis",
    aiAnalyzing: "Analyzing...",
    aiPowered: "Powered by AI",
    recentTransactions: "Recent Transactions",
    transactionCount: "transaction(s)",
    noTransactions: "No transactions yet",
    studentLabel: "Student",
    statusSuccess: "Success",
    statusPending: "Pending",
    statusFailed: "Failed",
    vodafoneCash: "Vodafone Cash",
    fawry: "Fawry",
    coupon: "Coupon",
    manual: "Manual",
    dateLocale: "en-US",
    sampleUnits: "units",
  },
} as const;

export default function TeacherDashboard() {
  /* ─── Language state ─── */
  const [lang, setLang] = useState<"ar" | "en">(
    () => (localStorage.getItem("lang") as "ar" | "en") || "ar"
  );

  useEffect(() => {
    const handler = () => setLang((localStorage.getItem("lang") as "ar" | "en") || "ar");
    window.addEventListener("langChange", handler);
    return () => window.removeEventListener("langChange", handler);
  }, []);

  const curr = t[lang];

  const { data: stats, isLoading: statsLoading } = trpc.analytics.dashboardStats.useQuery();
  const { data: insight, isLoading: insightLoading } = trpc.analytics.aiInsights.useQuery();
  const { data: transactions } = trpc.payments.listTransactions.useQuery();
  const { data: testPerf } = trpc.analytics.testPerformance.useQuery();

  const recentTransactions = transactions?.slice(0, 5) ?? [];

  const paymentMethodLabel: Record<string, string> = {
    coupon: curr.coupon,
    fawry: curr.fawry,
    vodafone_cash: curr.vodafoneCash,
    manual: curr.manual,
  };

  const statCards = [
    {
      label: curr.totalRevenue,
      value: statsLoading ? null : `${Number(stats?.totalRevenue ?? 0).toFixed(0)} ${curr.currency}`,
      icon: CreditCard,
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      text: "text-emerald-700 dark:text-emerald-400",
    },
    {
      label: curr.totalStudents,
      value: statsLoading ? null : stats?.totalStudents?.toString(),
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-400",
    },
    {
      label: curr.avgScore,
      value: statsLoading ? null : `${stats?.avgTestScore ?? 0}%`,
      icon: TrendingUp,
      gradient: "from-purple-500 to-violet-600",
      bg: "bg-purple-50 dark:bg-purple-900/30",
      text: "text-purple-700 dark:text-purple-400",
    },
    {
      label: curr.publishedUnits,
      value: statsLoading ? null : stats?.publishedUnits?.toString(),
      icon: BookOpen,
      gradient: "from-amber-500 to-orange-600",
      bg: "bg-amber-50 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-400",
    },
  ];

  return (
    <TeacherLayout title={curr.pageTitle}>
      <div dir={lang === "ar" ? "rtl" : "ltr"}>
        {/* Live Lecture Banner */}
        <div className="mb-4">
          <LiveLectureBanner isTeacher />
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                <div className={`h-1 bg-gradient-to-l ${card.gradient}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground mb-1 truncate">{card.label}</p>
                      {statsLoading ? (
                        <Skeleton className="h-7 w-20" />
                      ) : (
                        <motion.p
                          className={`text-2xl font-black ${card.text}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08 + 0.2 }}
                        >
                          {card.value}
                        </motion.p>
                      )}
                    </div>
                    <div className={`w-11 h-11 rounded-2xl ${card.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <card.icon className={`w-5 h-5 ${card.text}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Most Missed Questions Chart */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  {curr.missedQuestionsTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testPerf?.missedQuestions && testPerf.missedQuestions.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={testPerf.missedQuestions} layout="vertical" margin={{ right: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.5} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="id" tick={{ fontSize: 10 }} width={30} />
                      <Tooltip
                        formatter={(value) => [`${value} ${curr.chartTooltipStudent}`, curr.chartTooltipLabel]}
                        contentStyle={{ fontFamily: "Cairo, sans-serif", direction: lang === "ar" ? "rtl" : "ltr", borderRadius: 8 }}
                      />
                      <Bar dataKey="wrongCount" radius={[0, 6, 6, 0]}>
                        {(testPerf.missedQuestions as any[]).map((_: any, index: number) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <GraduationCap className="w-8 h-8 opacity-20" />
                    <p className="text-sm">{curr.noDataYet}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Insights */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/5 to-indigo-50/50 dark:to-indigo-950/30 overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-primary to-indigo-500" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  {curr.aiInsightsTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insightLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <div className="flex items-start gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground leading-relaxed">{String(insight?.insight ?? curr.aiAnalyzing)}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                      <Sparkles className={`w-2.5 h-2.5 ${lang === "ar" ? "ml-1" : "mr-1"}`} />
                      {curr.aiPowered}
                    </Badge>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  {curr.recentTransactions}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">{recentTransactions.length} {curr.transactionCount}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">{curr.noTransactions}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentTransactions.map((txn: any, i: number) => (
                    <motion.div
                      key={txn.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">#{txn.studentId}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{curr.studentLabel} #{txn.studentId}</p>
                          <p className="text-xs text-muted-foreground">
                            {paymentMethodLabel[txn.paymentMethod] ?? txn.paymentMethod} · {new Date(txn.createdAt).toLocaleDateString(curr.dateLocale)}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 ${lang === "ar" ? "text-left" : "text-right"}`}>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{Number(txn.amountEgp).toFixed(0)} {curr.currency}</p>
                        <Badge
                          variant={txn.status === "success" ? "default" : txn.status === "pending" ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {txn.status === "success" ? curr.statusSuccess : txn.status === "pending" ? curr.statusPending : curr.statusFailed}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TeacherLayout>
  );
}
