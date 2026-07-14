import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, BookOpen, GraduationCap, School, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [gradeLevel, setGradeLevel] = useState('8');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Password Strength Calculation (visual helper)
  const getPasswordStrength = () => {
    if (!password) return { text: '', color: 'bg-transparent', score: 0 };
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 1: return { text: 'Weak', color: 'bg-red-500', score: 25 };
      case 2: return { text: 'Fair', color: 'bg-orange-500', score: 50 };
      case 3: return { text: 'Good', color: 'bg-yellow-500', score: 75 };
      case 4: return { text: 'Strong', color: 'bg-emerald-500', score: 100 };
      default: return { text: 'Weak', color: 'bg-red-500', score: 25 };
    }
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (role === 'student' && !gradeLevel) {
      toast.error('Please select a grade level');
      return;
    }

    if (!acceptTerms) {
      toast.error('Please accept the Terms of Service & Privacy Policy');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));

      register(
        name,
        email,
        password,
        role,
        role === 'student' ? parseInt(gradeLevel) : undefined
      );
      toast.success('Registration successful! Welcome to EduPath!');

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
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (currentRole: string) => {
    switch (currentRole) {
      case 'student': return <GraduationCap className="w-4 h-4" />;
      case 'parent': return <School className="w-4 h-4" />;
      case 'teacher': return <BookOpen className="w-4 h-4" />;
      default: return <GraduationCap className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background transition-colors duration-300">
      {/* Left Column: Visual/Illustration Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-primary via-blue-600 to-indigo-700 items-center justify-center p-12 overflow-hidden">
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
              Unlock Your <br />Academic Potential.
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Create your account to start adaptive testing, calibrate your grade levels, and monitor curriculum coverage through personalized reports.
            </p>
          </div>

          <div className="flex flex-col gap-3.5 pt-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-xs">AI Smart Diagnostics</p>
                <p className="text-[10px] text-blue-100">Pinpoint curriculum weaknesses with precision.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-4 sm:p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-8">
          <div className="text-center lg:text-left space-y-1">
            <div className="flex justify-center lg:justify-start items-center gap-2 mb-2 lg:hidden">
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-lg">E</div>
              <span className="font-bold text-lg">EduPath</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Create Account</h1>
            <p className="text-xs text-muted-foreground">Get started on your adaptive learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 rounded-xl bg-background border-border/80 focus:ring-4 focus:ring-primary/10 transition-all text-sm h-11"
                />
              </div>
            </div>

            {/* Email Address */}
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

            {/* Role Select visual cards */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">I am registering as</Label>
              <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-3 gap-2">
                {['student', 'parent', 'teacher'].map(r => (
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

            {/* Grade Level (Student Only) */}
            {role === 'student' && (
              <div className="space-y-1.5">
                <Label htmlFor="grade" className="text-xs font-semibold">Grade Level</Label>
                <Select value={gradeLevel} onValueChange={setGradeLevel}>
                  <SelectTrigger id="grade" className="rounded-xl border-border/80 h-11 text-sm bg-background">
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl animate-scale-in">
                    {Array.from({ length: 9 }, (_, i) => i + 4).map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
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
              
              {/* Visual Password Strength meter */}
              {password && (
                <div className="space-y-1 pt-1.5 animate-fade-in">
                  <div className="h-1.5 w-full bg-muted dark:bg-muted/40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strength.color} transition-all duration-300`} 
                      style={{ width: `${strength.score}%` }} 
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                    <span>Password Strength: <span className="font-semibold text-foreground">{strength.text}</span></span>
                    <span>Min. 6 chars</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 pr-10 rounded-xl bg-background border-border/80 focus:ring-4 focus:ring-primary/10 transition-all text-sm h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Accept Terms Checkbox */}
            <div className="flex items-start space-x-2 py-1.5">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(!!checked)}
                className="rounded border-border/80 mt-0.5"
              />
              <Label htmlFor="terms" className="text-xs font-medium text-muted-foreground cursor-pointer leading-normal select-none">
                I accept the <a href="#" className="text-primary hover:underline font-semibold">Terms of Service</a> & <a href="#" className="text-primary hover:underline font-semibold">Privacy Policy</a>
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/95 text-white h-11 rounded-xl shadow-md font-bold text-sm hover-lift transition-all"
            >
              {isLoading ? 'Creating Profile...' : 'Register Account'}
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="text-center text-xs pt-2">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:underline font-bold"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
