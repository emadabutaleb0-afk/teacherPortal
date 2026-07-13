import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { mockFlaggedContent, mockCheatDetectionFlags } from '@/lib/mockData';
import { Flag, AlertTriangle, CheckCircle, Eye } from 'lucide-react';

export default function AdminModerationTools() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'flagged' | 'cheating'>('flagged');
  const [filterStatus, setFilterStatus] = useState('all-status');
  const [flaggedContent, setFlaggedContent] = useState(mockFlaggedContent);
  const [cheatFlags, setCheatFlags] = useState(mockCheatDetectionFlags);

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const filteredFlags = flaggedContent.filter(f =>
    filterStatus === 'all-status' || f.status === filterStatus
  );

  const handleResolveFlaggedContent = (flagId: string, resolution: string) => {
    setFlaggedContent(flaggedContent.map(f =>
      f.id === flagId ? { ...f, status: 'resolved', resolution } : f
    ));
  };

  const handleReviewCheatFlag = (flagId: string) => {
    setCheatFlags(cheatFlags.map(f =>
      f.id === flagId ? { ...f, status: 'reviewed' } : f
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="min-h-screen">
        {/* Banner Section */}
        <div className="relative h-48 md:h-56 bg-gradient-to-r from-destructive/10 via-warning/10 to-primary/10 border-b border-border overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="moderationGrid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="3" fill="currentColor" opacity="0.5" />
                <circle cx="40" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="1200" height="300" fill="url(#moderationGrid)" />
          </svg>
          
          <div className="container h-full flex items-center relative z-10">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Moderation Tools 🛡️</h1>
              <p className="text-lg text-muted-foreground">Monitor content, detect cheating, and manage violations</p>
            </div>
          </div>
        </div>

        <div className="container py-8 space-y-8 animate-slide-up">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-warning/10 to-transparent border-warning/20 hover:shadow-lg transition-all duration-300 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Flagged Content</p>
                    <p className="text-3xl font-bold text-warning">{flaggedContent.length}</p>
                  </div>
                  <Flag className="w-8 h-8 text-warning/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-destructive/10 to-transparent border-destructive/20 hover:shadow-lg transition-all duration-300 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cheating Flags</p>
                    <p className="text-3xl font-bold text-destructive">{cheatFlags.length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-destructive/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/20 hover:shadow-lg transition-all duration-300 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-3xl font-bold text-success">
                      {flaggedContent.filter(f => f.status === 'resolved').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-success/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('flagged')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'flagged'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Flagged Content
            </button>
            <button
              onClick={() => setActiveTab('cheating')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'cheating'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Cheating Detection
            </button>
          </div>

          {/* Flagged Content Tab */}
          {activeTab === 'flagged' && (
            <div className="space-y-6">
              {/* Filter */}
              <Card>
                <CardHeader>
                  <CardTitle>Filter Flags</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-status">All Status</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Flagged Content List */}
              <div className="space-y-4">
                {filteredFlags.map((flag) => (
                  <Card key={flag.id} className="border-l-4 border-l-warning">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">
                              {flag.contentType.charAt(0).toUpperCase() + flag.contentType.slice(1)}: {flag.contentId}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">Reason: {flag.reason}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Flagged by {flag.flaggedBy} on {new Date(flag.flaggedAt).toLocaleDateString()}
                          </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
                            flag.status === 'pending'
                              ? 'bg-warning/15 text-warning border-warning/20'
                              : flag.status === 'reviewed'
                              ? 'bg-primary/15 text-primary border-primary/20'
                              : 'bg-success/15 text-success border-success/20'
                          }`}>
                            {flag.status.charAt(0).toUpperCase() + flag.status.slice(1)}
                          </span>
                        </div>

                        {flag.resolution && (
                          <div className="p-3 bg-muted rounded">
                            <p className="text-sm font-medium">Resolution:</p>
                            <p className="text-sm text-muted-foreground">{flag.resolution}</p>
                          </div>
                        )}

                        {flag.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleResolveFlaggedContent(flag.id, 'Content approved - no issues found')}
                              className="gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleResolveFlaggedContent(flag.id, 'Content removed due to violation')}
                              className="gap-1"
                            >
                              <Flag className="w-3 h-3" />
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Cheating Detection Tab */}
          {activeTab === 'cheating' && (
            <div className="space-y-4">
              {cheatFlags.map((flag) => (
                <Card key={flag.id} className="border-l-4 border-l-destructive">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium">
                              Test {flag.testId} - Student {flag.studentId}
                            </p>
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${
                              flag.flagType === 'unusual_speed'
                                ? 'bg-warning/15 text-warning border-warning/20'
                                : 'bg-destructive/15 text-destructive border-destructive/20'
                            }`}>
                              {flag.flagType.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{flag.reasoning}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Flagged on {new Date(flag.flaggedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Confidence</p>
                          <p className="text-2xl font-bold text-destructive">{flag.confidenceScore}%</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReviewCheatFlag(flag.id)}
                          className="gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Investigate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
