import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, GraduationCap } from 'lucide-react';

// Decomposed Sub-components
import TeacherOverview from '@/components/teacher/TeacherOverview';
import TeacherCurriculum from '@/components/teacher/TeacherCurriculum';
import TeacherQuestionBank from '@/components/teacher/TeacherQuestionBank';
import TeacherTestBuilder from '@/components/teacher/TeacherTestBuilder';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // Load active tab from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['overview', 'curriculum', 'question-bank', 'test-builder'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [window.location.search]);

  // Handle manual tab changes and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.pushState({}, '', url.pathname + url.search);
  };

  // Redirect if not authorized
  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'teacher') {
    return null;
  }

  const teacherSubjects = user.subjects || [];
  const teacherGrade = user.gradeLevel;
  const isProfileConfigured = teacherSubjects.length > 0 && teacherGrade !== undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative h-48 md:h-52 bg-gradient-to-r from-indigo-500/20 via-primary/20 to-accent/20 border-b border-border overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="teacherGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 0 0 L 60 0 L 60 60 L 0 60 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="1200" height="300" fill="url(#teacherGrid)" />
        </svg>
        
        <div className="container h-full flex items-center relative z-10 px-4">
          <div>
            <div className="flex items-center gap-2 mb-2 animate-fadeIn">
              <GraduationCap className="w-8 h-8 text-primary" />
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold px-3 py-1">
                Teacher Space
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight animate-slide-up">Teacher Dashboard 👩‍🏫</h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1 animate-slide-up">
              Curate custom lessons, upload videos & documents, create custom tests, and import batch questions.
            </p>
          </div>
        </div>
      </div>

      <main className="container py-8 px-4 space-y-8">
        {!isProfileConfigured ? (
          <div className="max-w-2xl mx-auto text-center py-16 px-6 bg-card/60 border border-border/80 backdrop-blur rounded-2xl shadow-xl space-y-6 animate-fadeIn">
            <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Settings className="w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight">Academic Scope Unconfigured ⚠️</h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Before accessing curriculum registries, building custom tests, or importing batch questions, please update your Profile with the specific subjects and grade levels you teach.
              </p>
            </div>
            <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 text-xs text-yellow-700 dark:text-yellow-400 font-medium">
              This helps tailor your workspace and ensures you only manage classes and questions aligned with your teaching assignment.
            </div>
            <Button 
              onClick={() => navigate('/profile')} 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 font-bold text-white shadow-lg shadow-primary/20 px-8 py-5 h-auto text-sm transition-all duration-300 hover:scale-[1.02]"
            >
              Configure Teaching Profile
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="bg-secondary/40 border border-border p-1 w-full md:w-auto grid grid-cols-2 sm:grid-cols-3 md:inline-flex h-auto gap-1">
              <TabsTrigger value="overview" className="rounded-md px-4 py-2 font-semibold">
                Overview & Stats
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="rounded-md px-4 py-2 font-semibold">
                Curriculum Manager
              </TabsTrigger>
              <TabsTrigger value="question-bank" className="rounded-md px-4 py-2 font-semibold">
                Question Bank
              </TabsTrigger>
              <TabsTrigger value="test-builder" className="rounded-md px-4 py-2 font-semibold">
                Test Builder
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <TeacherOverview user={user} setActiveTab={handleTabChange} />
            </TabsContent>

            <TabsContent value="curriculum">
              <TeacherCurriculum user={user} />
            </TabsContent>

            <TabsContent value="question-bank">
              <TeacherQuestionBank user={user} />
            </TabsContent>

            <TabsContent value="test-builder">
              <TeacherTestBuilder user={user} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
