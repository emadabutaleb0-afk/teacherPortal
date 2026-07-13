import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockPlatformSettings, PlatformSettings } from '@/lib/mockData';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPlatformSettings() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [settings, setSettings] = useState<PlatformSettings>(() => {
    const stored = localStorage.getItem('edupath_platform_settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return mockPlatformSettings;
  });
  const [hasChanges, setHasChanges] = useState(false);

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const handleSettingChange = (key: keyof PlatformSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('edupath_platform_settings', JSON.stringify(settings));
    Object.assign(mockPlatformSettings, settings);
    
    // Sync test defaults for the test creation page
    const defaults = {
      duration: settings.testDuration,
      questionCount: settings.testQuestionCount
    };
    localStorage.setItem('edupath_test_defaults', JSON.stringify(defaults));

    toast.success('Settings saved successfully! ⚙️');
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings(mockPlatformSettings);
    localStorage.removeItem('edupath_platform_settings');
    localStorage.removeItem('edupath_test_defaults');
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="min-h-screen">
        {/* Banner Section */}
        <div className="relative h-48 md:h-56 bg-gradient-to-r from-primary/20 via-chart-3/20 to-accent/20 border-b border-border overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="settingsGrid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <circle cx="25" cy="25" r="1" fill="currentColor" opacity="0.5" />
                <circle cx="25" cy="25" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="1200" height="300" fill="url(#settingsGrid)" />
          </svg>
          
          <div className="container h-full flex items-center relative z-10">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Platform Settings ⚙️</h1>
              <p className="text-lg text-muted-foreground">Configure test rules, scoring, and platform behavior</p>
            </div>
          </div>
        </div>

        <div className="container py-8 max-w-2xl space-y-8 animate-slide-up">
          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Default settings for all tests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Default Test Duration (minutes)</label>
                <Input
                  type="number"
                  value={settings.testDuration || ''}
                  onChange={(e) => handleSettingChange('testDuration', parseInt(e.target.value) || 0)}
                  className="max-w-xs"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Default Test Question Count</label>
                <Input
                  type="number"
                  value={settings.testQuestionCount || ''}
                  onChange={(e) => handleSettingChange('testQuestionCount', parseInt(e.target.value) || 0)}
                  className="max-w-xs"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Passing Threshold (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.passingThreshold}
                  onChange={(e) => handleSettingChange('passingThreshold', parseInt(e.target.value))}
                  className="max-w-xs"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Scoring Method</label>
                <Select value={settings.scoringMethod} onValueChange={(value) => handleSettingChange('scoringMethod', value as 'weighted' | 'equal')}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">Equal Points (All questions worth same)</SelectItem>
                    <SelectItem value="weighted">Weighted Points (By difficulty)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Retake Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Retake Policy</CardTitle>
              <CardDescription>Control how many times students can retake tests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="allowRetakes"
                  checked={settings.allowRetakes}
                  onChange={(e) => handleSettingChange('allowRetakes', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="allowRetakes" className="text-sm font-medium">
                  Allow Students to Retake Tests
                </label>
              </div>

              {settings.allowRetakes && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Maximum Retakes Allowed</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.retakesAllowed}
                    onChange={(e) => handleSettingChange('retakesAllowed', parseInt(e.target.value))}
                    className="max-w-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Answer Display */}
          <Card>
            <CardHeader>
              <CardTitle>Answer Display</CardTitle>
              <CardDescription>When and how to show answers to students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="showAnswers"
                  checked={settings.showAnswersAfterTest}
                  onChange={(e) => handleSettingChange('showAnswersAfterTest', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="showAnswers" className="text-sm font-medium">
                  Show Correct Answers After Test Completion
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Adaptive Features */}
          <Card>
            <CardHeader>
              <CardTitle>Adaptive Features</CardTitle>
              <CardDescription>Enable AI-powered adaptive testing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="adaptive"
                  checked={settings.enableAdaptiveDifficulty}
                  onChange={(e) => handleSettingChange('enableAdaptiveDifficulty', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="adaptive" className="text-sm font-medium">
                  Enable Adaptive Difficulty (Questions adjust based on performance)
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Grade Mapping */}
          <Card>
            <CardHeader>
              <CardTitle>Grade Level Mapping</CardTitle>
              <CardDescription>Configure grade level names and ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(settings.gradeMapping).map(([grade, label]) => (
                  <div key={grade} className="flex items-center gap-3">
                    <span className="text-sm font-medium min-w-12">Grade {grade}:</span>
                    <Input
                      value={label}
                      onChange={(e) => handleSettingChange('gradeMapping', {
                        ...settings.gradeMapping,
                        [grade]: e.target.value
                      })}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={!hasChanges}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          {hasChanges && (
            <div className="p-4 bg-warning/5 border border-warning/15 rounded-lg text-sm text-warning font-medium">
              You have unsaved changes. Click "Save Settings" to apply them.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
