import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowRight, BookOpen, BarChart3, Users, Zap, Award, Lightbulb, Target, Brain, Compass, History, Atom, Mail, HelpCircle, Sun, Moon, Check, Sparkles, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { mockAllUsers } from '@/lib/mockData';
import { motion } from 'framer-motion';

const getSubjectIcon = (sub: string) => {
  switch (sub) {
    case 'Mathematics': return <Brain className="w-4 h-4" />;
    case 'Science': return <Atom className="w-4 h-4" />;
    case 'Geography': return <Compass className="w-4 h-4" />;
    case 'History': return <History className="w-4 h-4" />;
    case 'English': return <BookOpen className="w-4 h-4" />;
    default: return <HelpCircle className="w-4 h-4" />;
  }
};

const getSubjectColor = (sub: string) => {
  switch (sub) {
    case 'Mathematics': return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-800/40';
    case 'Science': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/40';
    case 'Geography': return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/50 dark:border-sky-800/40';
    case 'History': return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/40';
    case 'English': return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200/50 dark:border-rose-800/40';
    default: return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-800/40';
  }
};

export default function Landing() {
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [customs, setCustoms] = useState<Record<string, string>>({});
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/customization')
      .then(res => res.json())
      .then(data => {
        setCustoms(data);
      })
      .catch(err => {
        console.error('Error fetching customizations:', err);
      });

    fetch('/api/teachers')
      .then(res => res.json())
      .then(data => {
        setTeachers(data);
      })
      .catch(err => {
        console.error('Error fetching teachers, falling back to mock:', err);
        const activeTeachers = mockAllUsers.filter(
          u => u.role === 'teacher' && u.status === 'active'
        );
        setTeachers(activeTeachers);
      });
  }, []);

  const trustLogos = [
    'Beacon Academy', 'Summit Prep', 'Nova Crest High', 
    'Trinity Classical', 'Oakwood Digital', 'Aegis STEM School'
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 overflow-x-hidden">
      {/* Navigation Bar (Glassmorphic) */}
      <nav className="sticky top-0 z-50 w-full glass border-b border-border/50 shadow-sm">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-primary/10">
              <span className="text-white font-bold text-lg">{(customs.platform_name || 'EduPath')[0]}</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">{customs.platform_name || 'EduPath'}</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle in landing navbar */}
            {toggleTheme && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl hover-lift hover:bg-muted"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500" />
                )}
              </Button>
            )}
            
            <Button variant="ghost" className="rounded-xl font-medium" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button className="bg-primary text-white rounded-xl font-medium shadow-md shadow-primary/10 hover-lift" onClick={() => navigate('/register')}>
              Register
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:py-28 overflow-hidden">
        {/* Colorful Gradient Blobs in Background */}
        <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/5 pointer-events-none animate-pulse-subtle" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-emerald-500/10 blur-[100px] dark:bg-emerald-500/5 pointer-events-none" />

        <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {customs.landing_show_diagnostic !== 'false' && (
              <div 
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 dark:bg-primary/15 border border-primary/20 text-xs font-semibold text-primary cursor-pointer hover:bg-primary/20 transition-all hover-lift"
                onClick={() => navigate('/test-enhanced/test-005')}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{customs.landing_hero_badge || 'Try Our Free AI Smart-Guidance Assessment →'}</span>
              </div>
            )}
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
              {customs.landing_hero_title || 'Master Your Learning with'}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-emerald-500 dark:from-blue-400 dark:to-emerald-400 font-extrabold">
                {customs.landing_hero_span || 'EduPath'}
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              {customs.landing_hero_desc || 'A comprehensive educational platform designed for grades 4-12. Unlock adaptive AI testing, chronological mastery metrics, and customized curriculum goals.'}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/test-enhanced/test-005')}
                className="bg-primary text-white hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/10 rounded-xl font-bold h-12 hover-lift transition-all"
              >
                ⚡ {customs.landing_hero_cta_primary || 'Take Free AI Assessment'} <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/register')}
                className="rounded-xl font-semibold h-12 border-border/80 hover:bg-muted/30 hover-lift"
              >
                {customs.landing_hero_cta_secondary || 'Create Free Account'}
              </Button>
            </div>

            {/* Stats Summary Panel */}
            {customs.landing_show_stats !== 'false' && (
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/60 max-w-lg">
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold text-primary">{customs.landing_stats_1_val || '10K+'}</div>
                  <div className="text-xs font-medium text-muted-foreground">{customs.landing_stats_1_lbl || 'Active Students'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold text-emerald-500">{customs.landing_stats_2_val || '5K+'}</div>
                  <div className="text-xs font-medium text-muted-foreground">{customs.landing_stats_2_lbl || 'Interactive Qs'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold text-amber-500">{customs.landing_stats_3_val || '95%'}</div>
                  <div className="text-xs font-medium text-muted-foreground">{customs.landing_stats_3_lbl || 'Accuracy Rate'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Hero Right: Interactive Browser Window Mockup */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-emerald-500/20 rounded-2xl blur-2xl opacity-60 pointer-events-none -rotate-2" />
            <div className="relative glass-premium rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:rotate-0 rotate-1 border border-white/20 dark:border-white/5">
              {/* Browser Header Bar */}
              <div className="bg-muted/40 dark:bg-muted/20 px-4 py-3 border-b border-border/60 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                </div>
                <div className="flex-1 bg-background/50 rounded-md text-[10px] text-muted-foreground py-0.5 px-3 truncate select-none text-center max-w-[70%] mx-auto">
                  edupath.academy/dashboard/student
                </div>
              </div>
              
              {/* Mockup Content */}
              <div className="p-4 bg-background/40">
                {customs.landing_show_banner !== 'false' ? (
                  <img 
                    src={customs.landing_banner_image || "https://d2xsxph8kpxj0f.cloudfront.net/116779878/Qva2UpEQ5jzdBK2KTmT5KC/boy-exam-banner-98KMavjknQoGs96AaoMJeg.webp"} 
                    alt="EduPath platform dashboard view" 
                    className="w-full h-auto rounded-xl object-cover max-h-[300px] border border-border/40 shadow-sm"
                  />
                ) : (
                  <div className="h-60 bg-muted/30 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground/30 animate-pulse-subtle" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust School Partners Marquee */}
      <section className="py-8 border-y border-border/50 bg-muted/10">
        <div className="container text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Trusted by Teachers and Parents in Top Institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 opacity-60 grayscale hover:grayscale-0 transition-all">
            {trustLogos.map((logo, idx) => (
              <span key={idx} className="font-bold text-sm text-foreground/80 font-mono tracking-tight">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* AI Retraining & Mastery Marketing Banner */}
      {customs.landing_show_ai_retrain !== 'false' && (
        <section className="container py-16">
          <div className="bg-gradient-to-r from-primary/10 via-emerald-500/10 to-indigo-500/10 border border-primary/20 dark:border-white/5 rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="space-y-4 max-w-3xl text-left">
              <Badge className="bg-primary/10 text-primary border-0 font-bold tracking-wide uppercase px-3 py-1 text-[10px] h-6 flex items-center w-fit gap-1 animate-pulse-subtle">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                {customs.landing_ai_badge || 'Interactive Weakness Retraining'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight tracking-tight">
                {customs.landing_ai_title || 'Dynamic Mastery Profiling & Target Retraining'}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {customs.landing_ai_desc || 'Identify skill gaps instantly. Our platform evaluates performance chronologically, drafting a live feedback report detailing strengths and focus areas. Launch Targeted Retraining Quizzes with one click, equipped with guided steps to turn weak topics into complete mastery.'}
              </p>
              <div className="flex flex-wrap gap-2.5 pt-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-background/50 dark:bg-muted/30 px-3 py-1.5 rounded-xl border border-border/40">
                  <Brain className="w-3.5 h-3.5 text-primary" /> Skill Graph Metrics
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-background/50 dark:bg-muted/30 px-3 py-1.5 rounded-xl border border-border/40">
                  <Target className="w-3.5 h-3.5 text-emerald-500" /> 1-Click Quiz Remediation
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-background/50 dark:bg-muted/30 px-3 py-1.5 rounded-xl border border-border/40">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Step-by-Step AI Breakdown
                </span>
              </div>
            </div>
            
            <div className="flex-shrink-0 w-full lg:w-fit flex flex-col gap-3 min-w-[240px]">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-12 rounded-xl shadow-md"
              >
                {customs.landing_ai_cta_primary || 'Start Weakness Retraining'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/test-enhanced/test-005')}
                className="w-full font-bold h-12 rounded-xl border-border/80 hover:bg-muted/30"
              >
                Try Diagnostics Test
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Subjects & Teachers Section */}
      <section className="container py-16 space-y-16 border-t border-border/60">
        {/* Academic Subjects */}
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge className="bg-primary/10 text-primary border-0 font-bold uppercase px-3 py-1 text-[10px] h-6">
              📚 Curriculum Subjects
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Core Course Coverages
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              EduPath provides comprehensive diagnostic tests, quizzes, and resources structured for grades 4-12.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Mathematics', desc: 'Arithmetic, Algebra, & Geometry', icon: Brain, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-200/50' },
              { name: 'Science', desc: 'Physics, Chemistry, & Biology', icon: Atom, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-200/50' },
              { name: 'Geography', desc: 'Earth Mapping & Global Systems', icon: Compass, color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-200/50' },
              { name: 'History', desc: 'Epochs, Nations, & Civilizations', icon: History, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-200/50' },
              { name: 'English', desc: 'Syntax, Literature, & Writing', icon: BookOpen, color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-200/50' },
            ].map((sub, idx) => {
              const Icon = sub.icon;
              return (
                <Card key={idx} className="border border-border/65 hover-lift bg-card/50 backdrop-blur p-5 text-center flex flex-col justify-center items-center rounded-2xl">
                  <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{sub.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-normal">{sub.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Teachers List Grid */}
        <div className="space-y-10 pt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 text-left">
              <Badge className="bg-emerald-500/10 text-emerald-600 border-0 font-bold uppercase px-3 py-1 text-[10px] h-6">
                🎓 Expert Instructors
              </Badge>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                Learn from Dedicated Educators
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                Get custom reports, study guides, and review materials straight from qualified teachers.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/teachers')}
              className="w-full md:w-auto h-10 text-xs font-semibold px-4 border-border/85 rounded-xl shadow-sm hover:bg-muted/30"
            >
              Browse All Teachers <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teachers.slice(0, 3).map(teacher => {
              const avatarSeed = encodeURIComponent(teacher.name);
              const avatarUrl = teacher.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
              return (
                <Card key={teacher.id} className="flex flex-col justify-between hover-lift border border-border/60 shadow-sm overflow-hidden bg-card/50 backdrop-blur rounded-2xl text-left">
                  <div>
                    <div className="h-1.5 bg-gradient-to-r from-primary to-emerald-500" />
                    <CardHeader className="p-5 flex flex-row items-center gap-4">
                      <img
                        src={avatarUrl}
                        alt={teacher.name}
                        className="w-12 h-12 rounded-full border-2 border-primary/25 bg-background object-cover"
                      />
                      <div className="min-w-0">
                        <CardTitle className="text-base font-bold truncate text-foreground">
                          {teacher.name}
                        </CardTitle>
                        <CardDescription className="text-xs truncate text-muted-foreground mt-0.5">
                          {teacher.email}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 py-0 pb-4 space-y-4">
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        Professional educator teaching grade {teacher.gradeLevel || 8} curricula, providing students with structured support and exam preparation.
                      </p>
                      <div className="flex flex-wrap gap-1.5 border-t border-border/40 pt-3">
                        {teacher.subjects?.map((sub: string) => (
                          <Badge 
                            key={sub} 
                            variant="outline" 
                            className={`flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold rounded-lg border ${getSubjectColor(sub)}`}
                          >
                            {getSubjectIcon(sub)}
                            {sub}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                  <CardFooter className="p-3 bg-muted/10 border-t border-border/40">
                    <Button
                      onClick={() => navigate('/teachers')}
                      variant="ghost"
                      className="w-full text-xs font-semibold h-9 text-primary hover:text-primary/95 flex items-center justify-center rounded-xl"
                    >
                      Connect & Enroll <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container py-16 space-y-12 border-t border-border/50">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <Badge className="bg-primary/10 text-primary border-0 font-bold uppercase px-3 py-1 text-[10px] h-6">
            ✨ Core Core Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Features Packed for Learning</h2>
          <p className="text-sm text-muted-foreground">Everything you need to successfully review, learn, and test your understanding.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: BookOpen, title: 'Adaptive Testing', desc: 'Access assessments that dynamically scale in difficulty depending on performance.', color: 'text-primary', bg: 'bg-primary/10' },
            { icon: BarChart3, title: 'Progress Timeline', desc: 'Track your quiz scores chronologically with interactive Recharts reports.', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { icon: Users, title: 'Parent Summaries', desc: 'Parents receive dedicated dashboards with summarized study focus areas.', color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { icon: Zap, title: 'Immediate Explanations', desc: 'Recieve step-by-step detailed feedback explaining correct response options.', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { icon: Award, title: 'Gamified Achievements', desc: 'Unlock milestones, maintain daily study streaks, and collect badges.', color: 'text-rose-500', bg: 'bg-rose-500/10' },
            { icon: Lightbulb, title: 'AI Study Assistant', desc: 'Chat with our AI companion to learn tough curriculum topics.', color: 'text-teal-500', bg: 'bg-teal-500/10' },
            { icon: Target, title: 'Diagnostic Assessment', desc: 'Calibrate grade standings using comprehensive placement assessments.', color: 'text-sky-500', bg: 'bg-sky-500/10' },
            { icon: Users, title: 'School Standings', desc: 'Compete on class leaderboards based on points, streak, and grade limits.', color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-border/75 bg-card/40 hover-lift hover:shadow-lg transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5 text-foreground">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-normal">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-16">
        <div className="bg-muted/15 dark:bg-muted/5 border border-border/50 rounded-3xl p-8 md:p-12 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">What Our Students Say</h2>
            <p className="text-xs text-muted-foreground">Join thousands of students building their academic profiles with EduPath.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Alex Johnson', grade: 'Grade 8', text: 'EduPath helped me improve my math score by 25 points! The instant feedback is amazing.' },
              { name: 'Sarah Chen', grade: 'Grade 10', text: 'The adaptive tests are so cool. They adjust to my level and help me focus on weak areas.' },
              { name: 'Jordan Smith', grade: 'Grade 6', text: 'I love the leaderboard and achievements. It keeps me motivated to study more.' },
            ].map((testimonial, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-card border border-border/60 hover:shadow-sm flex flex-col justify-between text-left">
                <div className="space-y-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">"{testimonial.text}"</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-border/40 mt-4">
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-foreground">{testimonial.name}</p>
                    <p className="text-[10px] text-muted-foreground">{testimonial.grade}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer (Premium Multi-column) */}
      <footer className="border-t border-border/60 py-12 mt-16 bg-muted/10">
        <div className="container grid grid-cols-2 md:grid-cols-5 gap-8 text-left">
          {/* Logo Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">E</div>
              <span className="font-bold text-lg text-foreground">{customs.platform_name || 'EduPath'}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              State-of-the-art educational platform offering adaptive testing, diagnostic metrics, and collaborative dashboards.
            </p>
          </div>
          
          {/* Mock Links 1 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">AI Assessment</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Quiz Remediation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Course Curriculums</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">School Leaderboards</a></li>
            </ul>
          </div>

          {/* Mock Links 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Study Guides</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Grade 4-12 Paths</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Parent Analytics</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Teacher Dashboard</a></li>
            </ul>
          </div>

          {/* Mock Links 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Safety Standards</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Umami Analytics</a></li>
            </ul>
          </div>
        </div>
        
        <div className="container border-t border-border/40 mt-8 pt-6 text-center text-muted-foreground text-[11px] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} {customs.platform_name || 'EduPath'}. All rights reserved.</p>
          <p>Designed with Modern Educational Minimalism for student engagement.</p>
        </div>
      </footer>
    </div>
  );
}
