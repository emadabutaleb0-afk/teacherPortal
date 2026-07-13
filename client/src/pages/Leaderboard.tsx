import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Zap, Star, Medal, ArrowLeft } from 'lucide-react';
import { mockLeaderboard, mockAchievements, mockStudentStats } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function Leaderboard() {
  const { user } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const currentUserId = user?.id || 'student-001';

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGrade]);

  const filteredLeaderboard = selectedGrade
    ? mockLeaderboard.filter(entry => entry.gradeLevel === selectedGrade)
    : mockLeaderboard;

  const totalPages = Math.ceil(filteredLeaderboard.length / itemsPerPage);
  const paginatedLeaderboard = filteredLeaderboard.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const showPodium = currentPage === 1;
  const listLeaderboard = showPodium 
    ? paginatedLeaderboard.filter(entry => entry.rank > 3)
    : paginatedLeaderboard;

  const podiumEntries = filteredLeaderboard.slice(0, 3);
  const rank1 = podiumEntries.find(e => e.rank === 1);
  const rank2 = podiumEntries.find(e => e.rank === 2);
  const rank3 = podiumEntries.find(e => e.rank === 3);

  const grades = Array.from(new Set(mockLeaderboard.map(entry => entry.gradeLevel))).sort();

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-muted text-muted-foreground border-border';
      case 'rare':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'epic':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'legendary':
        return 'bg-warning/15 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-warning" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-700" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-6xl py-8 space-y-6">
        {/* Header */}
        <div className="mb-4 animate-fadeIn">
          <h1 className="text-4xl font-bold text-foreground mb-1">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank among your peers</p>
        </div>

        <Tabs defaultValue="rankings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="rankings" className="rounded-lg">Rankings</TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-lg">Achievements</TabsTrigger>
            <TabsTrigger value="stats" className="rounded-lg">My Stats</TabsTrigger>
          </TabsList>

          {/* Rankings Tab */}
          <TabsContent value="rankings" className="space-y-6 animate-fadeIn">
            {/* Grade Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedGrade(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedGrade === null
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                All Grades
              </button>
              {grades.map(grade => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedGrade === grade
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Grade {grade}
                </button>
              ))}
            </div>

            {/* 3D Podium (Only on page 1) */}
            {showPodium && podiumEntries.length > 0 && (
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto items-end pt-10 pb-6 px-4">
                {/* Rank 2 */}
                {rank2 ? (
                  <div className="flex flex-col items-center space-y-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <div className="text-center min-w-0 w-full px-1">
                      <p className={`font-semibold text-sm truncate ${rank2.studentId === currentUserId ? 'text-primary font-bold' : ''}`}>
                        {rank2.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground">{rank2.totalXp} XP</p>
                    </div>
                    <div className={`w-full bg-secondary/35 dark:bg-card border-2 rounded-t-2xl h-28 flex flex-col items-center justify-between py-4 shadow-sm relative group hover-lift transition-all ${
                      rank2.studentId === currentUserId 
                        ? 'border-primary shadow-lg shadow-primary/5 ring-2 ring-primary/15' 
                        : 'border-slate-400/40'
                    }`}>
                      <div className="absolute -top-5 w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-400 font-bold text-sm text-slate-700 dark:text-slate-200">
                        2
                      </div>
                      <div className="mt-4 flex flex-col items-center">
                        <Medal className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-[11px] font-semibold text-muted-foreground mt-2">Lvl {rank2.level}</span>
                      </div>
                      <p className="text-xs font-bold text-primary">{rank2.averageScore}%</p>
                    </div>
                  </div>
                ) : <div />}

                {/* Rank 1 */}
                {rank1 ? (
                  <div className="flex flex-col items-center space-y-3 animate-slide-up" style={{ animationDelay: '0ms' }}>
                    <div className="text-center min-w-0 w-full px-1">
                      <p className={`font-bold text-sm sm:text-base truncate text-warning dark:text-yellow-500 ${rank1.studentId === currentUserId ? 'ring-2 ring-primary/10 rounded-md py-0.5' : ''}`}>
                        {rank1.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground">{rank1.totalXp} XP</p>
                    </div>
                    <div className={`w-full bg-warning/5 dark:bg-card border-2 rounded-t-2xl h-36 flex flex-col items-center justify-between py-4 shadow-lg relative group hover-lift transition-all ${
                      rank1.studentId === currentUserId 
                        ? 'border-primary shadow-yellow-500/10 ring-4 ring-primary/20' 
                        : 'border-warning dark:border-yellow-500 shadow-warning/5 dark:shadow-yellow-500/5'
                    }`}>
                      <div className="absolute -top-7 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-warning flex items-center justify-center border-2 border-warning dark:border-yellow-500 shadow-md font-bold text-lg text-yellow-950">
                        👑
                      </div>
                      <div className="mt-3 flex flex-col items-center">
                        <Trophy className="w-10 h-10 text-warning dark:text-yellow-500 group-hover:scale-110 transition-transform duration-300 animate-pulse" />
                        <span className="text-xs font-bold text-muted-foreground mt-2">Lvl {rank1.level}</span>
                      </div>
                      <p className="text-sm font-black text-warning dark:text-yellow-400">{rank1.averageScore}%</p>
                    </div>
                  </div>
                ) : <div />}

                {/* Rank 3 */}
                {rank3 ? (
                  <div className="flex flex-col items-center space-y-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <div className="text-center min-w-0 w-full px-1">
                      <p className={`font-semibold text-sm truncate ${rank3.studentId === currentUserId ? 'text-primary font-bold' : ''}`}>
                        {rank3.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground">{rank3.totalXp} XP</p>
                    </div>
                    <div className={`w-full bg-secondary/35 dark:bg-card border-2 rounded-t-2xl h-24 flex flex-col items-center justify-between py-4 shadow-sm relative group hover-lift transition-all ${
                      rank3.studentId === currentUserId 
                        ? 'border-primary shadow-lg shadow-primary/5 ring-2 ring-primary/15' 
                        : 'border-amber-700/35'
                    }`}>
                      <div className="absolute -top-5 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center border-2 border-amber-700 font-bold text-sm text-amber-900 dark:text-amber-300">
                        3
                      </div>
                      <div className="mt-3 flex flex-col items-center">
                        <Medal className="w-8 h-8 text-amber-700 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-[11px] font-semibold text-muted-foreground mt-2">Lvl {rank3.level}</span>
                      </div>
                      <p className="text-xs font-bold text-primary">{rank3.averageScore}%</p>
                    </div>
                  </div>
                ) : <div />}
              </div>
            )}

            {/* Leaderboard Table / List */}
            <div className="space-y-3">
              {listLeaderboard.map((entry) => {
                const isCurrentUser = entry.studentId === currentUserId;
                return (
                  <div
                    key={entry.studentId}
                    className={`group bg-card border rounded-xl p-4 hover:shadow-md transition-all duration-300 hover-lift ${
                      isCurrentUser
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/5 ring-2 ring-primary/10 animate-pulse-subtle'
                        : 'border-border/60 hover:border-primary/25'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg border ${
                        isCurrentUser 
                          ? 'bg-primary/20 border-primary/25' 
                          : 'bg-secondary/40 border-border/40'
                      }`}>
                        {getMedalIcon(entry.rank)}
                      </div>

                      {/* Student Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-foreground truncate ${isCurrentUser ? 'text-primary font-bold' : ''}`}>
                          {entry.studentName}
                          {isCurrentUser && <span className="ml-2 text-xs font-normal text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/15">You</span>}
                        </h3>
                        <p className="text-xs text-muted-foreground">Grade {entry.gradeLevel}</p>
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-base font-bold text-foreground/90">{entry.level}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Level</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base font-bold text-foreground/90">{entry.totalXp}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">XP</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base font-bold text-foreground/90">{entry.averageScore}%</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Avg Score</div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-lg">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{entry.streak}</span>
                        </div>
                      </div>

                      {/* Mobile Stats */}
                      <div className="sm:hidden flex flex-col items-end gap-1">
                        <div className="text-sm font-bold text-primary">Lvl {entry.level}</div>
                        <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-md">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">{entry.streak}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center pt-6 mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.max(1, p - 1));
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`hover-lift transition-all border-2 ${
                    achievement.unlockedAt 
                      ? 'border-primary/20 dark:border-primary/10 bg-gradient-to-br from-primary/5 to-transparent' 
                      : 'border-border/60 opacity-60 bg-muted/10'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl">{achievement.icon}</div>
                      <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{achievement.name}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed mt-1">{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {achievement.unlockedAt ? (
                      <p className="text-xs text-muted-foreground">
                        Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground font-medium">Locked 🔒</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Level Progress */}
              <Card className="hover-lift border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5 text-primary" />
                    Level Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-sm">Level {mockStudentStats.level.level}</span>
                      <span className="text-xs text-muted-foreground">
                        {mockStudentStats.level.xp} / {mockStudentStats.level.nextLevelXp} XP
                      </span>
                    </div>
                    <div className="w-full bg-secondary/60 rounded-full h-3 overflow-hidden border border-border/40">
                      <div
                        className="bg-gradient-to-r from-primary to-indigo-500 h-full transition-all duration-500"
                        style={{
                          width: `${(mockStudentStats.level.xp / mockStudentStats.level.nextLevelXp) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Total Accumulated XP: {mockStudentStats.level.totalXp} XP
                  </div>
                </CardContent>
              </Card>

              {/* Streak Stats */}
              <Card className="hover-lift border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Streak Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex justify-between items-center bg-orange-500/5 border border-orange-500/10 rounded-xl p-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Current Streak</p>
                      <p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">{mockStudentStats.streak.currentStreak} Days</p>
                    </div>
                    <Flame className="w-8 h-8 text-orange-500 animate-bounce" />
                  </div>
                  <div className="flex justify-between items-center bg-primary/5 border border-primary/10 rounded-xl p-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Longest Streak</p>
                      <p className="text-2xl font-bold text-primary">{mockStudentStats.streak.longestStreak} Days</p>
                    </div>
                    <Zap className="w-7 h-7 text-primary" />
                  </div>
                </CardContent>
              </Card>

              {/* Subject Mastery */}
              <Card className="lg:col-span-2 hover-lift border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg">Subject Mastery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(mockStudentStats.subjectMastery).map(([subject, percentage]) => (
                    <div key={subject}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-sm">{subject}</span>
                        <span className="text-primary font-bold text-sm">{percentage}%</span>
                      </div>
                      <div className="w-full bg-secondary/60 rounded-full h-2 overflow-hidden border border-border/40">
                        <div
                          className="bg-gradient-to-r from-primary to-indigo-500 h-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
