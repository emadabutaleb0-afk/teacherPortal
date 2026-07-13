import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getLoginUrl, getRelativePath } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  BookOpen,
  Trophy,
  Users,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Globe,
  Sun,
  Moon,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";


export default function SignInPage() {
  const { user, isAuthenticated, loading, login } = useAuth();
  const { data: settings } = trpc.settings.get.useQuery();
  const { theme, toggleTheme } = useTheme();

  const [lang, setLang] = useState<"ar" | "en" | string>(() => {
    return localStorage.getItem("lang") || "ar";
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      window.location.href = getRelativePath((user.role === "admin" || user.role === "teacher" || user.role === "superadmin") ? (user.role === "superadmin" ? "/teacher/settings" : "/teacher") : "/student");
    }
  }, [loading, isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }



  const t = {
    ar: {
      loginTitle: "تسجيل الدخول",
      loginSubtitle: "ادخل إلى حسابك للوصول للمنهج",
      emailLabel: "البريد الإلكتروني أو رقم الهاتف",
      emailPlaceholder: "example@email.com",
      passwordLabel: "كلمة المرور",
      passwordPlaceholder: "••••••••",
      rememberMe: "تذكرني",
      signInButton: "تسجيل الدخول",
      orText: "أو",
      newStudent: "طالب جديد؟",
      registerButton: "إنشاء حساب جديد",
      termsText: "بتسجيل الدخول، أنت توافق على شروط الاستخدام وسياسة الخصوصية",
      demoTitle: "حسابات تجريبية سريعة",
      demoSuperAdmin: "مدير عام (superadmin)",
      demoTeacher: "المعلم (teacher)",
      demoStudent: "الطالب (user)",
      welcomeBack: "مرحباً بك في",
      learningPortal: "بوابة التعلم",
      brandDesc: "منصة تعليمية متكاملة تجمع بين المحتوى التفاعلي والاختبارات الذكية لتحقيق أفضل النتائج.",
      feature1: "منهج منظم بوحدات ودروس تفاعلية",
      feature2: "اختبارات تفاعلية مع تغذية راجعة فورية",
      feature3: "توصيات ذكاء اصطناعي مخصصة لك",
      feature4: "متابعة مستمرة من المعلم",
      loading: "جاري التحميل...",
      validationError: "يرجى ملء جميع الحقول المطلوبة",
    },
    en: {
      loginTitle: "Sign In",
      loginSubtitle: "Access your account to start learning",
      emailLabel: "Email or Phone Number",
      emailPlaceholder: "example@email.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      rememberMe: "Remember Me",
      signInButton: "Sign In",
      orText: "OR",
      newStudent: "New student?",
      registerButton: "Create a new account",
      termsText: "By signing in, you agree to our Terms of Use and Privacy Policy",
      demoTitle: "Quick Demo Logins",
      demoSuperAdmin: "Super Admin (superadmin)",
      demoTeacher: "Teacher (teacher)",
      demoStudent: "Student (user)",
      welcomeBack: "Welcome Back to",
      learningPortal: "Learning Portal",
      brandDesc: "An integrated educational platform combining interactive content and smart assessments to achieve the best results.",
      feature1: "Structured units and interactive lessons",
      feature2: "Interactive quizzes with instant feedback",
      feature3: "AI recommendations tailored for you",
      feature4: "Continuous progress monitoring",
      loading: "Signing in...",
      validationError: "Please fill in all required fields",
    }
  };

  const curr = t[lang as "ar" | "en"] || t.ar;

  const features = [
    { icon: BookOpen, text: curr.feature1 },
    { icon: Trophy, text: curr.feature2 },
    { icon: Sparkles, text: curr.feature3 },
    { icon: Users, text: curr.feature4 },
  ];

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(curr.validationError);
      return;
    }
    setError("");
    setIsSubmitting(true);

    const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
    if (!oauthPortalUrl) {
      setTimeout(() => {
        try {
          const lowerEmail = email.toLowerCase();
          let role = "student";
          if (lowerEmail.includes("superadmin")) {
            role = "superadmin";
          } else if (lowerEmail.includes("teacher") || lowerEmail.includes("admin") || lowerEmail.includes("ahmed")) {
            role = "teacher";
          } else if (lowerEmail.includes("parent")) {
            role = "parent";
          }
          login(email, password, role);
        } catch (err: any) {
          setError(err.message || "Login failed");
          setIsSubmitting(false);
        }
      }, 800);
      return;
    }

    // Simulate auth and redirect to Manus OAuth provider to create the session cookie
    setTimeout(() => {
      window.location.href = getLoginUrl();
    }, 800);
  };

  const handleDemoLogin = (role: "superadmin" | "teacher" | "student") => {
    setError("");
    setIsSubmitting(true);
    const demoEmail = role === "superadmin" ? "superadmin" : role === "teacher" ? "teacher" : "user";
    setEmail(demoEmail);
    setPassword("password");

    const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
    if (!oauthPortalUrl) {
      setTimeout(() => {
        try {
          login(demoEmail, "password", role);
        } catch (err: any) {
          setError(err.message || "Login failed");
          setIsSubmitting(false);
        }
      }, 1000);
      return;
    }

    setTimeout(() => {
      window.location.href = getLoginUrl();
    }, 1000);
  };

  // Full blue theme gradients
  const pageBgClass = theme === "dark"
    ? "bg-gradient-to-br from-[#020817] via-blue-950 to-slate-950 text-white"
    : "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white";

  const cardClass = theme === "dark"
    ? "bg-blue-950/40 backdrop-blur-xl border border-blue-500/20 shadow-2xl text-white"
    : "bg-white backdrop-blur-xl border border-blue-100 shadow-2xl text-slate-800";

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden ${pageBgClass}`} dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${theme === "dark" ? "bg-blue-500/10" : "bg-blue-500/5"}`} />
        <div className={`absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl ${theme === "dark" ? "bg-indigo-500/10" : "bg-indigo-500/5"}`} />
      </div>

      <div className="relative w-full max-w-md z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <Card className={`relative border-0 shadow-2xl transition-all duration-300 ${cardClass}`}>
            {/* Top controls inside card */}
            <div className="absolute top-4 right-4 left-4 flex justify-between items-center z-20">
              <Link href="/">
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" title={lang === "ar" ? "الرئيسية" : "Home"}>
                  <ArrowLeft className={`w-4 h-4 ${lang === "ar" ? "" : "rotate-180"}`} />
                </Button>
              </Link>
              <div className="flex gap-1">
                {/* Language Switcher */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-lg"
                  onClick={() => setLang((l) => (l === "ar" ? "en" : "ar"))}
                  title={lang === "ar" ? "English" : "العربية"}
                >
                  <Globe className="w-4 h-4" />
                </Button>
                {/* Theme Switcher */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-lg"
                  onClick={toggleTheme}
                  title={theme === "dark" ? (lang === "ar" ? "الوضع الفاتح" : "Light Mode") : (lang === "ar" ? "الوضع الداكن" : "Dark Mode")}
                >
                  {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <CardContent className="p-6 md:p-8 pt-12 space-y-5">
              <div className="text-center space-y-3">


                <h2 className="text-xl font-black mb-1">{curr.loginTitle}</h2>
                <p className={`text-xs ${theme === "dark" ? "text-blue-200/70" : "text-slate-500"}`}>{curr.loginSubtitle}</p>
              </div>

              {/* Error messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs flex items-center gap-2 border border-destructive/20"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Credentials Form */}
              <form onSubmit={handleFormLogin} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-semibold">
                    {curr.emailLabel}
                  </Label>
                  <div className="relative">
                    <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 ${lang === "ar" ? "right-3" : "left-3"} text-muted-foreground`} />
                    <Input
                      id="email"
                      type="text"
                      disabled={isSubmitting}
                      placeholder={curr.emailPlaceholder}
                      className={`h-11 ${lang === "ar" ? "pr-10" : "pl-10"} bg-background/50 border-input focus-visible:ring-2`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs font-semibold">
                    {curr.passwordLabel}
                  </Label>
                  <div className="relative">
                    <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 ${lang === "ar" ? "right-3" : "left-3"} text-muted-foreground`} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      disabled={isSubmitting}
                      placeholder={curr.passwordPlaceholder}
                      className={`h-11 ${lang === "ar" ? "pr-10" : "pl-10"} bg-background/50 border-input focus-visible:ring-2`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isSubmitting}
                      className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-md ${lang === "ar" ? "left-1.5" : "right-1.5"}`}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(!!checked)}
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="rememberMe"
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {curr.rememberMe}
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 text-sm font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{curr.loading}</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-4.5 h-4.5" />
                      <span>{curr.signInButton}</span>
                    </>
                  )}
                </Button>
              </form>

              {/* Demo Shortcuts */}
              <div className="space-y-2 pt-2">
                <div className="text-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {curr.demoTitle}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleDemoLogin("superadmin")}
                    className="text-[11px] font-semibold h-10 border-dashed border-amber-500/40 hover:bg-amber-500/5 hover:border-amber-500 text-amber-600 dark:text-amber-400 p-1 text-center leading-tight"
                  >
                    {curr.demoSuperAdmin}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleDemoLogin("teacher")}
                    className="text-[11px] font-semibold h-10 border-dashed border-primary/40 hover:bg-primary/5 hover:border-primary p-1 text-center leading-tight"
                  >
                    {curr.demoTeacher}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleDemoLogin("student")}
                    className="text-[11px] font-semibold h-10 border-dashed border-indigo-400/40 hover:bg-indigo-500/5 hover:border-indigo-500 p-1 text-center leading-tight"
                  >
                    {curr.demoStudent}
                  </Button>
                </div>
              </div>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className={`bg-card px-2 text-muted-foreground`}>{curr.orText}</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">{curr.newStudent}</p>
                <Link href="/register">
                  <Button variant="ghost" disabled={isSubmitting} className="hover:bg-primary/5 gap-2 text-xs font-bold text-primary">
                    <ArrowLeft className={`w-3.5 h-3.5 ${lang === "ar" ? "" : "rotate-180"}`} />
                    {curr.registerButton}
                  </Button>
                </Link>
              </div>

              <p className="text-center text-[9px] leading-relaxed text-muted-foreground/80">
                {curr.termsText}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
