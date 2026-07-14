import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle, KeyRound, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const success = resetPassword(email);
      setIsSubmitting(false);
      if (success) {
        setIsSubmitted(true);
        toast.success('Reset email sent successfully! 📧');
      } else {
        toast.error('No account found with that email address.');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/5 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/5 pointer-events-none" />

      <Card className="w-full max-w-md border border-border/80 bg-card/60 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden animate-scale-in relative z-10">
        <div className="h-1.5 bg-gradient-to-r from-primary to-emerald-500" />
        
        <CardHeader className="space-y-3 text-center pt-8">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              {isSubmitted ? (
                <CheckCircle className="w-7 h-7 text-emerald-500 animate-bounce" />
              ) : (
                <KeyRound className="w-7 h-7" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Forgot Password</CardTitle>
          <CardDescription className="text-xs text-muted-foreground leading-relaxed px-4">
            {!isSubmitted
              ? "No worries! Enter your account email address below, and we'll send you a link to reset your password credentials."
              : "A security link has been dispatched to your email address."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-6 pb-8">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-10 rounded-xl bg-background border-border/80 focus:ring-4 focus:ring-primary/10 transition-all text-sm h-11"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-white h-11 rounded-xl shadow-md font-bold text-sm hover-lift transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending Request Link...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground leading-normal">
                Check your inbox! We've sent a password reset link to <strong className="text-foreground">{email}</strong>.
              </p>
              <Button 
                onClick={() => setIsSubmitted(false)} 
                variant="outline" 
                className="w-full rounded-xl border-border/85 h-11 text-sm font-semibold hover:bg-muted/30 hover-lift transition-all"
              >
                Try Different Email
              </Button>
            </div>
          )}

          <div className="pt-2 text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-primary hover:underline transition-all active-scale"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login Screen
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
