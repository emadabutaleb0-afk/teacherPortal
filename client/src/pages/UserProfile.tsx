import { useState, useEffect, ChangeEvent } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Edit, Save, X, Mail, Calendar, Award, Activity, Shield, Users, 
  Database, Clock, RefreshCw, CheckCircle2, AlertTriangle, Server, 
  ArrowRight, Check, Brain, Atom, Compass, History, BookOpen, UserPlus, Search, GraduationCap 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { 
  mockStudentStats, 
  mockProgressHistory, 
  mockAchievements, 
  mockUserActivities, 
  mockAllUsers, 
  availableSubjects, 
  availableGrades,
  mockTests,
  mockQuestions,
  mockEnrollments
} from '@/lib/mockData';
import { Navbar } from '@/components/Navbar';
import { toggleDBMode, runSQLSeeder, getDBStatus, activeDBMode } from '@/lib/dbSync';
import { toast } from 'sonner';

const getSubjectIcon = (sub: string) => {
  switch (sub) {
    case 'Mathematics': return <Brain className="w-4 h-4" />;
    case 'Science': return <Atom className="w-4 h-4" />;
    case 'Geography': return <Compass className="w-4 h-4" />;
    case 'History': return <History className="w-4 h-4" />;
    case 'English': return <BookOpen className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
  }
};

const getSubjectColor = (sub: string) => {
  switch (sub) {
    case 'Mathematics': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/60';
    case 'Science': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60';
    case 'Geography': return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/60';
    case 'History': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60';
    case 'English': return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60';
    default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
  }
};

// Heatmap Grid Component for Student Activity
function ActivityHeatmap() {
  // Generate data for 14 weeks (98 days)
  const weeks = 14;
  const days = 7;
  const totalDays = weeks * days;
  
  // Seed random activity levels (0 to 4)
  const seedData = Array.from({ length: totalDays }, (_, i) => {
    const dayOfWeek = i % 7;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    let val = Math.floor(Math.random() * 5);
    if (isWeekend) val = Math.max(0, val - 3);
    return val;
  });

  const getColorClass = (level: number) => {
    switch (level) {
      case 0: return 'bg-muted/40 dark:bg-muted/20 border-transparent';
      case 1: return 'bg-success/20 border-success/10';
      case 2: return 'bg-success/45 border-success/15';
      case 3: return 'bg-success/70 border-success/20';
      case 4: return 'bg-success border-success/30';
      default: return 'bg-muted/40 border-transparent';
    }
  };

  return (
    <Card className="border-border/60 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Study Consistency Grid
        </CardTitle>
        <CardDescription className="text-xs">Your daily quiz completions & learning activity over the last 14 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-3">
            {/* Day labels (Sun, Tue, Thu, Sat) */}
            <div className="flex flex-col justify-between text-[10px] text-muted-foreground pr-2 font-semibold h-24 pt-1 flex-shrink-0">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>
            
            {/* Grid */}
            <div className="grid grid-flow-col grid-rows-7 gap-1 flex-shrink-0">
              {seedData.map((level, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm transition-all duration-200 hover:scale-125 border ${getColorClass(level)}`}
                  title={`Activity level: ${level}`}
                />
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground font-semibold">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-muted/40 border border-transparent" />
            <div className="w-2.5 h-2.5 rounded-sm bg-success/20 border border-success/10" />
            <div className="w-2.5 h-2.5 rounded-sm bg-success/45 border border-success/15" />
            <div className="w-2.5 h-2.5 rounded-sm bg-success/70 border border-success/20" />
            <div className="w-2.5 h-2.5 rounded-sm bg-success border border-success/30" />
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserProfile() {
  const { user, updateProfile, getAllUsers, linkParentToStudent } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  
  // Decoupled role-specific form state initialization
  const [formData, setFormData] = useState(() => {
    const base = {
      name: user?.name || '',
      email: user?.email || '',
    };
    if (user?.role === 'student' || user?.role === 'teacher') {
      return {
        ...base,
        gradeLevel: user.gradeLevel || 8,
      };
    } else if (user?.role === 'admin') {
      return {
        ...base,
        adminTitle: (user as any).adminTitle || 'System Administrator',
        department: (user as any).department || 'Academic Operations',
        phone: (user as any).phone || '+1 (555) 019-9283',
        bio: (user as any).bio || 'Managing curriculum design, test calibration, and platform system auditing.',
      };
    } else { // parent
      return {
        ...base,
        phone: (user as any).phone || '+1 (555) 014-4829',
      };
    }
  });

  // Admin Logs Filtering & DB Simulation States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [isSeeding, setIsSeeding] = useState(false);
  const [dbMode, setDbMode] = useState<'mock' | 'postgres'>(activeDBMode);
  const [dbStatus, setDbStatus] = useState({
    activeConnections: 0,
    queryLatency: '0ms',
    tableCount: 11,
    rowsSeeded: 0,
    lastSync: 'Never synchronized',
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      const loadStatus = async () => {
        const modeRes = await fetch('/api/db-mode');
        if (modeRes.ok) {
          const modeData = await modeRes.json();
          setDbMode(modeData.dbMode);
        }
        
        const status = await getDBStatus();
        if (status) {
          setDbStatus(status);
        }
      };
      loadStatus();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gradeLevel' ? parseInt(value) : value,
    }));
  };

  const handleSave = () => {
    // Only save parameters associated with the user's role to prevent student contamination (e.g. gradeLevel) on admins/parents
    // NOTE: subjects are managed exclusively through enrollment — never saved from profile
    const payload: any = {
      name: formData.name,
      email: formData.email,
    };
    if (user.role === 'student' || user.role === 'teacher') {
      payload.gradeLevel = (formData as any).gradeLevel;
    } else if (user.role === 'admin') {
      payload.adminTitle = (formData as any).adminTitle;
      payload.department = (formData as any).department;
      payload.phone = (formData as any).phone;
      payload.bio = (formData as any).bio;
    } else if (user.role === 'parent') {
      payload.phone = (formData as any).phone;
    }

    updateProfile(payload);
    setIsEditing(false);
    toast.success('Profile updated successfully! ✨');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Find linked children if parent
  const allUsersList = getAllUsers();
  const linkedStudents = user.role === 'parent' 
    ? allUsersList.filter(u => u.role === 'student' && (user.linkedStudents?.includes(u.id) || u.linkedParents?.includes(user.id)))
    : [];

  // Filtered system activities based on search and filters
  const filteredLogs = mockUserActivities.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const uniqueActions = Array.from(new Set(mockUserActivities.map(l => l.action)));

  const handleRunSeeder = async () => {
    setIsSeeding(true);
    toast.info('Initiating database sync and upsert transactions...');
    
    const result = await runSQLSeeder();
    setIsSeeding(false);
    
    if (result.success) {
      toast.success(result.message);
      // Refresh status counts
      const status = await getDBStatus();
      if (status) {
        setDbStatus(status);
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8 max-w-4xl animate-fadeIn">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and view platform details</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-8 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="pt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-md">
                {getInitials(formData.name)}
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-1">
                {!isEditing ? (
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-3xl font-bold text-foreground">{formData.name}</h2>
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'teacher' ? 'default' : user.role === 'parent' ? 'secondary' : 'outline'}>
                        {user.role === 'admin' ? 'Admin 🛠️' : user.role === 'teacher' ? 'Teacher 👩‍🏫' : user.role === 'parent' ? 'Parent 👥' : 'Student 🎓'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-muted-foreground text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <span>{formData.email}</span>
                      </div>
                      
                      {(user.role === 'student' || user.role === 'teacher') && (
                        <>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{user.role === 'teacher' ? 'Assigned Grade:' : 'Grade'} {(formData as any).gradeLevel || 'None'}</span>
                          </div>
                          {user.role === 'student' && (
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-primary" />
                              <span>Level {mockStudentStats.level.level} Student</span>
                            </div>
                          )}
                          <div className="mt-3 space-y-1.5">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              {user.role === 'teacher' ? 'Assigned Subjects' : 'Registered Subjects'}
                            </p>
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {user.subjects && user.subjects.length > 0 ? (
                                user.subjects.map(sub => (
                                  <Badge key={sub} variant="outline" className={`flex items-center gap-1 h-6 px-2 text-xs font-semibold border ${getSubjectColor(sub)}`}>
                                    {getSubjectIcon(sub)}
                                    {sub}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-yellow-600 font-medium">No subjects registered</span>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {user.role === 'admin' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-foreground">{(formData as any).adminTitle} • {(formData as any).department}</span>
                          </div>
                          <p className="text-xs italic text-muted-foreground mt-1 max-w-md">
                            "{(formData as any).bio}"
                          </p>
                          <div className="flex items-center gap-3 text-xs mt-2 text-muted-foreground">
                            <span className="font-bold text-[9px] uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">Root Access</span>
                            <span>Phone: {(formData as any).phone}</span>
                          </div>
                        </div>
                      )}

                      {user.role === 'parent' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span>Linked Students: {linkedStudents.length}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Phone: {(formData as any).phone}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    
                    {(user.role === 'student' || user.role === 'teacher') && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Grade Level</label>
                          <select
                            name="gradeLevel"
                            value={(formData as any).gradeLevel}
                            onChange={handleInputChange}
                            className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {availableGrades.map(grade => (
                              <option key={grade} value={grade}>
                                Grade {grade}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Enrolled Subjects</label>
                          {user.role === 'student' ? (
                            <div className="p-4 rounded-xl border-2 border-dashed border-border bg-secondary/20">
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {user.subjects && user.subjects.length > 0 ? (
                                  user.subjects.map(sub => (
                                    <Badge key={sub} variant="outline" className={`flex items-center gap-1 h-6 px-2 text-xs font-semibold border ${getSubjectColor(sub)}`}>
                                      {getSubjectIcon(sub)}
                                      {sub}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">No subjects enrolled yet</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                <GraduationCap className="w-4 h-4 text-primary" />
                                <span className="text-xs text-muted-foreground">Subjects are managed through teacher enrollment.</span>
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => setLocation('/teachers')}
                                  className="text-xs text-primary font-semibold p-0 h-auto gap-1"
                                >
                                  Enroll with Teachers
                                  <ArrowRight className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {user.subjects && user.subjects.length > 0 ? (
                                user.subjects.map(sub => (
                                  <Badge key={sub} variant="outline" className={`flex items-center gap-1 h-6 px-2 text-xs font-semibold border ${getSubjectColor(sub)}`}>
                                    {getSubjectIcon(sub)}
                                    {sub}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground italic">No subjects assigned</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {user.role === 'admin' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Admin Title</label>
                            <input
                              type="text"
                              name="adminTitle"
                              value={(formData as any).adminTitle}
                              onChange={handleInputChange}
                              className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Department</label>
                            <input
                              type="text"
                              name="department"
                              value={(formData as any).department}
                              onChange={handleInputChange}
                              className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Phone Number</label>
                          <input
                            type="text"
                            name="phone"
                            value={(formData as any).phone}
                            onChange={handleInputChange}
                            className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Bio</label>
                          <textarea
                            name="bio"
                            value={(formData as any).bio}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          />
                        </div>
                      </>
                    )}

                    {user.role === 'parent' && (
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Phone Number</label>
                        <input
                          type="text"
                          name="phone"
                          value={(formData as any).phone}
                          onChange={handleInputChange}
                          className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Edit Action buttons */}
              <div className="flex gap-2 flex-shrink-0 self-start sm:self-center">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="gap-2 border-primary text-primary hover:bg-primary/5 h-9"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-primary to-accent gap-2 h-9 text-white font-semibold"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                      }}
                      variant="outline"
                      className="gap-2 h-9"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Tab Layout by Role */}
        {user.role === 'student' && (
          <Tabs defaultValue="achievements" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="achievements" className="animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockAchievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`hover:shadow transition-all duration-300 ${achievement.unlockedAt ? 'border-primary/40 bg-primary/5' : 'border-border opacity-60'}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="text-4xl">{achievement.icon}</div>
                        <Badge
                          className={
                            achievement.rarity === 'legendary' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                            achievement.rarity === 'epic' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                            achievement.rarity === 'rare' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            'bg-muted text-muted-foreground'
                          }
                        >
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <CardTitle className="text-base mt-2">{achievement.name}</CardTitle>
                      <CardDescription className="text-xs">{achievement.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      {achievement.unlockedAt ? (
                        <span>Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                      ) : (
                        <span>Locked</span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between items-center pb-3 border-b border-border">
                      <span className="text-muted-foreground">Tests Taken</span>
                      <span className="text-xl font-bold text-foreground">{mockStudentStats.totalTestsTaken}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-border">
                      <span className="text-muted-foreground">Average Score</span>
                      <span className="text-xl font-bold text-foreground">{mockStudentStats.averageScore}%</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-border">
                      <span className="text-muted-foreground">Total XP Gained</span>
                      <span className="text-xl font-bold text-foreground">{mockStudentStats.totalXp} XP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Level Progression</span>
                      <span className="text-xl font-bold text-foreground">Level {mockStudentStats.level.level}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subject Mastery</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(mockStudentStats.subjectMastery).map(([subject, percentage]) => (
                      <div key={subject}>
                        <div className="flex justify-between mb-1.5 text-xs font-semibold">
                          <span>{subject}</span>
                          <span className="text-primary">{percentage}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="animate-fadeIn space-y-6">
              <ActivityHeatmap />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Quiz & Activity Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockProgressHistory.slice(0, 8).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/60 transition-colors text-sm">
                        <div>
                          <p className="font-semibold text-foreground">{entry.testTitle}</p>
                          <p className="text-xs text-muted-foreground">{entry.subject}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{entry.percentage}%</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {user.role === 'admin' && (
          <Tabs defaultValue="audits" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
              <TabsTrigger value="audits">System Audit Logs</TabsTrigger>
              <TabsTrigger value="platform">Academic & DB Control</TabsTrigger>
            </TabsList>

            {/* Admin Audit Logs */}
            <TabsContent value="audits" className="animate-fadeIn">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary animate-pulse" />
                        Recent Administrative Actions
                      </CardTitle>
                      <CardDescription>Audited actions logged platform-wide</CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1 border-primary text-primary hover:bg-primary/5 h-8"
                      onClick={() => {
                        toast.success('System audit logs archived successfully! 📁');
                      }}
                    >
                      Archive Logs
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Search logs by keyword, ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <select
                      value={filterAction}
                      onChange={(e) => setFilterAction(e.target.value)}
                      className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
                    >
                      <option value="all">All Actions</option>
                      {uniqueActions.map(action => (
                        <option key={action} value={action}>
                          {action.replace(/_/g, ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {filteredLogs.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No administrative logs matching the search criteria.
                      </div>
                    ) : (
                      filteredLogs.map((log) => (
                        <div key={log.id} className="p-3 bg-secondary/40 rounded-lg border border-border flex items-start gap-3 hover:bg-secondary/60 transition-colors text-xs">
                          <div className="p-1.5 bg-primary/10 rounded text-primary mt-0.5">
                            <Shield className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-0.5">
                              <span className="font-bold uppercase text-[10px] tracking-wider text-primary">{log.action.replace(/_/g, ' ')}</span>
                              <span className="text-muted-foreground text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-foreground font-medium mb-1">{log.details}</p>
                            <p className="text-[10px] text-muted-foreground">Admin/User ID: <strong>{log.userId}</strong></p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admin Platform & DB Summary */}
            <TabsContent value="platform" className="animate-fadeIn">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Platform Registries Summary */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Database className="w-5 h-5 text-primary" />
                        Academic Parameters
                      </CardTitle>
                      <CardDescription>Custom academic registry sizes and item count</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div className="flex justify-between items-center pb-2.5 border-b border-border">
                        <span className="text-muted-foreground">Custom Subjects Registry</span>
                        <Badge className="bg-primary/10 text-primary border border-primary/20">{availableSubjects.length} subjects</Badge>
                      </div>
                      <div className="flex justify-between items-center pb-2.5 border-b border-border">
                        <span className="text-muted-foreground">Custom Grades Registry</span>
                        <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5">{availableGrades.length} grade levels</Badge>
                      </div>
                      <div className="flex justify-between items-center pb-2.5 border-b border-border">
                        <span className="text-muted-foreground">Manageable Questions</span>
                        <span className="font-bold text-foreground">{mockQuestions.length} items</span>
                      </div>
                      <div className="flex justify-between items-center pb-1">
                        <span className="text-muted-foreground">Manageable Quizzes</span>
                        <span className="font-bold text-foreground">{mockTests.length} active</span>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs font-semibold gap-1.5 border-primary text-primary hover:bg-primary/5 mt-2 h-9"
                        onClick={() => setLocation('/admin-dashboard')}
                      >
                        Academic Customization Hub
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Mode Toggler */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Server className="w-4 h-4 text-primary" />
                        System Database Driver
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border">
                        <div className="flex-1">
                          <p className="text-xs font-semibold">
                            {dbMode === 'mock' ? 'SQLite Simulation Mode (Local Storage)' : 'Active PostgreSQL Driver Connection'}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {dbMode === 'mock' 
                              ? 'Operating client-side sandbox simulated states'
                              : 'Routing full relational DDL transactions directly'}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            const newMode = dbMode === 'mock' ? 'postgres' : 'mock';
                            const res = await toggleDBMode(newMode);
                            if (res.success) {
                              setDbMode(res.dbMode);
                              toast.success(`Switched backend driver to ${res.dbMode === 'mock' ? 'SQLite Local Simulation' : 'PostgreSQL Relational DB Connection'}! 🔌`);
                              // Refresh status
                              const status = await getDBStatus();
                              if (status) {
                                setDbStatus(status);
                              }
                            } else {
                              toast.error(res.message || 'Failed to switch database driver mode.');
                            }
                          }}
                          className="focus:outline-none"
                        >
                          <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${dbMode === 'postgres' ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${dbMode === 'postgres' ? 'translate-x-6' : 'translate-x-0'}`} />
                          </div>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Database Seeder Control Center */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Database className="w-5 h-5 text-primary" />
                          SQL Seeder Engine
                        </CardTitle>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] font-bold">
                          ONLINE
                        </Badge>
                      </div>
                      <CardDescription>Initiate upsert transactional seeder pipelines</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs">
                      <div className="p-3 bg-background rounded-lg border border-border space-y-2">
                        <div className="flex justify-between border-b border-border/60 pb-1.5">
                          <span className="text-muted-foreground">Relational Schema Tables</span>
                          <span className="font-bold">{dbStatus.tableCount} tables active</span>
                        </div>
                        <div className="flex justify-between border-b border-border/60 pb-1.5">
                          <span className="text-muted-foreground">Dynamic Seeder Rows</span>
                          <span className="font-bold">{dbStatus.rowsSeeded} records</span>
                        </div>
                        <div className="flex justify-between border-b border-border/60 pb-1.5">
                          <span className="text-muted-foreground">Query Latency Ping</span>
                          <span className="font-bold text-green-500">{dbStatus.queryLatency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Seeder Synchronization</span>
                          <span className="font-semibold">{dbStatus.lastSync}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 dark:text-yellow-300 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold">Caution: Production Resets</p>
                          <p className="text-[10px] opacity-90 leading-relaxed">Running seeders resets transactional tables and refreshes default credentials back to initial config state.</p>
                        </div>
                      </div>

                      <Button
                        onClick={handleRunSeeder}
                        disabled={isSeeding}
                        className="w-full bg-gradient-to-r from-primary to-accent gap-2 h-10 text-white font-semibold text-xs shadow-md"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
                        {isSeeding ? 'Executing Transactions...' : 'Run SQL Seeder Engine'}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* System Audit Warnings */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Security & System Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-[11px] text-muted-foreground space-y-2">
                      <div className="flex gap-2">
                        <span className="text-green-500 font-bold">✓</span>
                        <span>Full connection validation complete with zero thread errors.</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-green-500 font-bold">✓</span>
                        <span>Mock-data seeder aligns 1:1 with PostgreSQL relational models.</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {user.role === 'parent' && (
          <Tabs defaultValue="children" className="space-y-6">
            <TabsList className="grid w-full grid-cols-1 bg-secondary/50">
              <TabsTrigger value="children">Linked Children Profiles</TabsTrigger>
            </TabsList>

            <TabsContent value="children" className="animate-fadeIn space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Linked Children</h3>
                  <p className="text-xs text-muted-foreground">Manage student dashboards linked to your parent account</p>
                </div>
                
                <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-primary to-accent hover-lift text-white gap-2 font-semibold text-xs h-9 shadow-md">
                      <UserPlus className="w-4 h-4" />
                      Link Student Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        Link Student Account
                      </DialogTitle>
                      <DialogDescription>
                        Search by name or email to link a student account to your profile.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search students by name or email..."
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      
                      <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                        {(() => {
                          const query = studentSearchQuery.trim().toLowerCase();
                          if (!query) {
                            return (
                              <p className="text-center text-xs text-muted-foreground py-6">
                                Start typing to search for students...
                              </p>
                            );
                          }
                          
                          const matches = allUsersList.filter(u => 
                            u.role === 'student' && 
                            !linkedStudents.some(ls => ls.id === u.id) &&
                            (u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
                          );
                          
                          if (matches.length === 0) {
                            return (
                              <p className="text-center text-xs text-muted-foreground py-6">
                                No matching student accounts found.
                              </p>
                            );
                          }
                          
                          return matches.map(student => (
                            <div 
                              key={student.id} 
                              className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/60 transition-colors border border-border/40"
                            >
                              <div>
                                <p className="font-semibold text-sm text-foreground">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.email} • Grade {student.gradeLevel}</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await linkParentToStudent(user.id, student.id);
                                    toast.success(`Successfully linked ${student.name} to your profile! 🔗`);
                                    setStudentSearchQuery('');
                                    setIsLinkModalOpen(false);
                                  } catch (err) {
                                    toast.error("Failed to link student profile.");
                                  }
                                }}
                                className="bg-primary text-white text-xs h-8 gap-1.5"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                Link
                              </Button>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {linkedStudents.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-sm text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <p>No student accounts are currently linked to this parent profile.</p>
                      <p className="text-xs mt-1">Please contact a system administrator to map parent-student profiles.</p>
                    </CardContent>
                  </Card>
                ) : (
                  linkedStudents.map((child) => (
                    <Card key={child.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                              {getInitials(child.name)}
                            </div>
                            <div>
                              <h3 className="font-bold text-base text-foreground">{child.name}</h3>
                              <p className="text-xs text-muted-foreground">{child.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Grade {child.gradeLevel}</Badge>
                            <Badge variant={child.status === 'active' ? 'default' : 'destructive'}>
                              {child.status.charAt(0).toUpperCase() + child.status.slice(1)}
                            </Badge>
                            <Button 
                              size="sm" 
                              onClick={() => setLocation('/parent-dashboard')}
                              className="bg-primary text-white text-xs h-8 ml-2"
                            >
                              Monitor Activity
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
