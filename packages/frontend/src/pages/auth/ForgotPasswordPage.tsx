import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@job-portal/shared';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    // @ts-expect-error - zod version mismatch with @hookform/resolvers
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-mesh-gradient bg-navy-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
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
          {submitted ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-accent-emerald/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-accent-emerald" />
              </div>
              <h1 className="text-2xl font-display font-bold text-white mb-2">
                Check your email
              </h1>
              <p className="text-navy-400 mb-6">
                If an account exists with that email, we've sent password reset instructions.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-white text-center mb-2">
                Forgot your password?
              </h1>
              <p className="text-navy-400 text-center mb-8">
                Enter your email and we'll send you a reset link
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-5 h-5" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button type="submit" isLoading={isLoading} className="w-full">
                  Send Reset Link
                </Button>
              </form>

              <p className="mt-6 text-center">
                <Link to="/login" className="text-primary-400 hover:text-primary-300 flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

