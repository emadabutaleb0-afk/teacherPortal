import { useAuth } from "@/contexts/AuthContext";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import NotificationBell from "@/components/portal/NotificationBell";
import {
  BarChart3,
  BookOpen,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  Home,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";

interface TeacherLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function TeacherLayout({ children, title }: TeacherLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const { data: settings } = trpc.settings.get.useQuery();

  const { theme, toggleTheme } = useTheme();
  const [lang, setLang] = useState<"ar" | "en" | string>(() => {
    return localStorage.getItem("lang") || "ar";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    window.dispatchEvent(new Event("langChange"));
  }, [lang]);

  const allNavItems = [
    { href: "/teacher", label: lang === "ar" ? "لوحة القيادة" : "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/teacher/curriculum", label: lang === "ar" ? "المنهج الدراسي" : "Curriculum", icon: BookOpen },
    { href: "/teacher/tests", label: lang === "ar" ? "الاختبارات" : "Assessments", icon: GraduationCap },
    { href: "/teacher/students", label: lang === "ar" ? "الطلاب" : "Students", icon: Users },
    { href: "/teacher/payments", label: lang === "ar" ? "المدفوعات" : "Financials", icon: CreditCard },
    { href: "/teacher/analytics", label: lang === "ar" ? "التحليلات والتقارير" : "Analytics", icon: BarChart3 },
    { href: "/teacher/settings", label: lang === "ar" ? "الإعدادات" : "Settings", icon: Settings },
  ];

  const navItems = user?.role === "superadmin"
    ? allNavItems.filter(item => item.href === "/teacher/settings")
    : allNavItems;

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout();
      window.location.href = "/";
    },
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="hidden md:block w-64 bg-sidebar flex-shrink-0 animate-pulse" />
        <div className="flex-1 p-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user?.role !== "admin" && user?.role !== "teacher" && user?.role !== "superadmin") {
    window.location.href = "/student";
    return null;
  }

  const teacherInitial = (settings?.teacherName ?? user?.name ?? "M").charAt(0);

  const translateTitle = (titleText?: string) => {
    if (!titleText) return titleText;
    const map: Record<string, string> = {
      "لوحة القيادة": "Dashboard",
      "المنهج الدراسي": "Curriculum",
      "الاختبارات": "Assessments",
      "الطلاب": "Students",
      "المدفوعات": "Financials",
      "التحليلات والتقارير": "Analytics",
      "الإعدادات": "Settings",
    };
    if (lang === "en") {
      return map[titleText] || titleText;
    }
    return titleText;
  };

  const isRestrictedForSuperAdmin = user?.role === "superadmin" && location !== "/teacher/settings";

  return (
    <div className="flex h-screen bg-muted/20 overflow-hidden" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Sidebar – desktop: always visible; mobile: overlay */}
      <motion.aside
        className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground flex-col flex-shrink-0 shadow-2xl relative z-10"
        initial={{ x: lang === "ar" ? 60 : -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Logo / Teacher Info */}
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sidebar-primary to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg"
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </motion.div>
            <div className={`min-w-0 ${lang === "ar" ? "text-right" : "text-left"}`}>
              <p className="font-bold text-sm truncate">
                {lang === "ar" ? (settings?.teacherName ?? "أستاذ أحمد محمود") : "Mr. Ahmed Mahmoud"}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {lang === "ar" ? (settings?.subject ?? "اللغة الإنجليزية") : "English"}
              </p>
            </div>
          </div>
          <div className="mt-3 px-3 py-1.5 rounded-lg bg-sidebar-accent/40 text-xs text-center text-sidebar-foreground/70 border border-sidebar-border/50">
            {lang === "ar" ? "كل المراحل الدراسية" : "All Grade Levels"}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item, i) => {
            const isActive = item.exact ? location === item.href : location.startsWith(item.href);
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: lang === "ar" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 + 0.1 }}
              >
                <Link href={item.href}>
                  <div
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-sidebar-primary"
                        layoutId="activeNav"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className="w-4 h-4 flex-shrink-0 relative z-10" />
                    <span className="text-sm relative z-10">{item.label}</span>
                    {isActive && (
                      lang === "ar"
                        ? <ChevronLeft className={`w-3 h-3 relative z-10 opacity-70 mr-auto`} />
                        : <ChevronRight className={`w-3 h-3 relative z-10 opacity-70 ml-auto`} />
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Theme & Language Toggles */}
        <div className="px-5 py-2 border-t border-sidebar-border/50 flex items-center justify-between gap-2">
          <span className="text-xs text-sidebar-foreground/60">
            {lang === "ar" ? "المظهر واللغة" : "Theme & Language"}
          </span>
          <div className="flex items-center gap-1">
            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 rounded-lg"
              onClick={() => setLang((l) => (l === "ar" ? "en" : "ar"))}
              title={lang === "ar" ? "English" : "العربية"}
            >
              <Globe className="w-4 h-4" />
            </Button>
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 rounded-lg"
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? lang === "ar"
                    ? "الوضع المضيء"
                    : "Light Mode"
                  : lang === "ar"
                  ? "الوضع المظلم"
                  : "Dark Mode"
              }
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* User / Logout */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-sidebar-accent/30 transition-colors">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                {teacherInitial}
              </AvatarFallback>
            </Avatar>
            <div className={`flex-1 min-w-0 ${lang === "ar" ? "text-right" : "text-left"}`}>
              <p className="text-xs font-semibold truncate">{user?.name ?? (lang === "ar" ? "المعلم" : "Teacher")}</p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-0.5 h-4 bg-sidebar-accent/50 text-sidebar-foreground/60 border-0">
                {user?.role === 'superadmin' ? (lang === 'ar' ? 'مدير عام' : 'Super Admin') : (lang === 'ar' ? 'معلم' : 'Teacher')}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
              onClick={() => logoutMutation.mutate()}
              title={lang === "ar" ? "تسجيل الخروج" : "Log Out"}
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sliding sidebar */}
            <motion.aside
              className="fixed top-0 bottom-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col shadow-2xl md:hidden"
              style={lang === "ar" ? { right: 0 } : { left: 0 }}
              initial={{ x: lang === "ar" ? 264 : -264 }}
              animate={{ x: 0 }}
              exit={{ x: lang === "ar" ? 264 : -264 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
            >
              {/* Close button */}
              <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
                <span className="text-sm font-bold text-sidebar-foreground">
                  {lang === "ar" ? "القائمة" : "Menu"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Logo / Teacher Info */}
              <div className="p-5 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sidebar-primary to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className={`min-w-0 ${lang === "ar" ? "text-right" : "text-left"}`}>
                    <p className="font-bold text-sm truncate">
                      {lang === "ar" ? (settings?.teacherName ?? "أستاذ أحمد محمود") : "Mr. Ahmed Mahmoud"}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {lang === "ar" ? (settings?.subject ?? "اللغة الإنجليزية") : "English"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 px-3 py-1.5 rounded-lg bg-sidebar-accent/40 text-xs text-center text-sidebar-foreground/70 border border-sidebar-border/50">
                  {lang === "ar" ? "كل المراحل الدراسية" : "All Grade Levels"}
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = item.exact ? location === item.href : location.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group ${
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0 relative z-10" />
                        <span className="text-sm relative z-10">{item.label}</span>
                        {isActive && (
                          lang === "ar"
                            ? <ChevronLeft className="w-3 h-3 relative z-10 opacity-70 mr-auto" />
                            : <ChevronRight className="w-3 h-3 relative z-10 opacity-70 ml-auto" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Theme & Language Toggles */}
              <div className="px-5 py-2 border-t border-sidebar-border/50 flex items-center justify-between gap-2">
                <span className="text-xs text-sidebar-foreground/60">
                  {lang === "ar" ? "المظهر واللغة" : "Theme & Language"}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 rounded-lg"
                    onClick={() => setLang((l) => (l === "ar" ? "en" : "ar"))}
                    title={lang === "ar" ? "English" : "العربية"}
                  >
                    <Globe className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 rounded-lg"
                    onClick={toggleTheme}
                    title={
                      theme === "dark"
                        ? lang === "ar" ? "الوضع المضيء" : "Light Mode"
                        : lang === "ar" ? "الوضع المظلم" : "Dark Mode"
                    }
                  >
                    {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* User / Logout */}
              <div className="p-3 border-t border-sidebar-border">
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-sidebar-accent/30 transition-colors">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                      {teacherInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 min-w-0 ${lang === "ar" ? "text-right" : "text-left"}`}>
                    <p className="text-xs font-semibold truncate">{user?.name ?? (lang === "ar" ? "المعلم" : "Teacher")}</p>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-0.5 h-4 bg-sidebar-accent/50 text-sidebar-foreground/60 border-0">
                      {user?.role === 'superadmin' ? (lang === 'ar' ? 'مدير عام' : 'Super Admin') : (lang === 'ar' ? 'معلم' : 'Teacher')}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    onClick={() => logoutMutation.mutate()}
                    title={lang === "ar" ? "تسجيل الخروج" : "Log Out"}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-card border-b border-border px-4 md:px-6 py-3 md:py-4 flex-shrink-0 flex items-center justify-between shadow-sm">
          {/* Hamburger – mobile only */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden w-9 h-9 text-foreground hover:bg-muted rounded-lg"
            onClick={() => setSidebarOpen(true)}
            aria-label={lang === "ar" ? "فتح القائمة" : "Open menu"}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <AnimatePresence>
            {title && (
              <motion.h1
                className="text-lg md:text-xl font-bold text-foreground"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {translateTitle(title)}
              </motion.h1>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <span>{lang === "ar" ? (settings?.teacherName ?? "أستاذ أحمد محمود") : "Mr. Ahmed Mahmoud"}</span>
              <span>·</span>
              <span>
                {lang === "ar"
                  ? new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                  : new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            {/* Home button */}
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 text-muted-foreground hover:text-foreground"
              onClick={() => window.location.href = "/"}
              title={lang === "ar" ? "الرئيسية" : "Home"}
            >
              <Home className="w-5 h-5" />
            </Button>
            <NotificationBell />
          </div>
        </div>
        <motion.div
          className="flex-1 overflow-y-auto p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          {isRestrictedForSuperAdmin ? (
            <div className="max-w-md mx-auto mt-12 p-8 bg-card border border-amber-300 rounded-2xl shadow-xl text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Settings className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {lang === "ar" ? "صفحة مخصصة للمعلم فقط" : "Teacher Only Page"}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lang === "ar"
                  ? "جميع الإحصائيات والمنهج والاختبارات والتحليلات متاحة للمعلم فقط وليس للمدير العام. بصفتك Super Admin، تقتصر صلاحياتك على إدارة إعدادات المنصة وإضافة المعلمين."
                  : "All stats, curriculum, assessments, and analytics are available for teachers only, not admin. As Super Admin, your access is dedicated to portal settings and teacher onboarding."}
              </p>
              <Link href="/teacher/settings">
                <Button className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-lg">
                  <Settings className="w-4 h-4" />
                  {lang === "ar" ? "الانتقال إلى الإعدادات" : "Go to Settings"}
                </Button>
              </Link>
            </div>
          ) : (
            children
          )}
        </motion.div>
      </main>
    </div>
  );
}

