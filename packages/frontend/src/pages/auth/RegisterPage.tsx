import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Mail, Lock, ArrowRight, User, Building2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { registerSchema, type RegisterInput } from '@job-portal/shared';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<'seeker' | 'employer'>('seeker');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterInput>({
    // @ts-expect-error - zod version mismatch with @hookform/resolvers
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'seeker',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        role: data.role,
        gdprConsent: data.gdprConsent,
      });
      toast.success('Account created successfully!');
      navigate(data.role === 'employer' ? '/employer' : '/seeker', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const handleRoleChange = (role: 'seeker' | 'employer') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-mesh-gradient bg-navy-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-navy-950" />
          </div>
          <span className="font-display font-bold text-2xl text-white">
            JobPortal
          </span>
        </Link>

        <div className="glass-card p-8">
          <h1 className="text-2xl font-display font-bold text-white text-center mb-2">
            Create your account
          </h1>
          <p className="text-navy-400 text-center mb-8">
            Join thousands of professionals finding their next opportunity
          </p>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => handleRoleChange('seeker')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedRole === 'seeker'
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-navy-700 bg-navy-800/50 hover:border-navy-600'
              }`}
            >
              <User className={`w-8 h-8 mx-auto mb-2 ${
                selectedRole === 'seeker' ? 'text-primary-400' : 'text-navy-400'
              }`} />
              <div className={`font-medium ${
                selectedRole === 'seeker' ? 'text-white' : 'text-navy-300'
              }`}>
                Job Seeker
              </div>
              <div className="text-xs text-navy-500 mt-1">
                Find your dream job
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('employer')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedRole === 'employer'
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-navy-700 bg-navy-800/50 hover:border-navy-600'
              }`}
            >
              <Building2 className={`w-8 h-8 mx-auto mb-2 ${
                selectedRole === 'employer' ? 'text-primary-400' : 'text-navy-400'
              }`} />
              <div className={`font-medium ${
                selectedRole === 'employer' ? 'text-white' : 'text-navy-300'
              }`}>
                Employer
              </div>
              <div className="text-xs text-navy-500 mt-1">
                Hire top talent
              </div>
            </button>
          </div>

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
              placeholder="Create a strong password"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              hint="At least 8 characters with uppercase, lowercase, and number"
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="gdprConsent"
                className="mt-1 w-4 h-4 rounded border-navy-600 bg-navy-800 text-primary-500 focus:ring-primary-500"
                {...register('gdprConsent')}
              />
              <label htmlFor="gdprConsent" className="text-sm text-navy-400">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-400 hover:text-primary-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-400 hover:text-primary-300">
                  Privacy Policy
                </Link>
                . I understand how my data will be processed.
              </label>
            </div>
            {errors.gdprConsent && (
              <p className="text-sm text-accent-rose">{errors.gdprConsent.message}</p>
            )}

            <Button type="submit" isLoading={isLoading} className="w-full">
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-navy-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

