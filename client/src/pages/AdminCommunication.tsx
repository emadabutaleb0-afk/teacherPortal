import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, MessageSquare, Mail, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCommunication() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'broadcast' | 'announcements' | 'emails'>('broadcast');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('all-users');
  const [broadcasts, setBroadcasts] = useState([
    { id: 1, title: 'System Maintenance', content: 'Scheduled maintenance on May 15', date: new Date('2026-05-10'), audience: 'All Users', status: 'sent' },
    { id: 2, title: 'New Feature Released', content: 'Check out our new AI Study Assistant', date: new Date('2026-05-08'), audience: 'Students', status: 'sent' },
  ]);

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const handleSendBroadcast = () => {
    if (messageTitle && messageContent) {
      setBroadcasts([
        ...broadcasts,
        {
          id: broadcasts.length + 1,
          title: messageTitle,
          content: messageContent,
          date: new Date(),
          audience: targetAudience === 'all-users' ? 'All Users' : targetAudience === 'students' ? 'Students' : 'Parents',
          status: 'sent'
        }
      ]);
      setMessageTitle('');
      setMessageContent('');
      toast.success('Broadcast sent successfully! 📢');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="min-h-screen">
        {/* Banner Section */}
        <div className="relative h-48 md:h-56 bg-gradient-to-r from-primary/10 via-accent/15 to-destructive/10 border-b border-border overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="commGrid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <circle cx="25" cy="25" r="2" fill="currentColor" opacity="0.5" />
                <line x1="25" y1="0" x2="25" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                <line x1="0" y1="25" x2="50" y2="25" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="1200" height="300" fill="url(#commGrid)" />
          </svg>
          
          <div className="container h-full flex items-center relative z-10">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Communication Tools 📢</h1>
              <p className="text-lg text-muted-foreground">Send broadcasts, announcements, and email campaigns</p>
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
                    <p className="text-sm text-muted-foreground">Messages Sent</p>
                    <p className="text-3xl font-bold text-primary">1,247</p>
                  </div>
                  <Send className="w-8 h-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 hover:shadow-lg transition-all duration-300 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    <p className="text-3xl font-bold text-accent">8</p>
                  </div>
                  <Mail className="w-8 h-8 text-accent/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-chart-5/10 to-transparent border border-chart-5/20 hover:shadow-lg transition-all duration-300 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open Rate</p>
                    <p className="text-3xl font-bold text-chart-5">64%</p>
                  </div>
                  <Bell className="w-8 h-8 text-chart-5/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'broadcast'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Send Broadcast
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'announcements'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Announcements
            </button>
            <button
              onClick={() => setActiveTab('emails')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'emails'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Email Campaigns
            </button>
          </div>

          {/* Send Broadcast Tab */}
          {activeTab === 'broadcast' && (
            <Card>
              <CardHeader>
                <CardTitle>Send In-App Broadcast</CardTitle>
                <CardDescription>Send messages to users in the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Target Audience</label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-users">All Users</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="parents">Parents Only</SelectItem>
                      <SelectItem value="grade-specific">Specific Grade Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message Title</label>
                  <Input
                    placeholder="Enter message title"
                    value={messageTitle}
                    onChange={(e) => setMessageTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message Content</label>
                  <textarea
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={6}
                    placeholder="Enter your message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSendBroadcast} className="gap-2">
                    <Send className="w-4 h-4" />
                    Send Broadcast
                  </Button>
                  <Button variant="outline">Schedule for Later</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              {broadcasts.map((broadcast) => (
                <Card key={broadcast.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{broadcast.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{broadcast.content}</p>
                        <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
                          <span>📍 {broadcast.audience}</span>
                          <span>📅 {broadcast.date.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-success/15 text-success border-success/20">
                        {broadcast.status.charAt(0).toUpperCase() + broadcast.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">View Analytics</Button>
                      <Button size="sm" variant="destructive">Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Email Campaigns Tab */}
          {activeTab === 'emails' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Email Campaign</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Campaign Type</label>
                    <Select defaultValue="weekly-report">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly-report">Weekly Progress Report</SelectItem>
                        <SelectItem value="achievement">Achievement Notification</SelectItem>
                        <SelectItem value="reminder">Test Reminder</SelectItem>
                        <SelectItem value="custom">Custom Campaign</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Recipients</label>
                    <Select defaultValue="all-parents">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-parents">All Parents</SelectItem>
                        <SelectItem value="active-parents">Active Parents Only</SelectItem>
                        <SelectItem value="low-performers">Parents of Low Performers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Schedule</label>
                    <Select defaultValue="immediate">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Send Immediately</SelectItem>
                        <SelectItem value="weekly-monday">Every Monday at 9 AM</SelectItem>
                        <SelectItem value="weekly-friday">Every Friday at 5 PM</SelectItem>
                        <SelectItem value="monthly">Monthly on 1st</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="gap-2">
                    <Mail className="w-4 h-4" />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Weekly Progress Reports', recipients: 342, rate: '68%' },
                    { name: 'Achievement Notifications', recipients: 156, rate: '72%' },
                    { name: 'Test Reminders', recipients: 298, rate: '45%' },
                  ].map((campaign, i) => (
                    <div key={i} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{campaign.name}</p>
                        <span className="text-sm text-muted-foreground">{campaign.recipients} recipients</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Open Rate</div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div className="bg-success h-2 rounded-full" style={{ width: campaign.rate }} />
                          </div>
                          <span className="text-sm font-medium">{campaign.rate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
