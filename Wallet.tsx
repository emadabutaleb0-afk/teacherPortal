import { useState } from "react";
import StudentLayout from "./StudentLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, CreditCard, Tag, CheckCircle, Clock,
  BookOpen, Zap, Shield, ArrowRight, Loader2, Receipt, Star
} from "lucide-react";
import { useLocation } from "wouter";

type PayMethod = "fawry" | "vodafone" | "coupon";
type PlanId = "session" | "term";
type Step = "choose" | "pay" | "done";

export default function StudentWallet() {
  const utils = trpc.useUtils();
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [payMethod, setPayMethod] = useState<PayMethod | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [step, setStep] = useState<Step>("choose");

  const { data: settings } = trpc.settings.get.useQuery();
  const { data: transactions } = trpc.students.getMyTransactions.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const subscriptionPayment = trpc.payments.subscriptionPayment.useMutation({
    onSuccess: () => {
      utils.students.getMyTransactions.invalidate();
      toast.success("تم تسجيل الطلب بنجاح!");
      setStep("done");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!isAuthenticated) { window.location.href = "/signin"; return null; }

  const sessionPrice = parseFloat(settings?.sessionPrice ?? "80");
  const termPrice = parseFloat(settings?.termPrice ?? "800");

  const plans = [
    {
      id: "session" as PlanId,
      name: "حصة واحدة",
      price: sessionPrice,
      Icon: Zap,
      gradient: "from-blue-500 to-blue-600",
      border: "border-blue-200 hover:border-blue-400",
      bg: "bg-blue-50",
      text: "text-blue-700",
      badge: null,
      features: ["وصول لحصة واحدة", "فيديو + PDF", "اختبار الوحدة", "صالح 30 يوم"],
    },
    {
      id: "term" as PlanId,
      name: "الترم الكامل",
      price: termPrice,
      Icon: BookOpen,
      gradient: "from-primary to-primary/80",
      border: "border-primary/30 hover:border-primary",
      bg: "bg-primary/5",
      text: "text-primary",
      badge: "الأوفر",
      features: ["جميع الوحدات", "جميع الفيديوهات والـ PDF", "جميع الاختبارات", "تقارير الأداء", "طوال الترم"],
    },
  ];

  const current = plans.find((p) => p.id === selectedPlan);

  const handlePay = () => {
    if (!selectedPlan || !payMethod) return;
    const amount = selectedPlan === "session" ? sessionPrice : termPrice;
    if (payMethod === "coupon") {
      if (!couponCode.trim()) { toast.error("أدخل كود الكوبون"); return; }
      subscriptionPayment.mutate({
        amount: amount.toString(),
        paymentMethod: "coupon",
        subscriptionType: selectedPlan === "session" ? "session" : "term",
        couponCode: couponCode.trim(),
      });
      return;
    }
    subscriptionPayment.mutate({
      amount: amount.toString(),
      paymentMethod: payMethod === "fawry" ? "fawry" : "vodafone_cash",
      subscriptionType: selectedPlan === "session" ? "session" : "term",
      notes: `اشتراك ${selectedPlan === "session" ? "حصة واحدة" : "الترم الكامل"}`,
    });
  };

  return (
    <StudentLayout>
      <div className="max-w-xl mx-auto pb-12 space-y-6" dir="rtl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">المحفظة والاشتراك</h1>
            <p className="text-sm text-muted-foreground">اختر الخطة المناسبة لك</p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Choose plan ── */}
          {step === "choose" && (
            <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                >
                  <Card
                    className={`border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${plan.border} ${plan.bg}`}
                    onClick={() => { setSelectedPlan(plan.id); setStep("pay"); }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-sm`}>
                            <plan.Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-base">{plan.name}</h3>
                              {plan.badge && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs gap-1">
                                  <Star className="w-3 h-3" />{plan.badge}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-left shrink-0">
                          <p className={`text-2xl font-black ${plan.text}`}>{plan.price}</p>
                          <p className="text-xs text-muted-foreground">جنيه</p>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <ul className="grid grid-cols-2 gap-1.5">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${plan.text}`} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button className={`w-full mt-4 bg-gradient-to-l ${plan.gradient} text-white border-0 gap-2`} size="sm">
                        اشترك الآن — {plan.price} جنيه
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Transaction history */}
              {transactions && transactions.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <Separator />
                  <h3 className="font-semibold text-sm flex items-center gap-2 pt-2 pb-3">
                    <Receipt className="w-4 h-4 text-muted-foreground" />
                    سجل المعاملات
                  </h3>
                  <div className="space-y-2">
                    {(transactions as any[]).slice(0, 5).map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 text-sm">
                        <div>
                          <p className="font-medium text-sm">{tx.notes ?? "اشتراك"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString("ar-EG")} ·{" "}
                            {tx.paymentMethod === "fawry" ? "فوري" : tx.paymentMethod === "vodafone_cash" ? "فودافون كاش" : "كوبون"}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm">{Number(tx.amountEgp ?? tx.amount ?? 0).toFixed(0)} جنيه</p>
                          <Badge variant="outline" className={`text-xs ${
                            tx.status === "completed" || tx.status === "success"
                              ? "border-green-300 text-green-700 bg-green-50"
                              : tx.status === "pending"
                              ? "border-amber-300 text-amber-700 bg-amber-50"
                              : "border-red-300 text-red-700 bg-red-50"
                          }`}>
                            {tx.status === "completed" || tx.status === "success" ? "مكتمل" : tx.status === "pending" ? "قيد المراجعة" : "ملغي"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Payment method ── */}
          {step === "pay" && current && (
            <motion.div key="pay" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <button
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => { setStep("choose"); setPayMethod(null); setCouponCode(""); }}
              >
                <ArrowRight className="w-4 h-4" />
                رجوع
              </button>

              {/* Plan summary */}
              <Card className={`border-2 ${current.border} ${current.bg}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${current.gradient} flex items-center justify-center`}>
                      <current.Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{current.name}</p>
                      <p className="text-xs text-muted-foreground">الخطة المختارة</p>
                    </div>
                  </div>
                  <p className={`text-2xl font-black ${current.text}`}>{current.price} جنيه</p>
                </CardContent>
              </Card>

              {/* Payment method selection */}
              <div className="space-y-2">
                <Label className="font-semibold">اختر طريقة الدفع</Label>
                <div className="grid gap-3">
                  {[
                    { id: "fawry" as PayMethod, name: "فوري", desc: "ادفع عبر أي منفذ فوري أو تطبيق MyFawry", emoji: "🏪", activeBorder: "border-orange-400 bg-orange-50", border: "border-border" },
                    { id: "vodafone" as PayMethod, name: "فودافون كاش", desc: `تحويل على ${settings?.vodafoneCashNumber ?? "01012345678"}`, emoji: "📱", activeBorder: "border-red-400 bg-red-50", border: "border-border" },
                    { id: "coupon" as PayMethod, name: "كوبون / كود خصم", desc: "أدخل الكود الذي حصلت عليه من الأستاذ", emoji: "🎟️", activeBorder: "border-green-400 bg-green-50", border: "border-border" },
                  ].map((m) => (
                    <div
                      key={m.id}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${payMethod === m.id ? m.activeBorder : m.border + " hover:border-muted-foreground/40"}`}
                      onClick={() => setPayMethod(m.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{m.emoji}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.desc}</p>
                        </div>
                        {payMethod === m.id && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon input */}
              <AnimatePresence>
                {payMethod === "coupon" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <div className="space-y-2">
                      <Label>كود الكوبون</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="ENG12-XXXXXXXX"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="font-mono text-center tracking-widest text-base"
                        />
                        <Button onClick={handlePay} disabled={subscriptionPayment.isPending || !couponCode.trim()} className="gap-2 shrink-0">
                          {subscriptionPayment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                          تفعيل
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fawry instructions */}
              <AnimatePresence>
                {payMethod === "fawry" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card className="border-orange-200 bg-orange-50">
                      <CardContent className="p-4 text-sm text-orange-800 space-y-2">
                        <p className="font-semibold">تعليمات الدفع عبر فوري:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs text-orange-700">
                          <li>اذهب لأي منفذ فوري أو افتح تطبيق MyFawry</li>
                          <li>اختر "دفع الفواتير" ← "تعليم"</li>
                          <li>أدخل كود المنفذ: <strong>{settings?.fawryMerchantCode ?? "PORTAL-001"}</strong></li>
                          <li>ادفع مبلغ <strong>{current.price} جنيه</strong></li>
                          <li>احتفظ بالإيصال وأرسله للأستاذ</li>
                        </ol>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Vodafone instructions */}
              <AnimatePresence>
                {payMethod === "vodafone" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="p-4 text-sm text-red-800 space-y-2">
                        <p className="font-semibold">تعليمات الدفع عبر فودافون كاش:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs text-red-700">
                          <li>افتح تطبيق فودافون كاش</li>
                          <li>اختر "تحويل أموال"</li>
                          <li>أدخل الرقم: <strong>{settings?.vodafoneCashNumber ?? "01012345678"}</strong></li>
                          <li>حوّل مبلغ <strong>{current.price} جنيه</strong></li>
                          <li>أرسل صورة الإيصال للأستاذ مع اسمك الكامل</li>
                        </ol>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {payMethod && payMethod !== "coupon" && (
                <Button
                  className="w-full gap-2" size="lg"
                  onClick={handlePay}
                  disabled={subscriptionPayment.isPending}
                >
                  {subscriptionPayment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  تأكيد الطلب — {current.price} جنيه
                </Button>
              )}
            </motion.div>
          )}

          {/* ── STEP 3: Done ── */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold">تم تسجيل طلبك!</h2>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                سيتم تفعيل اشتراكك بعد التحقق من الدفع من قِبَل الأستاذ.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => { setStep("choose"); setSelectedPlan(null); setPayMethod(null); }}>
                  طلب آخر
                </Button>
                <Button onClick={() => navigate("/student")}>العودة للمنهج</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security note */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
            <Shield className="w-4 h-4 shrink-0" />
            جميع المعاملات آمنة ومحمية. لا يتم تخزين بيانات البطاقات البنكية.
          </div>
        </motion.div>
      </div>
    </StudentLayout>
  );
}
