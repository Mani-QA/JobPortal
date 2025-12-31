import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref' | 'children'> {
  variant?: 'default' | 'glass' | 'hover';
  children?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-navy-800/80 border border-navy-700/50 rounded-2xl',
      glass: 'bg-navy-800/50 backdrop-blur-xl border border-navy-700/50 rounded-2xl',
      hover: 'bg-navy-800/80 border border-navy-700/50 rounded-2xl transition-all duration-300 hover:bg-navy-800 hover:border-navy-600 hover:shadow-xl hover:shadow-navy-950/50',
    };

    // Note: MotionComponent is determined by variant but we use explicit conditionals below

    if (variant === 'hover') {
      return (
        <motion.div
          ref={ref}
          whileHover={{ y: -4 }}
          className={cn(variants[variant], 'p-6', className)}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={cn(variants[variant], 'p-6', className)} {...(props as HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };

