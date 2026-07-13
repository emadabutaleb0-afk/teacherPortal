import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Mail, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Report {
  id: string;
  period: string;
  studentName: string;
  summary: string;
  highlights: string[];
  areasOfConcern: string[];
  suggestions: string[];
  generatedAt: string;
}

export default function AIParentReportSummarizer() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  
  // Preferences States
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [monthlyReports, setMonthlyReports] = useState(true);
  const [alertNotifications, setAlertNotifications] = useState(true);

  const reports: Report[] = [
    {
      id: 'report-1',
      period: 'Week of May 5-11, 2026',
      studentName: 'Alex Johnson',
      summary: 'Alex had a productive week with solid progress in Math and English. He completed 4 practice tests with an average score of 76%. While his performance is generally positive, we\'ve identified some areas that need attention, particularly in word problems and essay writing structure.',
      highlights: [
        'Improved Math score from 72% to 78% over the week',
        'Completed all assigned practice tests on time',
        'Strong performance in grammar and punctuation (85%)',
        'Consistent daily practice schedule maintained',
      ],
      areasOfConcern: [
        'Word problems remain challenging (65% pass rate)',
        'Essay introductions need stronger thesis statements',
        'Time management during longer tests',
      ],
      suggestions: [
        'Practice 2-3 word problems daily using the Study Assistant',
        'Review essay structure guide before next writing assignment',
        'Try the Adaptive Test Generator to focus on weak areas',
        'Consider scheduling a tutoring session for word problems',
      ],
      generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'report-2',
      period: 'April 2026',
      studentName: 'Alex Johnson',
      summary: 'April was a month of steady improvement for Alex. Overall test performance increased by 8% compared to March. Alex showed particular strength in reading comprehension and demonstrated improved focus during longer tests. The combination of consistent practice and targeted study sessions has paid off.',
      highlights: [
        'Overall average score improved from 71% to 79%',
        'Reading comprehension score reached 88% (highest this year)',
        'Completed 15 practice tests throughout the month',
        'Demonstrated improved time management skills',
        'Maintained a 7-day study streak',
      ],
      areasOfConcern: [
        'Science topics still need reinforcement',
        'Occasional careless mistakes in Math calculations',
        'Could benefit from more practice with complex sentences',
      ],
      suggestions: [
        'Continue current study routine - it\'s working well',
        'Add 2-3 Science practice sessions per week',
        'Use the Study Assistant to review Science concepts',
        'Practice proofreading techniques to catch calculation errors',
        'Consider advanced reading comprehension materials',
      ],
      generatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const currentReport = selectedReport || reports[0];

  const handleExportPDF = () => {
    window.print();
    toast.success('Opening print layout for report PDF... 🖨️');
  };

  const handleEmailReport = () => {
    toast.success(`Report for ${currentReport.studentName} has been successfully sent to your email! 📧`);
  };

  const handleSavePreferences = () => {
    setShowPreferencesDialog(false);
    toast.success('Preferences saved successfully! ✨');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
        <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">AI Parent Report Summarizer</h1>
          </div>
          <p className="text-muted-foreground">Plain-language summaries of your child's learning progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Report List */}
          <div className="lg:col-span-1">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-base">Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {reports.map(report => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentReport.id === report.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    <p className="font-medium text-sm">{report.period}</p>
                    <p className="text-xs opacity-75 mt-1">{report.studentName}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Report Header */}
            <Card className="hover-lift">
              <CardHeader className="border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{currentReport.period}</CardTitle>
                    <CardDescription>Report for {currentReport.studentName}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF}>
                      <Download className="w-4 h-4" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleEmailReport}>
                      <Mail className="w-4 h-4" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-foreground leading-relaxed">{currentReport.summary}</p>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="highlights" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
                <TabsTrigger value="highlights">Highlights</TabsTrigger>
                <TabsTrigger value="concerns">Areas of Concern</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              </TabsList>

              {/* Highlights Tab */}
              <TabsContent value="highlights" className="animate-fadeIn">
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      What's Going Well
                    </CardTitle>
                    <CardDescription>Positive developments and achievements this period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {currentReport.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex gap-3 p-3 bg-green-50 rounded-lg animate-slideInRight" style={{ animationDelay: `${idx * 100}ms` }}>
                          <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                          <span className="text-foreground">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Concerns Tab */}
              <TabsContent value="concerns" className="animate-fadeIn">
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      Areas That Need Attention
                    </CardTitle>
                    <CardDescription>Topics or skills where your child could use extra support</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {currentReport.areasOfConcern.map((concern, idx) => (
                        <li key={idx} className="flex gap-3 p-3 bg-amber-50 rounded-lg animate-slideInRight" style={{ animationDelay: `${idx * 100}ms` }}>
                          <span className="text-amber-600 font-bold flex-shrink-0">!</span>
                          <span className="text-foreground">{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Suggestions Tab */}
              <TabsContent value="suggestions" className="animate-fadeIn">
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      How You Can Help
                    </CardTitle>
                    <CardDescription>Practical suggestions to support your child's learning</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {currentReport.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex gap-3 p-3 bg-primary/10 rounded-lg animate-slideInRight" style={{ animationDelay: `${idx * 100}ms` }}>
                          <span className="text-primary font-bold flex-shrink-0">{idx + 1}.</span>
                          <span className="text-foreground">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Email Preferences */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-base">Email Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Weekly Reports</p>
                    <p className="text-sm text-muted-foreground">Get a summary every Sunday</p>
                  </div>
                  <Badge variant="outline" className={weeklyReports ? "bg-green-50 text-green-800 border-green-200" : "bg-gray-50 text-gray-800 border-gray-200"}>
                    {weeklyReports ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="font-medium text-foreground">Monthly Reports</p>
                    <p className="text-sm text-muted-foreground">Get a detailed summary on the 1st of each month</p>
                  </div>
                  <Badge variant="outline" className={monthlyReports ? "bg-green-50 text-green-800 border-green-200" : "bg-gray-50 text-gray-800 border-gray-200"}>
                    {monthlyReports ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="font-medium text-foreground">Alert Notifications</p>
                    <p className="text-sm text-muted-foreground">Get notified when significant changes occur</p>
                  </div>
                  <Badge variant="outline" className={alertNotifications ? "bg-green-50 text-green-800 border-green-200" : "bg-gray-50 text-gray-800 border-gray-200"}>
                    {alertNotifications ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <Button variant="outline" className="w-full mt-4 bg-gradient-to-r from-secondary to-secondary/80" onClick={() => setShowPreferencesDialog(true)}>
                  Manage Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </main>

      {/* Preferences Dialog */}
      <Dialog open={showPreferencesDialog} onOpenChange={setShowPreferencesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Email Preferences</DialogTitle>
            <DialogDescription>
              Toggle how and when you want to receive AI-generated student progress reports.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="weekly-toggle" className="flex flex-col space-y-1">
                <span className="font-semibold">Weekly Reports</span>
                <span className="text-xs text-muted-foreground">Sent every Sunday morning.</span>
              </Label>
              <Switch id="weekly-toggle" checked={weeklyReports} onCheckedChange={setWeeklyReports} />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="monthly-toggle" className="flex flex-col space-y-1">
                <span className="font-semibold">Monthly Reports</span>
                <span className="text-xs text-muted-foreground">Sent on the 1st of each month.</span>
              </Label>
              <Switch id="monthly-toggle" checked={monthlyReports} onCheckedChange={setMonthlyReports} />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="alerts-toggle" className="flex flex-col space-y-1">
                <span className="font-semibold">Alert Notifications</span>
                <span className="text-xs text-muted-foreground">Get instant notifications on performance anomalies.</span>
              </Label>
              <Switch id="alerts-toggle" checked={alertNotifications} onCheckedChange={setAlertNotifications} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreferencesDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePreferences} className="bg-gradient-to-r from-primary to-primary/80">Save Preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
