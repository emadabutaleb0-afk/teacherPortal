import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

// Public
import LandingPage from "./pages/Landing";
import NotFound from "./pages/NotFound";

// Teacher (Admin) pages
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherCurriculum from "./pages/teacher/Curriculum";
import TeacherTests from "./pages/teacher/Tests";
import TeacherStudents from "./pages/teacher/Students";
import TeacherPayments from "./pages/teacher/Payments";
import TeacherAnalytics from "./pages/teacher/Analytics";
import TeacherSettings from "./pages/teacher/Settings";

// Student pages
import StudentHome from "./pages/student/Home";
import StudentLesson from "./pages/student/Lesson";
import StudentTest from "./pages/student/TakeTest";
import StudentProfile from "./pages/student/Profile";
import StudentWallet from "./pages/student/Wallet";
import StudentLivePass from "./pages/student/LivePass";
import RegisterPage from "./pages/RegisterPage";
import SignInPage from "./pages/SignInPage";

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
  const base = import.meta.env.DEV ? "" : "/teacherPortal";
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster position="top-center" richColors />
            <WouterRouter base={base}>
              <Router />
            </WouterRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
