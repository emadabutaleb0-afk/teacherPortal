import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "./ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Public
import LandingPage from "./LandingPage";
import NotFound from "@/pages/NotFound";

// Teacher (Admin) pages
import TeacherDashboard from "./Dashboard";
import TeacherCurriculum from "./Curriculum";
import TeacherTests from "./Tests";
import TeacherStudents from "./Students";
import TeacherPayments from "./Payments";
import TeacherAnalytics from "./Analytics";
import TeacherSettings from "./Settings";

// Student pages
import StudentHome from "./Home";
import StudentLesson from "./Lesson";
import StudentTest from "./TakeTest";
import StudentProfile from "./Profile";
import StudentWallet from "./Wallet";
import StudentLivePass from "./LivePass";
import RegisterPage from "./RegisterPage";
import SignInPage from "./SignInPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />

      {/* Teacher routes */}
      <Route path="/teacher" component={TeacherDashboard} />
      <Route path="/teacher/curriculum" component={TeacherCurriculum} />
      <Route path="/teacher/tests" component={TeacherTests} />
      <Route path="/teacher/students" component={TeacherStudents} />
      <Route path="/teacher/payments" component={TeacherPayments} />
      <Route path="/teacher/analytics" component={TeacherAnalytics} />
      <Route path="/teacher/settings" component={TeacherSettings} />

      {/* Student routes */}
      <Route path="/student" component={StudentHome} />
      <Route path="/student/lesson/:id" component={StudentLesson} />
      <Route path="/student/test/:id" component={StudentTest} />
      <Route path="/student/profile" component={StudentProfile} />
      <Route path="/student/wallet" component={StudentWallet} />
      <Route path="/student/live/:id" component={StudentLivePass} />

      {/* Registration & Auth */}
      <Route path="/register" component={RegisterPage} />
      <Route path="/signin" component={SignInPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster position="top-center" richColors />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
