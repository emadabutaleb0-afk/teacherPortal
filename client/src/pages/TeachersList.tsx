import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  mockAllUsers, 
  mockEnrollments, 
  availableSubjects,
  UserAccount,
  Enrollment
} from '@/lib/mockData';
import { 
  enrollStudent, 
  unenrollStudent, 
  hydrateDatabaseState 
} from '@/lib/dbSync';
import { 
  Search, 
  Filter, 
  GraduationCap, 
  Brain, 
  Atom, 
  Compass, 
  History, 
  BookOpen, 
  HelpCircle, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const getSubjectIcon = (sub: string) => {
  switch (sub) {
    case 'Mathematics': return <Brain className="w-3.5 h-3.5" />;
    case 'Science': return <Atom className="w-3.5 h-3.5" />;
    case 'Geography': return <Compass className="w-3.5 h-3.5" />;
    case 'History': return <History className="w-3.5 h-3.5" />;
    case 'English': return <BookOpen className="w-3.5 h-3.5" />;
    default: return <HelpCircle className="w-3.5 h-3.5" />;
  }
};

const getSubjectColor = (sub: string) => {
  switch (sub) {
    case 'Mathematics': return 'bg-primary/10 text-primary border-primary/20';
    case 'Science': return 'bg-success/10 text-success border-success/20';
    case 'Geography': return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/50';
    case 'History': return 'bg-warning/10 text-warning border-warning/20';
    case 'English': return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200/50';
    default: return 'bg-muted text-muted-foreground border-border/80';
  }
};

export default function TeachersList() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [teachers, setTeachers] = useState<UserAccount[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // Enrollment selection dialog states
  const [selectedTeacher, setSelectedTeacher] = useState<UserAccount | null>(null);
  const [enrollSubject, setEnrollSubject] = useState<string>('');
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        await hydrateDatabaseState();
        const activeTeachers = mockAllUsers.filter(
          u => u.role === 'teacher' && u.status === 'active'
        );
        setTeachers(activeTeachers);
        setEnrollments([...mockEnrollments]);
      } catch (e) {
        console.error('Failed loading teachers', e);
        toast.error('Failed to load teachers list.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const teacherSubjects = t.subjects || [];
    const matchesSubject = selectedSubject === 'All' || teacherSubjects.includes(selectedSubject);

    return matchesSearch && matchesSubject;
  });

  const getTeacherEnrollments = (teacherId: string) => {
    if (!user) return [];
    return enrollments.filter(
      e => e.studentId === user.id && e.teacherId === teacherId
    );
  };

  const handleEnrollClick = (teacher: UserAccount) => {
    if (!user) {
      setIsGuestDialogOpen(true);
      return;
    }

    if (user.role !== 'student') {
      toast.error('Only registered students can enroll with teachers.');
      return;
    }

    setSelectedTeacher(teacher);
    if (teacher.subjects && teacher.subjects.length > 0) {
      setEnrollSubject(teacher.subjects[0]);
    } else {
      setEnrollSubject('');
    }
    setIsEnrollDialogOpen(true);
  };

  const handleConfirmEnroll = async () => {
    if (!user || !selectedTeacher || !enrollSubject) return;

    try {
      const success = await enrollStudent(user.id, selectedTeacher.id, enrollSubject);
      if (success) {
        setEnrollments([...mockEnrollments]);
        toast.success(`Successfully enrolled in ${enrollSubject} with ${selectedTeacher.name}!`);
        setIsEnrollDialogOpen(false);
      } else {
        toast.error('Enrollment failed. Please try again.');
      }
    } catch (e) {
      toast.error('An error occurred during enrollment.');
    }
  };

  const handleUnenroll = async (teacherId: string, subject: string) => {
    if (!user) return;

    try {
      const success = await unenrollStudent(user.id, teacherId, subject);
      if (success) {
        setEnrollments([...mockEnrollments]);
        toast.success(`Successfully unenrolled from ${subject}.`);
      } else {
        toast.error('Failed to unenroll.');
      }
    } catch (e) {
      toast.error('An error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
        <div className="container space-y-8 max-w-6xl px-4">
          {/* Header */}
          <div className="animate-fadeIn space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-2 text-foreground">
              Our Expert Teachers 🎓
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-3xl leading-relaxed">
              Browse qualified educators, filter by subject area, and enroll to begin personalizing your study plans.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 p-4 bg-card/65 backdrop-blur border border-border rounded-xl shadow-sm animate-fadeIn">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teacher by name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-background/80"
              />
            </div>
            <div className="w-full md:w-56">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="h-10 bg-background/80">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Filter by Subject" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Subjects</SelectItem>
                  {availableSubjects.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Teachers Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted/30 border border-border rounded-xl" />
              ))}
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-16 bg-card border border-dashed border-muted rounded-xl animate-fadeIn">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-foreground mb-1">No teachers found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try adjusting your search criteria or subject filters to explore other educators.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
              {filteredTeachers.map(teacher => {
                const activeTeacherEnrollments = getTeacherEnrollments(teacher.id);
                const avatarSeed = encodeURIComponent(teacher.name);
                const avatarUrl = teacher.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
                
                return (
                  <Card key={teacher.id} className="group h-full flex flex-col justify-between hover-lift border border-border/80 shadow-sm overflow-hidden bg-card/40 backdrop-blur">
                    <div>
                      {/* Decorative colored header */}
                      <div className="h-2.5 bg-gradient-to-r from-primary to-accent opacity-75 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="space-y-3 pt-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={avatarUrl}
                            alt={teacher.name}
                            className="w-14 h-14 rounded-full border-2 border-primary/20 bg-background object-cover transition-transform duration-350 group-hover:scale-105"
                          />
                          <div>
                            <CardTitle className="text-lg font-bold leading-tight text-foreground flex items-center gap-1.5">
                              {teacher.name}
                            </CardTitle>
                            <CardDescription className="text-xs flex items-center gap-1 mt-1 font-medium text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {teacher.email}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 pt-1">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Dedicated educator specializing in {teacher.subjects?.join(' & ') || 'general curriculum'} with grade {teacher.gradeLevel || 8} frameworks, focused on student-centered achievements.
                        </p>

                        <div className="space-y-2.5">
                          <div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Subjects</span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {teacher.subjects && teacher.subjects.length > 0 ? (
                                teacher.subjects.map(sub => (
                                  <Badge 
                                    key={sub} 
                                    variant="outline" 
                                    className={`flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getSubjectColor(sub)}`}
                                  >
                                    {getSubjectIcon(sub)}
                                    {sub}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">General subjects</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/40">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Grade Target</span>
                            <Badge variant="secondary" className="font-semibold text-xs px-2 py-0.5">
                              Grade {teacher.gradeLevel || '8'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    <CardFooter className="pt-2 pb-5 border-t border-border/40 bg-muted/10">
                      <div className="w-full space-y-3">
                        {activeTeacherEnrollments.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Your active enrollments:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {activeTeacherEnrollments.map(e => (
                                <div key={e.subject} className="flex items-center gap-1 bg-success/15 text-success border border-success/20 rounded-lg px-2 py-1 text-xs font-medium">
                                  <CheckCircle className="w-3.5 h-3.5 text-success" />
                                  <span>{e.subject}</span>
                                  <button
                                    onClick={() => handleUnenroll(teacher.id, e.subject)}
                                    className="ml-1 text-success hover:text-destructive hover:scale-110 transition-all cursor-pointer"
                                    title="Unenroll"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button 
                          onClick={() => handleEnrollClick(teacher)}
                          className="w-full bg-primary hover:opacity-90 hover-lift text-xs h-9 font-semibold text-white shadow-sm"
                        >
                          <GraduationCap className="w-4 h-4 mr-2" />
                          Enroll Now
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Guest Enrollment Dialog */}
      <Dialog open={isGuestDialogOpen} onOpenChange={setIsGuestDialogOpen}>
        <DialogContent className="max-w-md bg-card/90 backdrop-blur">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white mx-auto shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <DialogTitle className="text-center text-xl font-extrabold tracking-tight text-foreground">
              Ready to learn together? 🌟
            </DialogTitle>
            <DialogDescription className="text-center text-sm leading-relaxed text-muted-foreground">
              Register or login with a student account to enroll with teachers, select study subjects, and get your custom diagnostic reports.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 sm:justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="w-full sm:w-28 text-xs font-semibold h-9"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/register')}
              className="w-full sm:w-28 text-xs font-semibold h-9 bg-gradient-to-r from-primary to-accent text-white"
            >
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Enrollment Dialog */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent className="max-w-md bg-card/90 backdrop-blur">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              Select Study Subject 📚
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Choose which subject you want to enroll in with <strong className="text-foreground">{selectedTeacher?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Subject Selection</label>
            <Select value={enrollSubject} onValueChange={setEnrollSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {selectedTeacher?.subjects?.map(sub => {
                  const alreadyEnrolled = enrollments.some(
                    e => user && e.studentId === user.id && e.teacherId === selectedTeacher.id && e.subject === sub
                  );
                  return (
                    <SelectItem key={sub} value={sub} disabled={alreadyEnrolled}>
                      {sub} {alreadyEnrolled ? '(Already Enrolled)' : ''}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              variant="ghost"
              onClick={() => setIsEnrollDialogOpen(false)}
              className="text-xs font-semibold h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmEnroll}
              disabled={!enrollSubject}
              className="text-xs font-semibold h-9 bg-primary text-white"
            >
              Confirm Enrollment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
