import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockContentVersions, mockQuestions, ContentVersion } from '@/lib/mockData';
import { CheckCircle, Clock, Archive, Eye, Edit2, RotateCcw } from 'lucide-react';
import { saveContentVersionToDB } from '@/lib/dbSync';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function AdminContentManagement() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'versions' | 'approval' | 'calendar'>('versions');
  const [versions, setVersions] = useState(mockContentVersions);
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const totalPages = Math.ceil(versions.length / itemsPerPage);
  const paginatedVersions = versions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const pendingApprovals = mockQuestions.filter(q => q.id.includes('pending')).length;

  const handleApproveVersion = async (versionId: string) => {
    const target = versions.find(v => v.id === versionId);
    if (!target) return;
    const updated = { ...target, status: 'approved' as const };
    const success = await saveContentVersionToDB(updated);
    if (success) {
      setVersions(versions.map(v => v.id === versionId ? updated : v));
      toast.success('Content version approved successfully');
    } else {
      toast.error('Failed to approve content version');
    }
  };

  const handleRetireVersion = async (versionId: string) => {
    const target = versions.find(v => v.id === versionId);
    if (!target) return;
    const updated = { ...target, status: 'retired' as const };
    const success = await saveContentVersionToDB(updated);
    if (success) {
      setVersions(versions.map(v => v.id === versionId ? updated : v));
      toast.success('Content version retired successfully');
    } else {
      toast.error('Failed to retire content version');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="min-h-screen">
        {/* Banner Section */}
        <div className="relative h-48 md:h-56 bg-gradient-to-r from-chart-3/20 via-primary/20 to-accent/20 border-b border-border overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="contentGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="1200" height="300" fill="url(#contentGrid)" />
          </svg>
          
          <div className="container h-full flex items-center relative z-10">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Content Management 📚</h1>
              <p className="text-lg text-muted-foreground">Manage question versions, approvals, and content calendar</p>
            </div>
          </div>
        </div>

        <div className="container py-8 space-y-8 animate-slide-up">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 hover:shadow-lg transition-all duration-300 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Questions</p>
                    <p className="text-3xl font-bold text-primary">{mockQuestions.length}</p>
                  </div>
                  <Eye className="w-8 h-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 hover:shadow-lg transition-all duration-300 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Approvals</p>
                    <p className="text-3xl font-bold text-accent">{pendingApprovals}</p>
                  </div>
                  <Clock className="w-8 h-8 text-accent/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-chart-3/10 to-transparent border border-chart-3/20 hover:shadow-lg transition-all duration-300 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Versions</p>
                    <p className="text-3xl font-bold text-chart-3">{versions.length}</p>
                  </div>
                  <RotateCcw className="w-8 h-8 text-chart-3/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('versions')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'versions'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Version History
            </button>
            <button
              onClick={() => setActiveTab('approval')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'approval'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Approval Workflow
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'calendar'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Content Calendar
            </button>
          </div>

          {/* Version History Tab */}
          {activeTab === 'versions' && (
            <Card>
              <CardHeader>
                <CardTitle>Question Version History</CardTitle>
                <CardDescription>Track all versions of questions and their approval status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paginatedVersions.map((version) => (
                    <div key={version.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium">Question ID: {version.questionId}</p>
                          <p className="text-sm text-muted-foreground">Version {version.version}</p>
                          <p className="text-sm mt-2">{version.content}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
                          version.status === 'approved'
                            ? 'bg-success/15 text-success border-success/20'
                            : version.status === 'draft'
                            ? 'bg-warning/15 text-warning border-warning/20'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}>
                          {(version.status || '').charAt(0).toUpperCase() + (version.status || '').slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Created by {version.createdBy} on {new Date(version.createdAt).toLocaleDateString()}</span>
                        <div className="flex gap-2">
                          {version.status === 'draft' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveVersion(version.id)}
                                className="gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </Button>
                            </>
                          )}
                          {version.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetireVersion(version.id)}
                              className="gap-1"
                            >
                              <Archive className="w-3 h-3" />
                              Retire
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center pt-6 border-t border-border mt-6">
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
              </CardContent>
            </Card>
          )}

          {/* Approval Workflow Tab */}
          {activeTab === 'approval' && (
            <Card>
              <CardHeader>
                <CardTitle>Approval Workflow</CardTitle>
                <CardDescription>Review and approve pending questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">No pending approvals at this time</p>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-2">Approval Process</h4>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Content creator submits new question or version</li>
                      <li>Question enters "Draft" status</li>
                      <li>Admin reviews content for accuracy and clarity</li>
                      <li>Admin approves or requests changes</li>
                      <li>Approved questions become available for tests</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Calendar Tab */}
          {activeTab === 'calendar' && (
            <Card>
              <CardHeader>
                <CardTitle>Content Calendar</CardTitle>
                <CardDescription>Plan and schedule content releases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <p className="font-medium mb-2">📅 May 2026</p>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">May 15: Math Grade 9 Questions Released</p>
                        <p className="text-muted-foreground">May 20: Science Grade 8 Placement Test</p>
                        <p className="text-muted-foreground">May 25: English Grade 10 Content Update</p>
                      </div>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <p className="font-medium mb-2">📅 June 2026</p>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">June 5: History Grade 7 Questions</p>
                        <p className="text-muted-foreground">June 12: Math Grade 11 Advanced</p>
                        <p className="text-muted-foreground">June 20: Summer Review Tests</p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">Add Calendar Event</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
