import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Sparkles, BookOpen, GraduationCap, School, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      login(email, password, role);
      toast.success('Welcome back to EduPath!');
      
      // Navigate based on role
      if (role === 'student') {
        navigate('/student-dashboard');
      } else if (role === 'parent') {
        navigate('/parent-dashboard');
      } else if (role === 'teacher') {
        navigate('/teacher-dashboard');
      } else if (role === 'admin') {
        navigate('/admin-dashboard');
      }
    } catch (error) {
      toast.error('Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (currentRole: string) => {
    switch (currentRole) {
      case 'student': return <GraduationCap className="w-4 h-4" />;
      case 'parent': return <School className="w-4 h-4" />;
      case 'teacher': return <BookOpen className="w-4 h-4" />;
      case 'admin': return <ShieldCheck className="w-4 h-4" />;
      default: return <GraduationCap className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background transition-colors duration-300">
      {/* Left Column: Visual/Illustration Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-primary via-blue-600 to-indigo-700 items-center justify-center p-12 overflow-hidden">
        {/* Animated Background Gradients & Circles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/10 blur-3xl" />
        
        <div className="max-w-md text-white space-y-6 relative z-10 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-primary rounded-xl flex items-center justify-center shadow-lg font-bold text-xl">
              E
            </div>
            <span className="font-extrabold text-2xl tracking-tight">EduPath</span>
          </div>
          
          <div className="space-y-3 pt-6">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
              AI-Powered <br />Adaptive Education.
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Log in to access dynamic quizzes, chronological progress heatmaps, and customized learning profiles curated by expert educators.
            </p>
          </div>

          <div className="flex flex-col gap-3.5 pt-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-xs">Weakness Remediation</p>
                <p className="text-[10px] text-blue-100">Automatically isolate and retrain focus areas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-4 sm:p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left space-y-1">
            <div className="flex justify-center lg:justify-start items-center gap-2 mb-2 lg:hidden">
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-lg">E</div>
              <span className="font-bold text-lg">EduPath</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome Back</h1>
            <p className="text-xs text-muted-foreground">Sign in to your learning dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Radio Select */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">I am logging in as</Label>
              <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['student', 'parent', 'teacher', 'admin'].map(r => (
                  <div key={r}>
                    <RadioGroupItem value={r} id={`role-${r}`} className="peer sr-only" />
                    <Label
                      htmlFor={`role-${r}`}
                      className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-border/80 bg-card hover:bg-muted/30 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 dark:peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary transition-all text-xs font-semibold active-scale"
                    >
                      {getRoleIcon(r)}
                      <span className="capitalize">{r}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 rounded-xl bg-background border-border/80 focus:ring-4 focus:ring-primary/10 transition-all text-sm h-11"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 pr-10 rounded-xl bg-background border-border/80 focus:ring-4 focus:ring-primary/10 transition-all text-sm h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2 py-1">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
                className="rounded border-border/80"
              />
              <Label htmlFor="remember" className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
                Remember my login credentials
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/95 text-white h-11 rounded-xl shadow-md font-bold text-sm hover-lift transition-all"
            >
              {isLoading ? 'Verifying Account...' : 'Sign In'}
            </Button>

            {/* Collapsible Demo Credentials Accordion */}
            <details className="group border border-border/60 bg-muted/20 dark:bg-muted/10 rounded-xl overflow-hidden transition-all duration-300">
              <summary className="list-none flex items-center justify-between p-3.5 font-semibold text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none">
                <span>Show Demo Credentials</span>
                <ChevronDownIcon className="w-3.5 h-3.5 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="p-3.5 pt-0 border-t border-border/40 text-xs text-muted-foreground space-y-1.5 leading-relaxed bg-background/50">
                <p><span className="font-semibold text-foreground">Student:</span> demo@example.com / password</p>
                <p><span className="font-semibold text-foreground">Teacher:</span> teacher@edupath.com / password</p>
                <p><span className="font-semibold text-foreground">Parent:</span> parent@edupath.com / password</p>
                <p><span className="font-semibold text-foreground">Admin:</span> admin@edupath.com / password</p>
              </div>
            </details>
          </form>

          {/* Switch to Register */}
          <div className="text-center text-xs pt-2">
            <span className="text-muted-foreground">Don't have an account? </span>
            <button
              onClick={() => navigate('/register')}
              className="text-primary hover:underline font-bold"
            >
              Register for Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small inline Helper SVG icon for Accordion indicator
function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
