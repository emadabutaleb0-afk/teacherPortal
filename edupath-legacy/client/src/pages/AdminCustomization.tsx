import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Copy, Eye, RefreshCw, Palette, Key, Zap,
  Laptop, Smartphone, Save, Globe, UploadCloud, FileText, CheckCircle 
} from 'lucide-react';

export default function AdminCustomization() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'branding' | 'theme' | 'api' | 'editor'>('editor');
  const [platformName, setPlatformName] = useState('EduPath');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [secondaryColor, setSecondaryColor] = useState('#10b981');
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production API Key', key: 'pk_live_abc123def456', created: '2026-01-15', lastUsed: '2026-05-10', status: 'active' },
    { id: 2, name: 'Development API Key', key: 'pk_test_xyz789uvw012', created: '2026-02-01', lastUsed: '2026-05-09', status: 'active' },
  ]);

  const [customs, setCustoms] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    fetch('/api/customization')
      .then(res => res.json())
      .then(data => {
        setCustoms(data);
        if (data.platform_name) {
          setPlatformName(data.platform_name);
        }
      })
      .catch(err => console.error('Error fetching customizations:', err));
  }, []);

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const handleCustomChange = (key: string, value: string) => {
    setCustoms(prev => ({ ...prev, [key]: value }));
    if (key === 'platform_name') {
      setPlatformName(value);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Max size is 5MB.');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      handleCustomChange(key, base64String);
      setIsUploadingImage(false);
      toast.success('Image loaded successfully for preview!');
    };
    reader.onerror = () => {
      setIsUploadingImage(false);
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCustoms = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/customization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customs)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Website customizations saved successfully!');
      } else {
        toast.error('Failed to save customizations');
      }
    } catch (err) {
      console.error('Error saving customization:', err);
      toast.error('Failed to connect to server');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAPIKey = () => {
    toast.success('New API key generated successfully!');
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="min-h-screen">
        {/* Banner Section */}
        <div className="relative h-48 md:h-56 bg-gradient-to-r from-primary/10 via-accent/10 to-chart-1/10 border-b border-border overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="customGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <rect x="10" y="10" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="1200" height="300" fill="url(#customGrid)" />
          </svg>
          
          <div className="container h-full flex items-center relative z-10">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Customization & API 🎨</h1>
              <p className="text-lg text-muted-foreground">White-label, branding, theme, and API management</p>
            </div>
          </div>
        </div>

        <div className="container py-8 space-y-8 animate-slide-up">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border overflow-x-auto font-sans">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 font-semibold border-b-2 transition-all whitespace-nowrap text-sm ${
                activeTab === 'editor'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Page Content Editor 🖥️
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm ${
                activeTab === 'branding'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Branding
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'theme'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Theme
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'api'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              API Keys
            </button>
          </div>

          {/* Page Content Editor Tab */}
          {activeTab === 'editor' && (
            <div className="grid lg:grid-cols-12 gap-8 animate-fadeIn font-sans">
              {/* Left panel: Controls */}
              <div className="lg:col-span-6 space-y-6">
                <Card className="shadow-lg border-border">
                  <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-transparent">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" /> Visual Website Editor
                    </CardTitle>
                    <CardDescription>
                      Customize the homepage text, stats, layouts, and graphics directly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    {/* General branding */}
                    <div className="border-b border-border pb-4 space-y-4">
                      <h3 className="font-bold text-sm text-primary uppercase tracking-wider">General Branding</h3>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold">Brand / Platform Name</label>
                        <Input 
                          value={customs.platform_name || ''} 
                          onChange={(e) => handleCustomChange('platform_name', e.target.value)}
                          placeholder="e.g. EduPath"
                        />
                      </div>
                    </div>

                    {/* Hero section customization */}
                    <div className="border-b border-border pb-4 space-y-4">
                      <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Hero Section</h3>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold">Show Diagnostic Assessment Badge</label>
                        <Select 
                          value={customs.landing_show_diagnostic !== 'false' ? 'true' : 'false'} 
                          onValueChange={(val) => handleCustomChange('landing_show_diagnostic', val)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Show</SelectItem>
                            <SelectItem value="false">Hide</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {customs.landing_show_diagnostic !== 'false' && (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">Diagnostic Badge Text</label>
                          <Input 
                            value={customs.landing_hero_badge || ''} 
                            onChange={(e) => handleCustomChange('landing_hero_badge', e.target.value)}
                            placeholder="e.g. 📝 Try Our Free AI Smart-Guidance Assessment →"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-xs font-semibold">Hero Main Title Prefix</label>
                        <Input 
                          value={customs.landing_hero_title || ''} 
                          onChange={(e) => handleCustomChange('landing_hero_title', e.target.value)}
                          placeholder="e.g. Master Your Learning with"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold">Hero Main Title Span (Colored text)</label>
                        <Input 
                          value={customs.landing_hero_span || ''} 
                          onChange={(e) => handleCustomChange('landing_hero_span', e.target.value)}
                          placeholder="e.g. EduPath"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold">Hero Description / Subtitle</label>
                        <textarea
                          className="w-full p-2 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          rows={3}
                          value={customs.landing_hero_desc || ''} 
                          onChange={(e) => handleCustomChange('landing_hero_desc', e.target.value)}
                          placeholder="Hero description text..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">Primary CTA Button</label>
                          <Input 
                            value={customs.landing_hero_cta_primary || ''} 
                            onChange={(e) => handleCustomChange('landing_hero_cta_primary', e.target.value)}
                            placeholder="e.g. Take Free AI Assessment"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">Secondary CTA Button</label>
                          <Input 
                            value={customs.landing_hero_cta_secondary || ''} 
                            onChange={(e) => handleCustomChange('landing_hero_cta_secondary', e.target.value)}
                            placeholder="e.g. Sign Up"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stats Banner customization */}
                    <div className="border-b border-border pb-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Stats Banner</h3>
                        <Select 
                          value={customs.landing_show_stats !== 'false' ? 'true' : 'false'} 
                          onValueChange={(val) => handleCustomChange('landing_show_stats', val)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Enabled</SelectItem>
                            <SelectItem value="false">Disabled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {customs.landing_show_stats !== 'false' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold">Stat 1 Value</label>
                              <Input 
                                value={customs.landing_stats_1_val || ''} 
                                onChange={(e) => handleCustomChange('landing_stats_1_val', e.target.value)}
                                placeholder="e.g. 10K+"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold">Stat 1 Label</label>
                              <Input 
                                value={customs.landing_stats_1_lbl || ''} 
                                onChange={(e) => handleCustomChange('landing_stats_1_lbl', e.target.value)}
                                placeholder="e.g. Active Students"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold">Stat 2 Value</label>
                              <Input 
                                value={customs.landing_stats_2_val || ''} 
                                onChange={(e) => handleCustomChange('landing_stats_2_val', e.target.value)}
                                placeholder="e.g. 5K+"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold">Stat 2 Label</label>
                              <Input 
                                value={customs.landing_stats_2_lbl || ''} 
                                onChange={(e) => handleCustomChange('landing_stats_2_lbl', e.target.value)}
                                placeholder="e.g. Questions"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold">Stat 3 Value</label>
                              <Input 
                                value={customs.landing_stats_3_val || ''} 
                                onChange={(e) => handleCustomChange('landing_stats_3_val', e.target.value)}
                                placeholder="e.g. 95%"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold">Stat 3 Label</label>
                              <Input 
                                value={customs.landing_stats_3_lbl || ''} 
                                onChange={(e) => handleCustomChange('landing_stats_3_lbl', e.target.value)}
                                placeholder="e.g. Success Rate"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Banner Image Customization */}
                    <div className="border-b border-border pb-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Main Banner Image</h3>
                        <Select 
                          value={customs.landing_show_banner !== 'false' ? 'true' : 'false'} 
                          onValueChange={(val) => handleCustomChange('landing_show_banner', val)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Visible</SelectItem>
                            <SelectItem value="false">Hidden</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {customs.landing_show_banner !== 'false' && (
                        <div className="space-y-3">
                          <label className="text-xs font-semibold">Upload Website Banner Image</label>
                          <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer relative bg-secondary/5">
                            <input 
                              type="file" 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'landing_banner_image')}
                              disabled={isUploadingImage}
                            />
                            {isUploadingImage ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                            ) : (
                              <UploadCloud className="w-6 h-6 text-muted-foreground" />
                            )}
                            <div className="text-center text-xs">
                              <span className="font-semibold text-primary">Browse local image</span>
                              <span className="text-muted-foreground"> to change banner</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI Retraining customization */}
                    <div className="pb-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-primary uppercase tracking-wider">AI Marketing Section</h3>
                        <Select 
                          value={customs.landing_show_ai_retrain !== 'false' ? 'true' : 'false'} 
                          onValueChange={(val) => handleCustomChange('landing_show_ai_retrain', val)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Enabled</SelectItem>
                            <SelectItem value="false">Disabled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {customs.landing_show_ai_retrain !== 'false' && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold">Section Badge Text</label>
                            <Input 
                              value={customs.landing_ai_badge || ''} 
                              onChange={(e) => handleCustomChange('landing_ai_badge', e.target.value)}
                              placeholder="e.g. ✨ New Feature Release"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold">Section Title</label>
                            <Input 
                              value={customs.landing_ai_title || ''} 
                              onChange={(e) => handleCustomChange('landing_ai_title', e.target.value)}
                              placeholder="e.g. Introduce AI Weakness Retraining!"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold">Section Description Text</label>
                            <textarea
                              className="w-full p-2 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              rows={4}
                              value={customs.landing_ai_desc || ''} 
                              onChange={(e) => handleCustomChange('landing_ai_desc', e.target.value)}
                              placeholder="Section details description..."
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold">CTA Button Text</label>
                            <Input 
                              value={customs.landing_ai_cta_primary || ''} 
                              onChange={(e) => handleCustomChange('landing_ai_cta_primary', e.target.value)}
                              placeholder="e.g. Sign Up to Start Training"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <div className="p-6 border-t border-border bg-card flex justify-end gap-3 rounded-b-lg">
                    <Button 
                      onClick={handleSaveCustoms} 
                      disabled={isSaving}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving Changes...' : 'Save Page Changes'}
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Right panel: Live Preview */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-accent" /> Page Live Preview
                  </h3>
                  <div className="flex gap-1 bg-secondary/30 p-0.5 rounded-lg border border-border">
                    <Button 
                      size="sm" 
                      variant={previewDevice === 'desktop' ? 'default' : 'ghost'} 
                      onClick={() => setPreviewDevice('desktop')}
                      className="h-7 text-xs gap-1 px-2.5"
                    >
                      <Laptop className="w-3.5 h-3.5" /> Desktop
                    </Button>
                    <Button 
                      size="sm" 
                      variant={previewDevice === 'mobile' ? 'default' : 'ghost'} 
                      onClick={() => setPreviewDevice('mobile')}
                      className="h-7 text-xs gap-1 px-2.5"
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Mobile
                    </Button>
                  </div>
                </div>

                <div 
                  className={`border border-border rounded-xl shadow-inner bg-card overflow-hidden transition-all duration-300 mx-auto ${
                    previewDevice === 'mobile' ? 'max-w-[375px] h-[650px]' : 'w-full h-[650px]'
                  }`}
                >
                  {/* Browser mockup header */}
                  <div className="bg-secondary/40 border-b border-border px-3 py-2 flex items-center gap-2 text-[10px] text-muted-foreground select-none">
                    <div className="flex gap-1.5 flex-shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                    </div>
                    <div className="bg-background rounded px-3 py-0.5 w-full max-w-sm text-center truncate border border-border flex items-center justify-center gap-1 font-mono">
                      <Globe className="w-2.5 h-2.5" /> edupath.com/landing
                    </div>
                  </div>

                  {/* Scrollable mockup body */}
                  <div className="overflow-y-auto h-[calc(100%-35px)] text-left bg-background select-none text-foreground p-4 space-y-8">
                    {/* Mock Navigation */}
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{(customs.platform_name || 'EduPath')[0]}</span>
                        </div>
                        <span className="font-bold text-xs">{customs.platform_name || 'EduPath'}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-secondary text-[8px] font-bold rounded">Login</span>
                        <span className="px-2 py-1 bg-primary text-white text-[8px] font-bold rounded">Register</span>
                      </div>
                    </div>

                    {/* Mock Hero Area */}
                    <div className="text-center py-6 space-y-4 bg-gradient-to-b from-primary/5 to-transparent rounded-lg p-3">
                      {customs.landing_show_diagnostic !== 'false' && (
                        <div className="inline-block px-2.5 py-1 rounded-full bg-accent/10 border border-accent/15 text-[8px] font-semibold text-accent max-w-xs truncate">
                          {customs.landing_hero_badge || '📝 Try Our Free AI Smart-Guidance Assessment →'}
                        </div>
                      )}
                      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight px-1">
                        {customs.landing_hero_title || 'Master Your Learning with'}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-chart-1">
                          {customs.landing_hero_span || 'EduPath'}
                        </span>
                      </h2>
                      <p className="text-[10px] text-muted-foreground max-w-md mx-auto px-4 leading-relaxed">
                        {customs.landing_hero_desc || 'A comprehensive educational testing platform designed for students in grades 4-12. Take tests, track progress, and unlock your full potential.'}
                      </p>
                      <div className="flex justify-center gap-2 pt-1">
                        <span className="px-2.5 py-1.5 bg-gradient-to-r from-primary to-accent text-white text-[8px] font-bold rounded shadow-sm">
                          ⚡ {customs.landing_hero_cta_primary || 'Take Free AI Placement Assessment'}
                        </span>
                        <span className="px-2.5 py-1.5 border border-border bg-background text-[8px] font-bold rounded">
                          {customs.landing_hero_cta_secondary || 'Sign Up'}
                        </span>
                      </div>
                    </div>

                    {/* Mock Stats Banner */}
                    {customs.landing_show_stats !== 'false' && (
                      <div className="grid grid-cols-3 gap-2 py-3 bg-secondary/15 rounded border border-border">
                        <div className="text-center">
                          <div className="text-xs font-bold text-primary">{customs.landing_stats_1_val || '10K+'}</div>
                          <div className="text-[8px] text-muted-foreground">{customs.landing_stats_1_lbl || 'Active Students'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-accent">{customs.landing_stats_2_val || '5K+'}</div>
                          <div className="text-[8px] text-muted-foreground">{customs.landing_stats_2_lbl || 'Questions'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-chart-1">{customs.landing_stats_3_val || '95%'}</div>
                          <div className="text-[8px] text-muted-foreground">{customs.landing_stats_3_lbl || 'Success Rate'}</div>
                        </div>
                      </div>
                    )}

                    {/* Mock Banner Image */}
                    {customs.landing_show_banner !== 'false' && (
                      <div className="border border-border/80 rounded overflow-hidden shadow-md max-h-[140px] bg-secondary/10 flex items-center justify-center">
                        <img 
                          src={customs.landing_banner_image || "https://d2xsxph8kpxj0f.cloudfront.net/116779878/Qva2UpEQ5jzdBK2KTmT5KC/boy-exam-banner-98KMavjknQoGs96AaoMJeg.webp"} 
                          alt="Banner Mock" 
                          className="w-full h-auto object-cover object-center max-h-[140px]"
                        />
                      </div>
                    )}

                    {/* Mock AI Retraining marketing */}
                    {customs.landing_show_ai_retrain !== 'false' && (
                      <div className="bg-gradient-to-r from-primary/5 via-accent/10 to-chart-1/5 border border-primary/10 rounded-lg p-3.5 space-y-2.5">
                        <div className="inline-block px-2 py-0.5 rounded bg-primary/15 text-primary text-[7px] font-bold uppercase tracking-wider">
                          {customs.landing_ai_badge || '✨ New Feature Release'}
                        </div>
                        <h4 className="text-xs font-bold text-foreground leading-tight">
                          {customs.landing_ai_title || 'Introduce AI Weakness Retraining & Dynamic Mastery Profiles!'}
                        </h4>
                        <p className="text-[9px] text-muted-foreground leading-normal">
                          {customs.landing_ai_desc || 'Never get stuck on the same topics again. Our new AI engine monitors your quiz performance chronologically, building a live map of your academic Strengths and Focus Areas.'}
                        </p>
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary to-accent text-white text-[8px] font-bold rounded text-center w-full font-sans">
                          {customs.landing_ai_cta_primary || 'Sign Up to Start Training'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Branding</CardTitle>
                  <CardDescription>Customize your platform name and logo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Platform Name</label>
                    <Input
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      placeholder="Enter platform name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Logo Upload</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                      <p className="text-sm text-muted-foreground">Click to upload logo (PNG, JPG, SVG)</p>
                      <p className="text-xs text-muted-foreground mt-1">Max size: 2MB</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Favicon</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                      <p className="text-sm text-muted-foreground">Click to upload favicon (ICO, PNG)</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Platform Description</label>
                    <textarea
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
                      placeholder="Enter platform description for SEO and branding"
                      defaultValue="EduPath - The ultimate educational testing platform for students in grades 4-12"
                    />
                  </div>

                  <Button>Save Branding Changes</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Color Theme</CardTitle>
                  <CardDescription>Customize primary and secondary colors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Primary Color</label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-16 h-16 rounded cursor-pointer border border-border"
                        />
                        <div>
                          <p className="text-sm font-medium">{primaryColor}</p>
                          <p className="text-xs text-muted-foreground">Used for buttons, links, accents</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Secondary Color</label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-16 h-16 rounded cursor-pointer border border-border"
                        />
                        <div>
                          <p className="text-sm font-medium">{secondaryColor}</p>
                          <p className="text-xs text-muted-foreground">Used for highlights, success states</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Font Family</label>
                    <Select defaultValue="inter">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter">Inter (Default)</SelectItem>
                        <SelectItem value="poppins">Poppins</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="opensans">Open Sans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Theme Mode</label>
                    <Select defaultValue="light-dark">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light Only</SelectItem>
                        <SelectItem value="dark">Dark Only</SelectItem>
                        <SelectItem value="light-dark">Light & Dark (Auto)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button>Apply Theme</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Theme Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg" style={{ backgroundColor: primaryColor + '20' }}>
                      <p className="font-medium" style={{ color: primaryColor }}>Primary Color Preview</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg" style={{ backgroundColor: secondaryColor + '20' }}>
                      <p className="font-medium" style={{ color: secondaryColor }}>Secondary Color Preview</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage your API keys for integrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleGenerateAPIKey} className="gap-2 mb-6">
                    <Key className="w-4 h-4" />
                    Generate New API Key
                  </Button>

                  <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                      <Card key={apiKey.id} className="border-border">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{apiKey.name}</p>
                                <p className="text-sm text-muted-foreground mt-1">Created: {apiKey.created}</p>
                                <p className="text-sm text-muted-foreground">Last used: {apiKey.lastUsed}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                apiKey.status === 'active'
                                  ? 'bg-success/15 text-success border-success/20'
                                  : 'bg-muted text-muted-foreground border-border'
                              }`}>
                                {apiKey.status.charAt(0).toUpperCase() + apiKey.status.slice(1)}
                              </span>
                            </div>

                            <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                              {apiKey.key}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyKey(apiKey.key)}
                                className="gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                Copy
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1">
                                <Eye className="w-3 h-3" />
                                View Requests
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1">
                                <RefreshCw className="w-3 h-3" />
                                Regenerate
                              </Button>
                              <Button size="sm" variant="destructive">Revoke</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Access comprehensive API documentation to integrate EduPath with your systems.
                    </p>
                    <Button variant="outline" className="gap-2">
                      <Zap className="w-4 h-4" />
                      View API Docs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
