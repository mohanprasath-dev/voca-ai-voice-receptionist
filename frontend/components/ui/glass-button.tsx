import React from 'react';
import { HTMLMotionProps, motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface GlassButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'relative inline-flex items-center justify-center font-semibold tracking-wide transition-all z-10 overflow-hidden';

    const variants = {
      primary:
        'bg-white/10 text-white border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-white/20 hover:border-white/30 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] backdrop-blur-lg',
      secondary:
        'bg-black/40 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-lg',
      ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5',
      danger:
        'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/30 backdrop-blur-lg shadow-[0_0_20px_rgba(244,63,94,0.1)]',
    };

    const sizes = {
      sm: 'h-9 px-4 text-xs rounded-xl',
      md: 'h-12 px-6 text-sm rounded-2xl',
      lg: 'h-14 px-8 text-base rounded-2xl',
      icon: 'size-12 rounded-2xl',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children as React.ReactNode}
        </span>
        {variant !== 'ghost' && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
        )}
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
