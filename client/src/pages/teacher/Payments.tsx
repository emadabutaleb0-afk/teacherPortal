import { useState } from "react";
import TeacherLayout from "@/components/portal/TeacherLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CreditCard, Download, Plus, Tag, Calendar, Clock, Layers, TrendingUp, AlertCircle, Package } from "lucide-react";
import { motion } from "framer-motion";

const METHOD_LABELS: Record<string, string> = { coupon: "كوبون", fawry: "فوري", vodafone_cash: "فودافون كاش", manual: "يدوي" };
const STATUS_LABELS: Record<string, string> = { success: "ناجح", pending: "معلق", failed: "فاشل" };
const STATUS_COLORS: Record<string, string> = {
  success: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
};
const PLAN_TYPE_LABELS: Record<string, string> = { semester: "فصل دراسي", session: "جلسات", unit: "وحدة", full_course: "كورس كامل" };
const PLAN_ICONS: Record<string, any> = { semester: Calendar, session: Clock, unit: Layers, full_course: CreditCard };
const PLAN_COLORS: Record<string, string> = {
  semester: "from-blue-500 to-indigo-600",
  session: "from-green-500 to-emerald-600",
  unit: "from-purple-500 to-violet-600",
  full_course: "from-amber-500 to-orange-600",
};

export default function TeacherPayments() {
  const utils = trpc.useUtils();
  const { data: transactions, isLoading: txnLoading } = trpc.payments.listTransactions.useQuery();
  const { data: coupons } = trpc.payments.listCoupons.useQuery();
  const { data: plans } = trpc.subscriptions.listAllPlans.useQuery();
  const { data: units } = trpc.units.list.useQuery();

  const [couponDialog, setCouponDialog] = useState(false);
  const [planDialog, setPlanDialog] = useState(false);
  const [couponForm, setCouponForm] = useState({ count: 5, valueEgp: "150" });
  const [planForm, setPlanForm] = useState({
    nameAr: "", planType: "semester" as "semester" | "session" | "unit" | "full_course",
    priceEgp: "", durationDays: "", sessionsIncluded: "", description: "",
  });

  const generateCoupons = trpc.payments.generateCoupons.useMutation({
    onSuccess: (data: any) => {
      utils.payments.listCoupons.invalidate();
      setCouponDialog(false);
      toast.success(`تم إنشاء ${data.codes.length} كوبون بنجاح`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const createPlan = trpc.subscriptions.createPlan.useMutation({
    onSuccess: () => {
      utils.subscriptions.listPlans.invalidate();
      utils.subscriptions.listAllPlans.invalidate();
      setPlanDialog(false);
      setPlanForm({ nameAr: "", planType: "semester", priceEgp: "", durationDays: "", sessionsIncluded: "", description: "" });
      toast.success("تم إنشاء الباقة بنجاح");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const togglePlanActive = trpc.subscriptions.togglePlanActive.useMutation({
    onSuccess: () => {
      utils.subscriptions.listPlans.invalidate();
      utils.subscriptions.listAllPlans.invalidate();
      toast.success("تم تحديث حالة الباقة بنجاح");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const totalRevenue = (transactions ?? []).filter((t: any) => t.status === "success").reduce((s: number, t: any) => s + Number(t.amountEgp), 0);
  const pendingCount = (transactions ?? []).filter((t: any) => t.status === "pending").length;
  const activeCoupons = (coupons ?? []).filter((c: any) => c.status === "active").length;

  function exportCSV() {
    if (!transactions?.length) { toast.error("لا توجد بيانات للتصدير"); return; }
    const headers = ["ID", "الطالب", "الباقة", "المبلغ", "طريقة الدفع", "المرجع", "الحالة", "التاريخ"];
    const rows = (transactions as any[]).map((t: any) => [
      t.id, `طالب #${t.studentId}`,
      t.planId ? `باقة #${t.planId}` : t.unitId ? `وحدة #${t.unitId}` : "—",
      Number(t.amountEgp).toFixed(2),
      METHOD_LABELS[t.paymentMethod] ?? t.paymentMethod,
      t.referenceId ?? "",
      STATUS_LABELS[t.status] ?? t.status,
      new Date(t.createdAt).toLocaleDateString("ar-EG"),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير البيانات");
  }

  return (
    <TeacherLayout title="المدفوعات والاشتراكات">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "إجمالي الإيرادات", value: `${totalRevenue.toFixed(0)} جنيه`, icon: TrendingUp, color: "from-green-500 to-emerald-600" },
          { label: "معاملات معلقة", value: pendingCount, icon: AlertCircle, color: "from-amber-500 to-orange-600" },
          { label: "كوبونات نشطة", value: activeCoupons, icon: Tag, color: "from-purple-500 to-violet-600" },
          { label: "باقات متاحة", value: plans?.length ?? 0, icon: Package, color: "from-blue-500 to-indigo-600" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`bg-gradient-to-br ${s.color} text-white border-0 shadow-md`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs opacity-80 mb-1">{s.label}</div>
                    <div className="text-2xl font-bold">{s.value}</div>
                  </div>
                  <s.icon className="w-8 h-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="transactions" dir="rtl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="transactions">المعاملات</TabsTrigger>
            <TabsTrigger value="plans">باقات الاشتراك</TabsTrigger>
            <TabsTrigger value="coupons">الكوبونات</TabsTrigger>
          </TabsList>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
              <Download className="w-4 h-4" />
              تصدير CSV
            </Button>
            <Button size="sm" onClick={() => setPlanDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              باقة جديدة
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCouponDialog(true)} className="gap-2">
              <Tag className="w-4 h-4" />
              كوبونات
            </Button>
          </div>
        </div>

        {/* Transactions */}
        <TabsContent value="transactions">
          <Card>
            <CardContent className="p-0">
              {txnLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
                </div>
              ) : !(transactions as any[])?.length ? (
                <div className="text-center py-16 text-muted-foreground">
                  <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>لا توجد معاملات بعد</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        {["#", "الطالب", "الباقة", "المبلغ", "طريقة الدفع", "المرجع", "الحالة", "التاريخ"].map(h => (
                          <th key={h} className="text-right px-4 py-3 font-medium text-muted-foreground text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(transactions as any[]).map((t: any, i: number) => (
                        <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground">{t.id}</td>
                          <td className="px-4 py-3 font-medium">طالب #{t.studentId}</td>
                          <td className="px-4 py-3 text-muted-foreground">{t.planId ? `باقة #${t.planId}` : t.unitId ? `وحدة #${t.unitId}` : "—"}</td>
                          <td className="px-4 py-3 font-bold text-green-700">{Number(t.amountEgp).toFixed(0)} جنيه</td>
                          <td className="px-4 py-3">{METHOD_LABELS[t.paymentMethod] ?? t.paymentMethod}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground max-w-[100px] truncate">{t.referenceId ?? "—"}</td>
                          <td className="px-4 py-3">
                            <Badge className={STATUS_COLORS[t.status]} variant="outline">{STATUS_LABELS[t.status]}</Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString("ar-EG")}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans */}
        <TabsContent value="plans">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(plans ?? []).map((plan: any, i: number) => {
              const Icon = PLAN_ICONS[plan.planType] ?? CreditCard;
              const gradient = PLAN_COLORS[plan.planType] ?? "from-gray-500 to-gray-600";
              return (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className={`overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${plan.isActive === false ? 'opacity-75 grayscale-[20%]' : ''}`}>
                    <div className={`h-2 bg-gradient-to-l ${gradient}`} />
                    <CardContent className="pt-4 pb-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{PLAN_TYPE_LABELS[plan.planType]}</Badge>
                          <Badge className={plan.isActive !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"} variant="outline">
                            {plan.isActive !== false ? "نشط" : "غير نشط"}
                          </Badge>
                        </div>
                      </div>
                      <h3 className="font-bold text-base mb-1">{plan.nameAr}</h3>
                      {plan.description && <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                        <span className="text-xl font-bold text-green-700">{Number(plan.priceEgp).toFixed(0)} جنيه</span>
                        <div className="text-xs text-muted-foreground text-left">
                          {plan.durationDays ? `${plan.durationDays} يوم` : ""}
                          {plan.sessionsIncluded ? ` · ${plan.sessionsIncluded} جلسة` : ""}
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">تفعيل الباقة للطلاب</span>
                        <Button
                          variant={plan.isActive !== false ? "destructive" : "default"}
                          size="sm"
                          className="h-8 text-xs font-semibold w-24"
                          disabled={togglePlanActive.isPending}
                          onClick={() => togglePlanActive.mutate({ id: plan.id, isActive: plan.isActive === false })}
                        >
                          {plan.isActive !== false ? "إلغاء التفعيل" : "تفعيل الباقة"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <Card className="border-2 border-dashed cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all min-h-[160px] flex items-center justify-center"
                onClick={() => setPlanDialog(true)}>
                <div className="text-center text-muted-foreground p-6">
                  <Plus className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">إضافة باقة جديدة</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Coupons */}
        <TabsContent value="coupons">
          <Card>
            <CardContent className="p-0">
              {!(coupons as any[])?.length ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Tag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>لا توجد كوبونات بعد</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        {["الكود", "القيمة", "الحالة", "تاريخ الاستخدام", "تاريخ الإنشاء"].map(h => (
                          <th key={h} className="text-right px-4 py-3 font-medium text-muted-foreground text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(coupons as any[]).map((c: any) => (
                        <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono font-bold text-blue-700 text-xs">{c.code}</td>
                          <td className="px-4 py-3 font-bold">{Number(c.valueEgp).toFixed(0)} جنيه</td>
                          <td className="px-4 py-3">
                            <Badge className={c.status === "active" ? "bg-green-100 text-green-800" : c.status === "redeemed" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"} variant="outline">
                              {c.status === "active" ? "نشط" : c.status === "redeemed" ? "مستخدم" : "منتهي"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{c.redeemedAt ? new Date(c.redeemedAt).toLocaleDateString("ar-EG") : "—"}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("ar-EG")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Plan Dialog */}
      <Dialog open={planDialog} onOpenChange={setPlanDialog}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>إنشاء باقة اشتراك جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>اسم الباقة <span className="text-red-500">*</span></Label>
              <Input value={planForm.nameAr} onChange={e => setPlanForm(f => ({ ...f, nameAr: e.target.value }))} placeholder="مثال: اشتراك الفصل الأول" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>نوع الباقة</Label>
                <Select value={planForm.planType} onValueChange={v => setPlanForm(f => ({ ...f, planType: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semester">فصل دراسي</SelectItem>
                    <SelectItem value="session">جلسات</SelectItem>
                    <SelectItem value="unit">وحدة</SelectItem>
                    <SelectItem value="full_course">كورس كامل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>السعر (جنيه) <span className="text-red-500">*</span></Label>
                <Input type="number" value={planForm.priceEgp} onChange={e => setPlanForm(f => ({ ...f, priceEgp: e.target.value }))} placeholder="800" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>المدة (أيام)</Label>
                <Input type="number" value={planForm.durationDays} onChange={e => setPlanForm(f => ({ ...f, durationDays: e.target.value }))} placeholder="120" />
              </div>
              {planForm.planType === "session" && (
                <div className="space-y-2">
                  <Label>عدد الجلسات</Label>
                  <Input type="number" value={planForm.sessionsIncluded} onChange={e => setPlanForm(f => ({ ...f, sessionsIncluded: e.target.value }))} placeholder="5" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>الوصف (اختياري)</Label>
              <Input value={planForm.description} onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف مختصر للباقة" />
            </div>
            <Button className="w-full" onClick={() => {
              if (!planForm.nameAr.trim() || !planForm.priceEgp) { toast.error("يرجى ملء الحقول المطلوبة"); return; }
              createPlan.mutate({
                nameAr: planForm.nameAr,
                planType: planForm.planType,
                priceEgp: planForm.priceEgp,
                durationDays: planForm.durationDays ? Number(planForm.durationDays) : undefined,
                sessionsIncluded: planForm.sessionsIncluded ? Number(planForm.sessionsIncluded) : undefined,
                description: planForm.description || undefined,
              });
            }} disabled={createPlan.isPending}>
              {createPlan.isPending ? "جاري الإنشاء..." : "إنشاء الباقة"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Coupons Dialog */}
      <Dialog open={couponDialog} onOpenChange={setCouponDialog}>
        <DialogContent dir="rtl" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>إنشاء كوبونات جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>عدد الكوبونات</Label>
              <Input type="number" min={1} max={100} value={couponForm.count} onChange={e => setCouponForm(f => ({ ...f, count: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>قيمة الكوبون (جنيه)</Label>
              <Input type="number" value={couponForm.valueEgp} onChange={e => setCouponForm(f => ({ ...f, valueEgp: e.target.value }))} />
            </div>
            <Button className="w-full" onClick={() => generateCoupons.mutate({ count: couponForm.count, valueEgp: couponForm.valueEgp })} disabled={generateCoupons.isPending}>
              {generateCoupons.isPending ? "جاري الإنشاء..." : `إنشاء ${couponForm.count} كوبون`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}
