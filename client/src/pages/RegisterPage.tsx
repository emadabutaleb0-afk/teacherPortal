import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getLoginUrl } from "@/const";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, User, Phone, School, ArrowLeft, CheckCircle, LogIn, Globe, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";

const GRADE_DISPLAY: Record<string, { ar: string; en: string }> = {
  "الصف الأول الثانوي": { ar: "الصف الأول الثانوي", en: "1st Secondary" },
  "الصف الثاني الثانوي": { ar: "الصف الثاني الثانوي", en: "2nd Secondary" },
  "الصف الثالث الثانوي": { ar: "الصف الثالث الثانوي", en: "3rd Secondary" },
  "الصف الأول الإعدادي": { ar: "الصف الأول الإعدادي", en: "1st Preparatory" },
  "الصف الثاني الإعدادي": { ar: "الصف الثاني الإعدادي", en: "2nd Preparatory" },
  "الصف الثالث الإعدادي": { ar: "الصف الثالث الإعدادي", en: "3rd Preparatory" },
};

const t = {
  ar: {
    defaultTeacher: "أستاذ أحمد محمود",
    stepLogin: "تسجيل الدخول",
    stepProfile: "بيانات الطالب",
    stepActivation: "التفعيل",
    welcomeTitle: "مرحباً بك!",
    welcomeDesc: "سجّل دخولك للبدء في رحلة التعلم",
    featureAccess: "وصول كامل لجميع الدروس والمحتوى التعليمي",
    featureQuizzes: "اختبارات تفاعلية مع تغذية راجعة فورية",
    featureProgress: "متابعة تقدمك ونتائجك بشكل مستمر",
    loginBtn: "تسجيل الدخول / إنشاء حساب",
    termsNote: "بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية",
    backToHome: "العودة للرئيسية",
    profileTitle: "أكمل ملفك الشخصي",
    profileDesc: "أدخل بياناتك لإتمام التسجيل",
    nameLabel: "الاسم بالعربية",
    namePlaceholder: "مثال: أحمد محمد علي",
    phoneLabel: "رقم هاتفك",
    parentPhoneLabel: "هاتف ولي الأمر",
    schoolLabel: "اسم المدرسة",
    schoolPlaceholder: "مثال: مدرسة الثانوية الأولى",
    saving: "جاري الحفظ...",
    submitBtn: "إتمام التسجيل",
    nameRequired: "يرجى إدخال اسمك",
    gradeRequired: "يرجى اختيار الصف الدراسي",
    gradeLabel: "الصف الدراسي",
    selectGradePlaceholder: "اختر صفك الدراسي...",
    successToast: "تم إنشاء حسابك بنجاح!",
    doneWelcome: (name: string) => `مرحباً ${name}!`,
    doneDesc: "تم إنشاء حسابك بنجاح. يمكنك الآن الوصول لمحتوى الكورس.",
    startLearning: "ابدأ التعلم الآن",
  },
  en: {
    defaultTeacher: "Teacher Ahmed Mahmoud",
    stepLogin: "Login",
    stepProfile: "Student Info",
    stepActivation: "Activation",
    welcomeTitle: "Welcome!",
    welcomeDesc: "Sign in to start your learning journey",
    featureAccess: "Full access to all lessons and educational content",
    featureQuizzes: "Interactive quizzes with instant feedback",
    featureProgress: "Track your progress and results continuously",
    loginBtn: "Login / Create Account",
    termsNote: "By continuing, you agree to the Terms of Service and Privacy Policy",
    backToHome: "Back to Home",
    profileTitle: "Complete Your Profile",
    profileDesc: "Enter your details to finish registration",
    nameLabel: "Full Name (Arabic)",
    namePlaceholder: "e.g. Ahmed Mohamed Ali",
    phoneLabel: "Your Phone",
    parentPhoneLabel: "Parent Phone",
    schoolLabel: "School Name",
    schoolPlaceholder: "e.g. First Secondary School",
    saving: "Saving...",
    submitBtn: "Complete Registration",
    nameRequired: "Please enter your name",
    gradeRequired: "Please select your grade level",
    gradeLabel: "Grade Level",
    selectGradePlaceholder: "Select your grade level...",
    successToast: "Your account was created successfully!",
    doneWelcome: (name: string) => `Welcome ${name}!`,
    doneDesc: "Your account has been created successfully. You can now access the course content.",
    startLearning: "Start Learning Now",
  },
};

export default function RegisterPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { data: settings } = trpc.settings.get.useQuery();
  const { data: existingProfile } = trpc.students.getMyProfile.useQuery(undefined, { enabled: isAuthenticated });
  const { data: gradeLevels } = trpc.units.gradeLevels.useQuery();
  const [, navigate] = useLocation();

  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "ar");

  useEffect(() => {
    const handler = () => setLang(localStorage.getItem("lang") || "ar");
    window.addEventListener("storage", handler);
    window.addEventListener("langChange", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("langChange", handler);
    };
  }, []);

  const curr = t[lang as keyof typeof t] || t.ar;

  const toggleLang = () => {
    const next = lang === "ar" ? "en" : "ar";
    localStorage.setItem("lang", next);
    setLang(next);
    window.dispatchEvent(new Event("langChange"));
  };

  const [step, setStep] = useState<"login" | "profile" | "done">("login");
  const [form, setForm] = useState({ nameAr: "", phone: "", parentPhone: "", schoolName: "", gradeLevel: "" });

  const updateProfile = trpc.students.updateMyProfile.useMutation({
    onSuccess: () => {
      setStep("done");
      toast.success(curr.successToast);
    },
    onError: (e: any) => toast.error(e.message),
  });

  useEffect(() => {
    if (isAuthenticated && !loading) {
      if (existingProfile?.nameAr) {
        // Already has profile, redirect to student portal
        navigate("/student");
      } else {
        setStep("profile");
        setForm(f => ({ ...f, nameAr: user?.name ?? "" }));
      }
    }
  }, [isAuthenticated, loading, existingProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-800 flex items-center justify-center p-4" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/40 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 dark:bg-indigo-900/40 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Language & Theme Toggles */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <Button variant="outline" size="icon" onClick={toggleLang} className="rounded-full w-9 h-9" title={lang === "ar" ? "English" : "العربية"}>
            <Globe className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full w-9 h-9" title={theme === "dark" ? "Light mode" : "Dark mode"}>
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{settings?.teacherName ?? curr.defaultTeacher}</h1>
          <p className="text-muted-foreground mt-1">{settings?.subject} · {settings?.gradeLevel}</p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 px-4">
          {[
            { id: "login", label: curr.stepLogin, num: 1 },
            { id: "profile", label: curr.stepProfile, num: 2 },
            { id: "done", label: curr.stepActivation, num: 3 },
          ].map((s, idx) => {
            const isCompleted =
              (step === "profile" && s.id === "login") ||
              (step === "done" && (s.id === "login" || s.id === "profile"));
            const isActive = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center gap-1.5 relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                      isCompleted
                        ? "bg-green-600 border-green-600 text-white shadow-md shadow-green-500/20"
                        : isActive
                        ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105"
                        : "bg-white dark:bg-gray-800 border-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-[10px] md:text-xs font-medium transition-colors ${
                      isActive ? "text-primary font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className="flex-1 h-0.5 mx-2 bg-muted relative -top-3 overflow-hidden">
                    <div
                      className={`h-full bg-primary transition-all duration-500`}
                      style={{
                        width:
                          (step === "profile" && idx === 0) || step === "done"
                            ? "100%"
                            : "0%",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Login */}
          {step === "login" && (
            <motion.div key="login" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <Card className="shadow-xl border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{curr.welcomeTitle}</CardTitle>
                  <CardDescription>{curr.welcomeDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300 space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{curr.featureAccess}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{curr.featureQuizzes}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{curr.featureProgress}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 text-base gap-3 bg-gradient-to-l from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                    onClick={() => window.location.href = getLoginUrl()}
                  >
                    <LogIn className="w-5 h-5" />
                    {curr.loginBtn}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    {curr.termsNote}
                  </p>

                  <div className="text-center">
                    <Link href="/">
                      <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center gap-1">
                        <ArrowLeft className="w-3 h-3" />
                        {curr.backToHome}
                      </span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Complete Profile */}
          {step === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <Card className="shadow-xl border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</div>
                    <CardTitle className="text-xl">{curr.profileTitle}</CardTitle>
                  </div>
                  <CardDescription>{curr.profileDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      {curr.nameLabel} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={form.nameAr}
                      onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
                      placeholder={curr.namePlaceholder}
                      className={lang === "ar" ? "text-right" : "text-left"}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {curr.phoneLabel}
                      </Label>
                      <Input
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="01xxxxxxxxx"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {curr.parentPhoneLabel}
                      </Label>
                      <Input
                        value={form.parentPhone}
                        onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))}
                        placeholder="01xxxxxxxxx"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <School className="w-3 h-3" />
                      {curr.schoolLabel}
                    </Label>
                    <Input
                      value={form.schoolName}
                      onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))}
                      placeholder={curr.schoolPlaceholder}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <GraduationCap className="w-3 h-3" />
                      {curr.gradeLabel} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={form.gradeLevel} onValueChange={(v) => setForm(f => ({ ...f, gradeLevel: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={curr.selectGradePlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {(gradeLevels && gradeLevels.length > 0 ? gradeLevels : Object.keys(GRADE_DISPLAY)).map((g: string) => (
                          <SelectItem key={g} value={g}>
                            {lang === "ar" ? (GRADE_DISPLAY[g]?.ar ?? g) : (GRADE_DISPLAY[g]?.en ?? g)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full h-11 bg-gradient-to-l from-blue-600 to-indigo-700"
                    onClick={() => {
                      if (!form.nameAr.trim()) { toast.error(curr.nameRequired); return; }
                      if (!form.gradeLevel) { toast.error(curr.gradeRequired); return; }
                      updateProfile.mutate(form);
                    }}
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? curr.saving : curr.submitBtn}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Done */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="shadow-xl border-0 text-center">
                <CardContent className="pt-10 pb-10 space-y-4">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto"
                  >
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">{curr.doneWelcome(form.nameAr)}</h2>
                  <p className="text-muted-foreground">{curr.doneDesc}</p>
                  <Button
                    className="w-full h-11 bg-gradient-to-l from-blue-600 to-indigo-700"
                    onClick={() => navigate("/student")}
                  >
                    {curr.startLearning}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
