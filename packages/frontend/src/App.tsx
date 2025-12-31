import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Public Pages
import HomePage from '@/pages/public/HomePage';
import JobsPage from '@/pages/public/JobsPage';
import JobDetailPage from '@/pages/public/JobDetailPage';
import CompaniesPage from '@/pages/public/CompaniesPage';
import CompanyPage from '@/pages/public/CompanyPage';
import ProfilesPage from '@/pages/public/ProfilesPage';
import ProfileDetailPage from '@/pages/public/ProfileDetailPage';
import EmployerLandingPage from '@/pages/public/EmployerLandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

// Seeker Pages
import SeekerDashboard from '@/pages/seeker/SeekerDashboard';
import SeekerProfile from '@/pages/seeker/SeekerProfile';
import SeekerApplications from '@/pages/seeker/SeekerApplications';
import SeekerSavedJobs from '@/pages/seeker/SeekerSavedJobs';
import SeekerAlerts from '@/pages/seeker/SeekerAlerts';

// Employer Pages
import EmployerDashboard from '@/pages/employer/EmployerDashboard';
import EmployerProfile from '@/pages/employer/EmployerProfile';
import EmployerJobs from '@/pages/employer/EmployerJobs';
import EmployerJobForm from '@/pages/employer/EmployerJobForm';
import EmployerApplicants from '@/pages/employer/EmployerApplicants';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminEmployers from '@/pages/admin/AdminEmployers';
import AdminJobs from '@/pages/admin/AdminJobs';
import AdminApplications from '@/pages/admin/AdminApplications';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';

// Protected Route Component
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Guest Route Component (redirect if logged in)
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    const redirectPath =
      user.role === 'admin'
        ? '/admin'
        : user.role === 'employer'
        ? '/employer'
        : '/seeker';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:id" element={<CompanyPage />} />
        <Route path="/profiles" element={<ProfilesPage />} />
        <Route path="/profiles/:id" element={<ProfileDetailPage />} />
        <Route path="/for-employers" element={<EmployerLandingPage />} />
      </Route>

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        }
      />

      {/* Seeker Routes */}
      <Route
        path="/seeker"
        element={
          <ProtectedRoute allowedRoles={['seeker', 'admin']}>
            <DashboardLayout userType="seeker" />
          </ProtectedRoute>
        }
      >
        <Route index element={<SeekerDashboard />} />
        <Route path="profile" element={<SeekerProfile />} />
        <Route path="applications" element={<SeekerApplications />} />
        <Route path="saved" element={<SeekerSavedJobs />} />
        <Route path="alerts" element={<SeekerAlerts />} />
      </Route>

      {/* Employer Routes */}
      <Route
        path="/employer"
        element={
          <ProtectedRoute allowedRoles={['employer', 'admin']}>
            <DashboardLayout userType="employer" />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployerDashboard />} />
        <Route path="profile" element={<EmployerProfile />} />
        <Route path="jobs" element={<EmployerJobs />} />
        <Route path="jobs/new" element={<EmployerJobForm />} />
        <Route path="jobs/:id/edit" element={<EmployerJobForm />} />
        <Route path="jobs/:id/applicants" element={<EmployerApplicants />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="employers" element={<AdminEmployers />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

