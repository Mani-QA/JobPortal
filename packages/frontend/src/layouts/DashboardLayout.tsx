import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  LayoutDashboard,
  User,
  FileText,
  Heart,
  Bell,
  Building2,
  PlusCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface DashboardLayoutProps {
  userType: 'seeker' | 'employer';
}

export default function DashboardLayout({ userType }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const seekerNavigation = [
    { name: 'Dashboard', href: '/seeker', icon: LayoutDashboard },
    { name: 'My Profile', href: '/seeker/profile', icon: User },
    { name: 'Applications', href: '/seeker/applications', icon: FileText },
    { name: 'Saved Jobs', href: '/seeker/saved', icon: Heart },
    { name: 'Job Alerts', href: '/seeker/alerts', icon: Bell },
  ];

  const employerNavigation = [
    { name: 'Dashboard', href: '/employer', icon: LayoutDashboard },
    { name: 'Company Profile', href: '/employer/profile', icon: Building2 },
    { name: 'My Jobs', href: '/employer/jobs', icon: Briefcase },
    { name: 'Post New Job', href: '/employer/jobs/new', icon: PlusCircle },
  ];

  const navigation = userType === 'seeker' ? seekerNavigation : employerNavigation;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-navy-900 border-r border-navy-800 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-navy-950" />
            </div>
            <span className="font-display font-bold text-lg text-white">
              JobPortal
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-navy-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-navy-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-navy-950/80 backdrop-blur-xl border-b border-navy-800/50">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-navy-300 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page Title (hidden on mobile) */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-white">
                {navigation.find((n) => n.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Browse Jobs Link */}
              <Link
                to="/jobs"
                className="hidden sm:flex items-center gap-2 text-sm text-navy-300 hover:text-white transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                Browse Jobs
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-navy-800/50 border border-navy-700 hover:bg-navy-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-400" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-white">
                    {user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-navy-400" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-navy-800 border border-navy-700 rounded-xl shadow-xl overflow-hidden"
                    >
                      <div className="p-2">
                        <Link
                          to={userType === 'seeker' ? '/seeker/profile' : '/employer/profile'}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-navy-200 hover:bg-navy-700"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-navy-200 hover:bg-navy-700"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

