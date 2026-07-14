import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { toast } from 'sonner';
import { Settings, Bell, Shield, Palette, CheckCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function StudentSettings() {
  const { theme, toggleTheme } = useTheme();

  // Notification Preferences
  const [testReminders, setTestReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [weeklyDigests, setWeeklyDigests] = useState(false);

  // Privacy & Account Preferences
  const [publicProfile, setPublicProfile] = useState(true);
  const [showRankings, setShowRankings] = useState(true);

  const handleSave = () => {
    toast.success('Settings saved successfully! ✨');
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />
      <main className="container max-w-3xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fadeIn">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
        </div>

        {/* Preferences Card - Theme */}
        <Card className="hover-lift animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Theme & Appearance
            </CardTitle>
            <CardDescription>Customize how EduPath looks on your screen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Dark Theme</p>
                <p className="text-sm text-muted-foreground">Toggle between light and dark modes</p>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>

            {/* Live Theme Preview Card */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Live Preview</span>
              <div className={`p-4 border rounded-xl transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-slate-800 text-white' 
                  : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-bold text-primary uppercase tracking-wider">Mathematics</p>
                    <h4 className="text-sm font-bold mt-0.5">Algebra Placement Assessment</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Active
                  </span>
                </div>
                <div className="mt-3 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">15 Questions</span>
                  <span className="font-semibold text-primary">Level 8</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Card - Notifications */}
        <Card className="hover-lift animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Choose what updates you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="reminders-toggle" className="flex flex-col space-y-1">
                <span className="font-semibold">Test Reminders</span>
                <span className="text-xs text-muted-foreground">Remind me of scheduled practice tests.</span>
              </Label>
              <Switch id="reminders-toggle" checked={testReminders} onCheckedChange={setTestReminders} />
            </div>
            <div className="flex items-center justify-between space-x-2 pt-4 border-t border-border/40">
              <Label htmlFor="streaks-toggle" className="flex flex-col space-y-1">
                <span className="font-semibold">Streak Alerts</span>
                <span className="text-xs text-muted-foreground">Keep my study streaks alive with reminders.</span>
              </Label>
              <Switch id="streaks-toggle" checked={streakAlerts} onCheckedChange={setStreakAlerts} />
            </div>
            <div className="flex items-center justify-between space-x-2 pt-4 border-t border-border/40">
              <Label htmlFor="weekly-toggle" className="flex flex-col space-y-1">
                <span className="font-semibold">Weekly Digests</span>
                <span className="text-xs text-muted-foreground">Receive weekly summary of performance trends.</span>
              </Label>
              <Switch id="weekly-toggle" checked={weeklyDigests} onCheckedChange={setWeeklyDigests} />
            </div>
          </CardContent>
        </Card>

        {/* Preferences Card - Privacy */}
        <Card className="hover-lift animate-fadeInUp" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Manage your public visibility and data settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="public-toggle" className="flex flex-col space-y-1">
                <span className="font-semibold">Public Profile</span>
                <span className="text-xs text-muted-foreground">Allow teachers and parents to view my completed test portfolio.</span>
              </Label>
              <Switch id="public-toggle" checked={publicProfile} onCheckedChange={setPublicProfile} />
            </div>
            <div className="flex items-center justify-between space-x-2 pt-4 border-t border-border/40">
              <Label htmlFor="rankings-toggle" className="flex flex-col space-y-1">
                <span className="font-semibold">Show on Leaderboards</span>
                <span className="text-xs text-muted-foreground">Show my username and grade rank on the leaderboard.</span>
              </Label>
              <Switch id="rankings-toggle" checked={showRankings} onCheckedChange={setShowRankings} />
            </div>
          </CardContent>
          <CardFooter className="pt-6 border-t border-border/40 flex justify-end">
            <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-primary/80 gap-2 hover-lift">
              <CheckCircle className="w-4 h-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
