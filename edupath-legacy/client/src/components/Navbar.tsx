import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, User as UserIcon, Moon, Sun, X, Settings, ChevronDown, LayoutDashboard, Database, ShieldAlert, BarChart3 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState } from 'react';
import { NotificationBell } from './NotificationBell';
import { SearchBar } from './SearchBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string, tabName?: string) => {
    if (tabName) {
      const params = new URLSearchParams(window.location.search);
      return location === path && params.get('tab') === tabName;
    }
    if (path === '/teacher-dashboard') {
      const params = new URLSearchParams(window.location.search);
      return location === path && !params.get('tab');
    }
    return location === path || location.startsWith(path + '/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navLinkClass = (path: string, tabName?: string) => `
    text-sm font-medium transition-all duration-200 relative py-2 flex items-center gap-1 cursor-pointer
    ${isActive(path, tabName)
      ? 'text-primary'
      : 'text-muted-foreground hover:text-foreground'
    }
    after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300
    ${isActive(path, tabName) ? 'after:w-full' : 'after:w-0 hover:after:w-1/2'}
  `;

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b border-border/60 shadow-sm transition-all duration-300">
      <div className="container flex h-16 items-center justify-between">
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 active:scale-98 transition-all"
            onClick={() => navigate('/')}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-primary/10">
              <span className="text-white font-bold text-xl tracking-tight">E</span>
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/85">
              EduPath
            </span>
          </div>

          {/* Desktop Search */}
          {user && (
            <div className="hidden md:flex items-center w-64 lg:w-80">
              <SearchBar />
            </div>
          )}
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {!user && (
            <button
              onClick={() => handleNavigation('/teachers')}
              className={navLinkClass('/teachers')}
            >
              Teachers
            </button>
          )}

          {user && (
            <>
              {/* Student Navigation */}
              {user.role === 'student' && (
                <>
                  <button
                    onClick={() => handleNavigation('/student-dashboard')}
                    className={navLinkClass('/student-dashboard')}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleNavigation('/tests')}
                    className={navLinkClass('/tests')}
                  >
                    Tests
                  </button>
                  <button
                    onClick={() => handleNavigation('/teachers')}
                    className={navLinkClass('/teachers')}
                  >
                    Teachers
                  </button>
                </>
              )}

              {/* Parent Navigation */}
              {user.role === 'parent' && (
                <button
                  onClick={() => handleNavigation('/parent-dashboard')}
                  className={navLinkClass('/parent-dashboard')}
                >
                  Dashboard
                </button>
              )}

              {/* Teacher Navigation */}
              {user.role === 'teacher' && (
                <>
                  <button
                    onClick={() => handleNavigation('/teacher-dashboard')}
                    className={navLinkClass('/teacher-dashboard')}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleNavigation('/admin/cheating-detection')}
                    className={navLinkClass('/admin/cheating-detection')}
                  >
                    Cheating Detection
                  </button>
                </>
              )}

              {/* Admin Navigation Grouped Dropdowns (Resolves Crowding) */}
              {user.role === 'admin' && (
                <>
                  <button
                    onClick={() => handleNavigation('/admin-dashboard')}
                    className={navLinkClass('/admin-dashboard')}
                  >
                    Dashboard
                  </button>

                  {/* Dropdown 1: Content Management */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer py-2 outline-none">
                        Manage <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 animate-scale-in">
                      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Content & Structure</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleNavigation('/admin/questions')}>
                        Questions Bank
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavigation('/admin/tests')}>
                        Test Templates
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavigation('/admin/content-management')}>
                        Content Versions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavigation('/admin/customization')}>
                        Page Customizer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Dropdown 2: Operations */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer py-2 outline-none">
                        Operations <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52 animate-scale-in">
                      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">User Management</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleNavigation('/admin/users')}>
                        Users Directory
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavigation('/admin/moderation')}>
                        Moderation Queue
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavigation('/admin/communication')}>
                        Comms & Broadcasts
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Security & Integrity</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleNavigation('/admin/cheating-detection')}>
                        Cheating Detection
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Dropdown 3: System Stats */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer py-2 outline-none">
                        System & Analytics <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52 animate-scale-in">
                      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Analytics</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleNavigation('/admin/analytics')}>
                        Performance Stats
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavigation('/admin/reports')}>
                        Results Reports
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavigation('/admin/difficulty-calibration')}>
                        Difficulty Calibration
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Administration</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleNavigation('/admin/system')}>
                        System Health
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavigation('/admin/platform-settings')}>
                        Platform Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </>
          )}
        </div>

        {/* Right Section: Theme, Profile, Notifications & Mobile Toggle */}
        <div className="flex items-center gap-2">
          {/* Profile Quick Link */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation('/profile')}
              className="gap-2 hidden lg:inline-flex hover-lift hover:bg-muted"
              title="View profile"
            >
              <UserIcon className="w-4 h-4" />
              <span className="text-xs">Profile</span>
            </Button>
          )}

          {/* Notifications Bell */}
          {user && <NotificationBell />}

          {/* Theme Toggle */}
          {toggleTheme && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl hover-lift hover:bg-muted"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </Button>
          )}

          {/* User Account / Action */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2.5 rounded-xl hover:bg-muted active-scale">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-7 h-7 rounded-full border border-primary/20 object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                <DropdownMenuLabel className="font-semibold">{user.name}</DropdownMenuLabel>
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  <UserIcon className="w-4 h-4 mr-2" />
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
                  <UserIcon className="w-4 h-4 mr-2" />
                  Profile Details
                </DropdownMenuItem>
                {user.role === 'student' && (
                  <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Student Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="hidden sm:inline-flex rounded-xl hover-lift"
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/register')}
                className="hidden sm:inline-flex rounded-xl hover-lift bg-primary text-white shadow-md shadow-primary/10"
              >
                Register
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors active-scale"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Slide-down */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur p-4 space-y-2 animate-slide-down shadow-lg">
          {user ? (
            <>
              {user.role === 'student' && (
                <>
                  <Button
                    variant={isActive('/student-dashboard') ? 'default' : 'ghost'}
                    className="w-full justify-start rounded-xl"
                    onClick={() => handleNavigation('/student-dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant={isActive('/tests') ? 'default' : 'ghost'}
                    className="w-full justify-start rounded-xl"
                    onClick={() => handleNavigation('/tests')}
                  >
                    Tests
                  </Button>
                  <Button
                    variant={isActive('/teachers') ? 'default' : 'ghost'}
                    className="w-full justify-start rounded-xl"
                    onClick={() => handleNavigation('/teachers')}
                  >
                    Teachers
                  </Button>
                </>
              )}
              {user.role === 'parent' && (
                <Button
                  variant={isActive('/parent-dashboard') ? 'default' : 'ghost'}
                  className="w-full justify-start rounded-xl"
                  onClick={() => handleNavigation('/parent-dashboard')}
                >
                  Dashboard
                </Button>
              )}
              {user.role === 'teacher' && (
                <>
                  <Button
                    variant={isActive('/teacher-dashboard') ? 'default' : 'ghost'}
                    className="w-full justify-start rounded-xl"
                    onClick={() => handleNavigation('/teacher-dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant={isActive('/admin/cheating-detection') ? 'default' : 'ghost'}
                    className="w-full justify-start rounded-xl"
                    onClick={() => handleNavigation('/admin/cheating-detection')}
                  >
                    Cheating Detection
                  </Button>
                </>
              )}
              {user.role === 'admin' && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-muted-foreground px-3 py-1">Admin Operations</div>
                  <Button
                    variant={isActive('/admin-dashboard') ? 'default' : 'ghost'}
                    className="w-full justify-start rounded-xl"
                    onClick={() => handleNavigation('/admin-dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant={isActive('/admin/questions') ? 'default' : 'ghost'}
                    className="w-full justify-start rounded-xl"
                    onClick={() => handleNavigation('/admin/questions')}
                  >
                    Questions Bank
                  </Button>
                  <Button
                    variant={isActive('/admin/tests') ? 'default' : 'ghost'}
                    className="w-full justify-start rounded-xl"
                    onClick={() => handleNavigation('/admin/tests')}
                  >
                    Test Templates
                  </Button>
                  <Button
                    variant={isActive('/admin/reports') ? 'default' : 'ghost'}
                    className="w-full justify-start rounded-xl"
                    onClick={() => handleNavigation('/admin/reports')}
                  >
                    Results Reports
                  </Button>
                  <Button
                    variant={isActive('/admin/users') ? 'default' : 'ghost'}
                    className="w-full justify-start rounded-xl"
                    onClick={() => handleNavigation('/admin/users')}
                  >
                    Users Directory
                  </Button>
                  <Button
                    variant={isActive('/admin/cheating-detection') ? 'default' : 'ghost'}
                    className="w-full justify-start rounded-xl"
                    onClick={() => handleNavigation('/admin/cheating-detection')}
                  >
                    Cheating Detection
                  </Button>
                  <Button
                    variant={isActive('/admin/difficulty-calibration') ? 'default' : 'ghost'}
                    className="w-full justify-start rounded-xl"
                    onClick={() => handleNavigation('/admin/difficulty-calibration')}
                  >
                    Difficulty Calibration
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <Button
                variant={isActive('/teachers') ? 'default' : 'ghost'}
                className="w-full justify-start font-medium rounded-xl"
                onClick={() => handleNavigation('/teachers')}
              >
                Teachers
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start font-medium rounded-xl"
                onClick={() => handleNavigation('/login')}
              >
                Login
              </Button>
              <Button
                className="w-full justify-start font-medium rounded-xl bg-primary text-white"
                onClick={() => handleNavigation('/register')}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
