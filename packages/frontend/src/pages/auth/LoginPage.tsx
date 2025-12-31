import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Mail, Lock, ArrowRight, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { loginSchema, type LoginInput } from '@job-portal/shared';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  
  const from = (location.state as { from?: string })?.from || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    // @ts-expect-error - zod version mismatch with @hookform/resolvers
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-navy-950" />
            </div>
            <span className="font-display font-bold text-2xl text-white">
              JobPortal
            </span>
          </Link>

          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Welcome back
          </h1>
          <p className="text-navy-400 mb-8">
            Sign in to your account to continue
          </p>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => toast('OAuth coming soon!')}
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </Button>
          </div>

          <div className="divider text-navy-500 text-sm">or continue with email</div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-navy-300">
                <input type="checkbox" className="w-4 h-4 rounded border-navy-600 bg-navy-800 text-primary-500 focus:ring-primary-500" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Sign in
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-8 text-center text-navy-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-hero-pattern items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-lg text-center"
        >
          <div className="w-24 h-24 mx-auto mb-8 bg-primary-500/20 rounded-3xl flex items-center justify-center">
            <Briefcase className="w-12 h-12 text-primary-400" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Find Your Dream Career
          </h2>
          <p className="text-navy-300 text-lg">
            Connect with top employers, discover amazing opportunities, and take the next step in your professional journey.
          </p>
          
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-400">10k+</div>
              <div className="text-sm text-navy-400">Active Jobs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-400">2.5k+</div>
              <div className="text-sm text-navy-400">Companies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-400">50k+</div>
              <div className="text-sm text-navy-400">Job Seekers</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

