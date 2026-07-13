import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockSystemLogs } from '@/lib/mockData';
import { Database, HardDrive, Activity, Download, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminSystemAdmin() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'logs' | 'backups' | 'performance'>('logs');
  const [systemLogs, setSystemLogs] = useState(mockSystemLogs);

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const errorCount = systemLogs.filter(l => l.level === 'error').length;
  const warningCount = systemLogs.filter(l => l.level === 'warning').length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="min-h-screen">
        {/* Banner Section */}
        <div className="relative h-48 md:h-56 bg-gradient-to-r from-muted/20 via-slate-500/10 to-accent/20 border-b border-border overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="sysGrid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="1200" height="300" fill="url(#sysGrid)" />
          </svg>
          
          <div className="container h-full flex items-center relative z-10">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">System Administration 🖥️</h1>
              <p className="text-lg text-muted-foreground">Logs, backups, performance monitoring, and system health</p>
            </div>
          </div>
        </div>

        <div className="container py-8 space-y-8 animate-slide-up">
          {/* System Health Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-success/10 to-transparent border border-success/20 hover:shadow-lg transition-all duration-300 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">System Status</p>
                    <p className="text-2xl font-bold text-success">Healthy</p>
                  </div>
                  <Activity className="w-8 h-8 text-success/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 hover:shadow-lg transition-all duration-300 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="text-2xl font-bold text-primary">99.9%</p>
                  </div>
                  <HardDrive className="w-8 h-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-warning/10 to-transparent border border-warning/20 hover:shadow-lg transition-all duration-300 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Warnings</p>
                    <p className="text-2xl font-bold text-warning">{warningCount}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-warning/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-destructive/10 to-transparent border border-destructive/20 hover:shadow-lg transition-all duration-300 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Errors</p>
                    <p className="text-2xl font-bold text-destructive">{errorCount}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-destructive/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'logs'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              System Logs
            </button>
            <button
              onClick={() => setActiveTab('backups')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'backups'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Backups
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'performance'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Performance
            </button>
          </div>

          {/* System Logs Tab */}
          {activeTab === 'logs' && (
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Recent system events and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemLogs.map((log) => (
                    <div key={log.id} className={`p-4 border rounded-lg ${
                      log.level === 'error' ? 'bg-destructive/5 border-destructive/15' :
                      log.level === 'warning' ? 'bg-warning/5 border-warning/15' :
                      'bg-primary/5 border-primary/15'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                              log.level === 'error' ? 'bg-destructive/15 text-destructive border-destructive/20' :
                              log.level === 'warning' ? 'bg-warning/15 text-warning border-warning/20' :
                              'bg-primary/15 text-primary border-primary/20'
                            }`}>
                              {log.level.toUpperCase()}
                            </span>
                          </div>
                          <p className="font-medium">{log.message}</p>
                          {log.details && (
                            <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Backups Tab */}
          {activeTab === 'backups' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Database Backups</CardTitle>
                  <CardDescription>Manage and restore database backups</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Button className="gap-2">
                      <Database className="w-4 h-4" />
                      Create Backup Now
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Restore Backup
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">Backup - May 10, 2026</p>
                          <p className="text-sm text-muted-foreground">Size: 2.3 GB</p>
                        </div>
                        <span className="text-xs bg-success/15 text-success border border-success/20 px-2 py-1 rounded font-semibold">
                          Complete
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Download className="w-3 h-3" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">Restore</Button>
                      </div>
                    </div>

                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">Backup - May 9, 2026</p>
                          <p className="text-sm text-muted-foreground">Size: 2.2 GB</p>
                        </div>
                        <span className="text-xs bg-success/15 text-success border border-success/20 px-2 py-1 rounded font-semibold">
                          Complete
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Download className="w-3 h-3" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">Restore</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Server Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">CPU Usage</span>
                        <span className="text-sm font-medium">42%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '42%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Memory Usage</span>
                        <span className="text-sm font-medium">68%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-warning h-2 rounded-full" style={{ width: '68%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Disk Usage</span>
                        <span className="text-sm font-medium">55%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-success h-2 rounded-full" style={{ width: '55%' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Database Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Query Performance</p>
                      <p className="text-2xl font-bold">45ms</p>
                      <p className="text-xs text-success mt-1">✓ Optimal</p>
                    </div>

                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Connection Pool</p>
                      <p className="text-2xl font-bold">24/50</p>
                      <p className="text-xs text-muted-foreground mt-1">Active connections</p>
                    </div>

                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Replication Lag</p>
                      <p className="text-2xl font-bold">0.2s</p>
                      <p className="text-xs text-success mt-1">✓ Healthy</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-success">✓</span>
                      <span>System is running optimally</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-warning">⚠</span>
                      <span>Memory usage approaching 70% - consider scaling up in next 2 weeks</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-success">✓</span>
                      <span>Database performance is excellent</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
