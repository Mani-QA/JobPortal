import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Menu, X, User, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: 'Find Jobs', href: '/jobs' },
    { name: 'Find Talent', href: '/profiles' },
    { name: 'Companies', href: '/companies' },
    { name: 'For Employers', href: '/for-employers' },
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'employer': return '/employer';
      case 'seeker': return '/seeker';
      default: return '/';
    }
  };

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-navy-950/80 backdrop-blur-xl border-b border-navy-800/50">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-navy-950" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                JobPortal
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'text-primary-400'
                      : 'text-navy-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Link to={getDashboardLink()} className="btn-primary">
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-navy-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-navy-900 border-b border-navy-800"
          >
            <div className="px-4 py-4 space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-navy-200 hover:text-white"
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-navy-700 space-y-2">
                {isAuthenticated ? (
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary w-full"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-secondary w-full"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-primary w-full"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 border-t border-navy-800 mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-navy-950" />
                </div>
                <span className="font-display font-bold text-xl text-white">
                  JobPortal
                </span>
              </Link>
              <p className="mt-4 text-sm text-navy-400">
                Find your dream job or hire top talent with our comprehensive job portal.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">For Job Seekers</h3>
              <ul className="space-y-2 text-sm text-navy-400">
                <li><Link to="/jobs" className="hover:text-primary-400">Browse Jobs</Link></li>
                <li><Link to="/register" className="hover:text-primary-400">Create Profile</Link></li>
                <li><Link to="/seeker/alerts" className="hover:text-primary-400">Job Alerts</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">For Employers</h3>
              <ul className="space-y-2 text-sm text-navy-400">
                <li><Link to="/profiles" className="hover:text-primary-400">Find Talent</Link></li>
                <li><Link to="/employer" className="hover:text-primary-400">Post a Job</Link></li>
                <li><Link to="/register" className="hover:text-primary-400">Create Account</Link></li>
                <li><Link to="/pricing" className="hover:text-primary-400">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-navy-400">
                <li><Link to="/about" className="hover:text-primary-400">About Us</Link></li>
                <li><Link to="/privacy" className="hover:text-primary-400">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary-400">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-navy-800 text-center text-sm text-navy-500">
            © {new Date().getFullYear()} JobPortal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

