import { useAuth } from "@/contexts/AuthContext";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import NotificationBell from "@/components/portal/NotificationBell";
import { GraduationCap, Home, LogOut, User, Wallet, Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface StudentLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const { data: settings } = trpc.settings.get.useQuery();

  const { theme, toggleTheme } = useTheme();
  const [lang, setLang] = useState<"ar" | "en" | string>(() => {
    return localStorage.getItem("lang") || "ar";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    window.dispatchEvent(new Event("langChange"));
  }, [lang]);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout();
      window.location.href = "/";
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16 bg-card border-b animate-pulse" />
        <div className="container py-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const navItems = [
    { href: "/student", label: lang === "ar" ? "الكورس" : "Course", icon: Home, exact: true },
    { href: "/student/wallet", label: lang === "ar" ? "محفظتي" : "Wallet", icon: Wallet },
    { href: "/student/profile", label: lang === "ar" ? "ملفي" : "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-muted/20 pb-16 md:pb-0" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Top Navigation */}
      <motion.header
        className="bg-card/90 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm"
        initial={{ y: -60 }} animate={{ y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="container flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <motion.div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-sm"
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <GraduationCap className="w-5 h-5 text-white" />
            </motion.div>
            <div className={lang === "ar" ? "text-right" : "text-left"}>
              <p className="font-bold text-sm leading-tight">
                {lang === "ar" ? (settings?.teacherName ?? "أستاذ أحمد محمود") : "Mr. Ahmed Mahmoud"}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "ar" ? (settings?.subject ?? "اللغة الإنجليزية") : "English"}
              </p>
            </div>
          </div>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.exact ? location === item.href : location.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer transition-colors ${
                      isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-primary/10 rounded-xl"
                        layoutId="studentActiveNav"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* User and Controls */}
          <div className="flex items-center gap-2">
            {/* Home button */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              onClick={() => window.location.href = "/"}
              title={lang === "ar" ? "الرئيسية" : "Home"}
            >
              <Home className="w-4 h-4" />
            </Button>

            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-foreground font-bold text-xs"
              onClick={() => setLang(l => l === "ar" ? "en" : "ar")}
              title={lang === "ar" ? "English" : "العربية"}
            >
              <Globe className="w-4 h-4" />
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              onClick={toggleTheme}
              title={theme === "dark" ? (lang === "ar" ? "الوضع المضيء" : "Light Mode") : (lang === "ar" ? "الوضع المظلم" : "Dark Mode")}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </Button>

            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {user?.name?.charAt(0) ?? "S"}
                </AvatarFallback>
              </Avatar>
              <div className={`hidden lg:block ${lang === "ar" ? "text-right" : "text-left"}`}>
                <p className="text-sm font-medium leading-tight">{user?.name}</p>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 border-0">
                  {lang === "ar" ? "طالب" : "Student"}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => logoutMutation.mutate()}
              title={lang === "ar" ? "تسجيل الخروج" : "Log Out"}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <motion.main
        className="container py-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        {children}
      </motion.main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = item.exact ? location === item.href : location.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="w-1 h-1 rounded-full bg-primary"
                      layoutId="mobileActiveNav"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
