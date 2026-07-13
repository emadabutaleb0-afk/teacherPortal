import { useAuth } from "@/contexts/AuthContext";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  CheckCircle,
  GraduationCap,
  Play,
  Star,
  Users,
  Sparkles,
  Trophy,
  Brain,
  Clock,
  ArrowLeft,
  ChevronDown,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";


import { useTheme } from "@/contexts/ThemeContext";
import heroIllustration from "./hero_illustration.png";
import teacherAvatar from "./teacher_avatar.png";
import unitCover from "./unit_cover.png";
import unit1Cover from "./unit_1_grammar.png";
import unit2Cover from "./unit_2_reading.png";
import unit3Cover from "./unit_3_writing.png";
import unit4Cover from "./unit_4_vocabulary.png";

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtube.com") && urlObj.searchParams.has("v")) {
      const videoId = urlObj.searchParams.get("v");
      const listId = urlObj.searchParams.get("list");
      return `https://www.youtube.com/embed/${videoId}${listId ? `?list=${listId}` : ''}`;
    }
    if (urlObj.hostname === "youtu.be") {
      const videoId = urlObj.pathname.slice(1);
      const listId = urlObj.searchParams.get("list");
      return `https://www.youtube.com/embed/${videoId}${listId ? `?list=${listId}` : ''}`;
    }
  } catch (e) {
    // Ignore invalid URLs
  }
  
  return url;
};

function FloatingOrb({ className }: { className?: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
  );
}

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="tabular-nums"
    >
      {value}{suffix}
    </motion.span>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay }: { icon: any; title: string; desc: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay, duration: 0.5 }}>
      <Card className="h-full border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold text-base mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function LandingPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: settings } = trpc.settings.get.useQuery();
  const { data: units } = trpc.units.list.useQuery();
  const { data: freeLessons } = trpc.lessons.listFreePreview.useQuery();

  const { theme, toggleTheme } = useTheme();
  const [lang, setLang] = useState<"ar" | "en" | string>(() => {
    return localStorage.getItem("lang") || "ar";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  // Removed auto-redirect so the splash page always shows as default.
  const publishedUnits = units?.filter((u) => u.isPublished) ?? [];

  const t = {
    ar: {
      newStudent: "طالب جديد؟",
      login: "تسجيل الدخول",
      grade: settings?.gradeLevel ?? "الصف الثالث الثانوي",
      subject: settings?.subject ?? "اللغة الإنجليزية",
      teacherName: settings?.teacherName ?? "أستاذ أحمد محمود",
      welcomeMsg: settings?.welcomeMessage ?? "تعلم اللغة الإنجليزية بأسلوب تفاعلي متكامل — شروحات فيديو، ملفات PDF، اختبارات فورية، وتحليل ذكي لأدائك.",
      startLearning: "ابدأ التعلم الآن",
      browseSyllabus: "استعرض المنهج",
      platformFeatures: "مميزات المنصة",
      featuresTitle: "كل ما تحتاجه في مكان واحد",
      unit: "وحدة دراسية",
      enrolledStudent: "طالب مسجل",
      interactiveQuiz: "اختبار تفاعلي",
      yearsExp: "سنوات خبرة",
      syllabus: "المنهج الدراسي",
      courseUnits: "الوحدات الدراسية",
      syllabusSubtitle: `منهج ${settings?.gradeLevel ?? "الصف الثالث الثانوي"} الكامل`,
      available: "متاح",
      currency: "جنيه",
      teacher: "المدرس",
      teacherBio: settings?.teacherBio ?? "مدرس متخصص في اللغة الإنجليزية للمرحلة الثانوية مع خبرة تزيد عن 15 عاماً في التدريس. يتميز بأسلوب شرح مبسط وتفاعلي يساعد الطلاب على الفهم والتفوق.",
      joinUs: "انضم إلينا اليوم",
      joinUsSubtitle: "سجل دخولك وابدأ رحلتك في تعلم اللغة الإنجليزية مع أفضل الشروحات والاختبارات التفاعلية",
      loginNow: "سجل الدخول الآن",
      registerHere: "طالب جديد؟ سجل هنا",
      rightsReserved: "جميع الحقوق محفوظة",
      loading: "جاري التحميل...",
      feature1Title: "شروحات فيديو",
      feature1Desc: "شاهد شروحات الأستاذ بجودة عالية مع إمكانية الإيقاف والمراجعة في أي وقت.",
      feature2Title: "ملفات PDF",
      feature2Desc: "احصل على ملخصات وأوراق عمل PDF لكل درس يمكنك تحميلها ومراجعتها.",
      feature3Title: "اختبارات تفاعلية",
      feature3Desc: "اختبر نفسك بعد كل وحدة واحصل على نتيجتك فوراً مع شرح الإجابات الخاطئة.",
      feature4Title: "ذكاء اصطناعي",
      feature4Desc: "تحليل ذكي لأدائك وتوصيات مخصصة لتحسين نقاط ضعفك.",
      feature5Title: "تتبع التقدم",
      feature5Desc: "شاهد تقدمك في كل وحدة وتحقق من درجاتك ومستواك عبر الزمن.",
      feature6Title: "تعلم في أي وقت",
      feature6Desc: "المنصة متاحة 24/7 يمكنك الدراسة في الوقت الذي يناسبك.",
      freeContentBadge: "محتوى مجاني",
      freeContentTitle: "جرّب قبل الاشتراك",
      freeContentSubtitle: "شاهد دروس مجانية من المنهج واحكم بنفسك",
      watchFree: "شاهد مجاناً",
      freeBadge: "مجاني",
      minutesLabel: "دقيقة",
    },
    en: {
      newStudent: "New Student?",
      login: "Sign In",
      grade: "3rd Secondary",
      subject: "English",
      teacherName: "Mr. Ahmed Mahmoud",
      welcomeMsg: settings?.welcomeMessage ? "Learn English in an interactive integrated way - video explanations, PDFs, instant tests, and smart feedback." : "Learn English in an interactive integrated way — video lectures, PDF files, interactive assessments, and AI-driven recommendations.",
      startLearning: "Start Learning Now",
      browseSyllabus: "Browse Curriculum",
      platformFeatures: "Features",
      featuresTitle: "Everything You Need in One Place",
      unit: "Units",
      enrolledStudent: "Students",
      interactiveQuiz: "Quizzes",
      yearsExp: "Years Exp.",
      syllabus: "Curriculum",
      courseUnits: "Course Units",
      syllabusSubtitle: "Full 3rd Secondary Curriculum",
      available: "Available",
      currency: "EGP",
      teacher: "Teacher",
      teacherBio: settings?.teacherBio ? "English language specialist for high school students with over 15 years of teaching experience. Ahmed is known for his simplified and interactive explanations." : "A specialist teacher of the English language for the secondary stage with more than 15 years of experience in teaching. He is characterized by a simplified and interactive teaching style that helps students understand and excel.",
      joinUs: "Join Us Today",
      joinUsSubtitle: "Sign in and start your English learning journey with premium explanations and interactive tests.",
      loginNow: "Sign In Now",
      registerHere: "New student? Register here",
      rightsReserved: "All rights reserved",
      loading: "Loading...",
      feature1Title: "Video Lectures",
      feature1Desc: "Watch high-quality video explanations with the ability to pause and review at any time.",
      feature2Title: "PDF Handouts",
      feature2Desc: "Get PDFs of summaries and worksheets for every lesson to download and review.",
      feature3Title: "Interactive Quizzes",
      feature3Desc: "Test yourself after each unit and get your score instantly with explanations for incorrect answers.",
      feature4Title: "AI Recommendations",
      feature4Desc: "Smart performance analysis and custom recommendations to improve your weak areas.",
      feature5Title: "Progress Tracking",
      feature5Desc: "Monitor your progress in each unit, checking grades and improvement over time.",
      feature6Title: "Learn Anytime",
      feature6Desc: "The platform is available 24/7 so you can study at your own pace.",
      freeContentBadge: "Free Content",
      freeContentTitle: "Try Before You Subscribe",
      freeContentSubtitle: "Watch free lessons from the curriculum and judge for yourself",
      watchFree: "Watch Free",
      freeBadge: "Free",
      minutesLabel: "mins",
    }
  };

  const curr = t[lang as "ar" | "en"] || t.ar;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">{curr.loading}</p>
        </motion.div>
      </div>
    );
  }

  const teacherName = curr.teacherName;
  const subject = curr.subject;
  const grade = curr.grade;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header with Theme and Language controls */}
      <header className="absolute top-0 left-0 right-0 z-50 py-4 bg-transparent border-b border-border/5">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div className={`hidden sm:block ${lang === "ar" ? "text-right" : "text-left"}`}>
              <span className="font-bold text-sm block leading-tight">{teacherName}</span>
              <span className="text-xs text-muted-foreground">{subject}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-card/40 backdrop-blur-md border-border/40 hover:bg-muted/50 text-xs sm:text-sm"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            >
              <Globe className="w-4 h-4 text-primary" />
              <span>{lang === "ar" ? "English" : "العربية"}</span>
            </Button>

            {/* Theme toggle */}
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 bg-card/40 backdrop-blur-md border-border/40 hover:bg-muted/50"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </Button>
            
            <Button
              size="sm"
              className="shadow-sm hover:scale-[1.02] transition-transform text-xs sm:text-sm"
              onClick={() => (window.location.href = "/signin")}
            >
              {curr.login}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-bl from-primary/8 via-background to-blue-50/40">
        {/* Background orbs */}
        <FloatingOrb className="w-96 h-96 bg-primary top-[-100px] left-[-100px]" />
        <FloatingOrb className="w-64 h-64 bg-blue-400 bottom-[-50px] right-[-50px]" />
        <FloatingOrb className="w-48 h-48 bg-indigo-300 top-1/2 left-1/3" />

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-24 left-10 w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/35 flex items-center justify-center shadow-sm hidden lg:flex"
          animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Star className="w-6 h-6 text-amber-500" />
        </motion.div>
        <motion.div
          className="absolute top-44 right-16 w-10 h-10 rounded-xl bg-green-100 border border-green-200 dark:bg-green-950/20 dark:border-green-900/35 flex items-center justify-center shadow-sm hidden lg:flex"
          animate={{ y: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <CheckCircle className="w-5 h-5 text-green-500" />
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-20 w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 dark:bg-purple-950/20 dark:border-purple-900/35 flex items-center justify-center shadow-sm hidden lg:flex"
          animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Brain className="w-5 h-5 text-purple-500" />
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-8 w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/35 flex items-center justify-center shadow-sm hidden lg:flex"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          <Trophy className="w-5 h-5 text-blue-500" />
        </motion.div>

        <div className="container relative z-10 pt-28 pb-12 md:pt-36 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text column */}
            <div className={`lg:col-span-7 flex flex-col items-center lg:items-start ${lang === "ar" ? "text-right" : "text-left"}`}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 text-sm px-5 py-1.5 rounded-full gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {grade} · {subject}
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight text-center lg:text-right"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
              >
                {lang === "ar" ? (
                  <>
                    منصة{" "}
                    <span className="relative inline-block">
                      <span className="text-primary">{teacherName}</span>
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-1.5 bg-primary/30 rounded-full"
                        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 0.5 }}
                      />
                    </span>
                    <br />
                    <span className="text-3xl md:text-4xl lg:text-5xl text-muted-foreground font-bold">التعليمية للغة الإنجليزية</span>
                  </>
                ) : (
                  <>
                    <span className="relative inline-block">
                      <span className="text-primary">{teacherName}'s</span>
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-1.5 bg-primary/30 rounded-full"
                        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 0.5 }}
                      />
                    </span>{" "}
                    Educational Portal
                    <br />
                    <span className="text-3xl md:text-4xl lg:text-5xl text-muted-foreground font-bold">For English Language Learning</span>
                  </>
                )}
              </motion.h1>

              <motion.p
                className="text-base md:text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed text-center lg:text-right"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              >
                {curr.welcomeMsg}
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full sm:w-auto"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              >
                <Button
                  size="lg"
                  className="text-base px-8 gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => (window.location.href = "/signin")}
                >
                  <Play className="w-5 h-5" />
                  {curr.startLearning}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 gap-2 bg-card/80 hover:bg-muted/50 transition-all duration-300"
                  onClick={() => document.getElementById("units-section")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <BookOpen className="w-5 h-5" />
                  {curr.browseSyllabus}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            {/* Illustration column */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                className="relative animate-float max-w-[380px] lg:max-w-full"
              >
                {/* Background glow behind image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-blue-400/10 rounded-full blur-2xl -z-10" />
                <img
                  src={heroIllustration}
                  alt="English Educational Portal"
                  className="w-full h-auto object-contain drop-shadow-2xl max-h-[480px]"
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground/40" />
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="py-10 bg-card border-y border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: curr.unit, value: publishedUnits.length || 4, suffix: "", icon: BookOpen, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400" },
              { label: curr.enrolledStudent, value: 8, suffix: "+", icon: Users, color: "text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400" },
              { label: curr.interactiveQuiz, value: 4, suffix: "", icon: CheckCircle, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400" },
              { label: curr.yearsExp, value: 15, suffix: "+", icon: Star, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-3xl font-black text-foreground">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/20">
        <div className="container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">{curr.platformFeatures}</Badge>
            <h2 className="text-3xl font-black">{curr.featuresTitle}</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Play, title: curr.feature1Title, desc: curr.feature1Desc, delay: 0 },
              { icon: BookOpen, title: curr.feature2Title, desc: curr.feature2Desc, delay: 0.1 },
              { icon: CheckCircle, title: curr.feature3Title, desc: curr.feature3Desc, delay: 0.2 },
              { icon: Brain, title: curr.feature4Title, desc: curr.feature4Desc, delay: 0.3 },
              { icon: Trophy, title: curr.feature5Title, desc: curr.feature5Desc, delay: 0.4 },
              { icon: Clock, title: curr.feature6Title, desc: curr.feature6Desc, delay: 0.5 },
            ].map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* Units Preview */}
      {publishedUnits.length > 0 && (
        <section id="units-section" className="py-20">
          <div className="container">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            >
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">{curr.syllabus}</Badge>
              <h2 className="text-3xl font-black">{curr.courseUnits}</h2>
              <p className="text-muted-foreground mt-2">{curr.syllabusSubtitle}</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {publishedUnits.map((unit, i) => (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card 
                    className="h-full border-border/60 hover:border-primary/40 hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer hover:scale-[1.01]"
                    onClick={() => (window.location.href = "/signin")}
                  >
                    <div className="h-28 w-full overflow-hidden relative">
                      <img 
                        src={unit.id === 1 ? unit1Cover : unit.id === 2 ? unit2Cover : unit.id === 3 ? unit3Cover : unit.id === 4 ? unit4Cover : unitCover} 
                        alt={lang === "en" ? unit.titleEn : unit.titleAr} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/25 to-transparent" />
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-primary/95 text-white flex items-center justify-center font-bold text-sm shadow-md">
                        {i + 1}
                      </div>
                    </div>
                    <CardContent className="p-5 pt-4">
                      <h3 className="font-bold text-sm mb-1 leading-snug">
                        {lang === "en" ? unit.titleEn : unit.titleAr}
                      </h3>
                      {unit.titleAr !== unit.titleEn && (
                        <p className="text-xs text-muted-foreground italic mb-3">
                          {lang === "en" ? unit.titleAr : unit.titleEn}
                        </p>
                      )}
                      {unit.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 h-8">{unit.description}</p>
                      ) : (
                        <div className="h-8" />
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-primary font-bold text-sm">{Number(unit.price).toFixed(0)} {curr.currency}</span>
                        <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900">
                          {curr.available}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Free Demo Content */}
      {(freeLessons as any[])?.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-amber-50/50 via-background to-emerald-50/30 dark:from-amber-950/10 dark:via-background dark:to-emerald-950/10">
          <div className="container">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            >
              <Badge className="mb-3 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900">
                <Play className="w-3 h-3 mr-1 ml-1" />{curr.freeContentBadge}
              </Badge>
              <h2 className="text-3xl font-black">{curr.freeContentTitle}</h2>
              <p className="text-muted-foreground mt-2">{curr.freeContentSubtitle}</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(freeLessons as any[]).map((lesson: any, i: number) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="h-full border-border/60 hover:border-amber-400/60 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 overflow-hidden group">
                    {/* Video Preview */}
                    {lesson.videoUrl && (
                      <div className="aspect-video w-full overflow-hidden relative bg-black/5 dark:bg-white/5">
                        <iframe
                          src={getEmbedUrl(lesson.videoUrl)}
                          title={lang === "en" ? (lesson.titleEn || lesson.titleAr) : lesson.titleAr}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-sm leading-snug mb-1">
                            {lang === "en" ? (lesson.titleEn || lesson.titleAr) : lesson.titleAr}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {lang === "en" ? (lesson.unitTitleEn || lesson.unitTitleAr) : lesson.unitTitleAr}
                          </p>
                        </div>
                        <Badge className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 flex-shrink-0">
                          {curr.freeBadge}
                        </Badge>
                      </div>
                      {lesson.durationMinutes > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                          <Clock className="w-3 h-3" />
                          {lesson.durationMinutes} {curr.minutesLabel}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Teacher Bio */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-muted/30 to-background">
        <div className="container max-w-4xl">
          <motion.div
            className="flex flex-col md:flex-row items-center gap-8"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-2xl shadow-primary/20 bg-card group">
                  <img src={teacherAvatar} alt={teacherName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <motion.div
                  className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center shadow-md border-2 border-white"
                  animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="w-5 h-5 text-white fill-white" />
                </motion.div>
              </div>
            </div>
            <div className={`text-center ${lang === "ar" ? "md:text-right" : "md:text-left"}`}>
              <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">{curr.teacher}</Badge>
              <h2 className="text-2xl font-black mb-3">{teacherName}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {curr.teacherBio}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-indigo-700 text-primary-foreground relative overflow-hidden">
        <FloatingOrb className="w-80 h-80 bg-white top-[-100px] right-[-100px]" />
        <FloatingOrb className="w-60 h-60 bg-indigo-300 bottom-[-80px] left-[-80px]" />
        <div className="container text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-80" />
            <h2 className="text-4xl font-black mb-4">{curr.joinUs}</h2>
            <p className="text-primary-foreground/80 mb-8 text-lg max-w-xl mx-auto">
              {curr.joinUsSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-base px-10 gap-2 shadow-xl"
                onClick={() => (window.location.href = "/signin")}
              >
                <GraduationCap className="w-5 h-5" />
                {curr.loginNow}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 gap-2 border-white/30 text-white hover:bg-white/10"
                onClick={() => (window.location.href = "/register")}
              >
                <ArrowLeft className={`w-5 h-5 ${lang === "ar" ? "" : "rotate-180"}`} />
                {curr.registerHere}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
              <div className={lang === "ar" ? "text-right" : "text-left"}>
                <p className="font-bold text-sm">{teacherName}</p>
                <p className="text-xs text-muted-foreground">{subject} · {grade}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 {curr.rightsReserved}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
