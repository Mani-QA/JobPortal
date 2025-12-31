import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default' | 'outline';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary-500/10 text-primary-400 border border-primary-500/20',
      secondary: 'bg-navy-700 text-navy-300 border border-navy-600',
      success: 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20',
      warning: 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20',
      danger: 'bg-accent-rose/10 text-accent-rose border border-accent-rose/20',
      info: 'bg-accent-sky/10 text-accent-sky border border-accent-sky/20',
      default: 'bg-navy-700/50 text-navy-200 border border-navy-600',
      outline: 'bg-transparent text-navy-300 border border-navy-600',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };

