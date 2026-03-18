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
      'glass relative inline-flex items-center justify-center font-semibold tracking-wide transition-all z-10 overflow-hidden will-change-transform';

    const variants = {
      primary:
        'text-white ring-1 ring-cyan-300/10 hover:ring-cyan-300/25 shadow-[0_0_40px_rgba(34,211,238,0.12)] hover:shadow-[0_0_60px_rgba(34,211,238,0.18)]',
      secondary:
        'text-white/90 hover:text-white ring-1 ring-white/10 hover:ring-white/15 shadow-[0_0_30px_rgba(255,255,255,0.06)] hover:shadow-[0_0_42px_rgba(255,255,255,0.10)]',
      ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5',
      danger:
        'text-rose-200 ring-1 ring-rose-400/15 hover:ring-rose-400/25 shadow-[0_0_40px_rgba(244,63,94,0.10)] hover:shadow-[0_0_60px_rgba(244,63,94,0.14)]',
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
        whileHover={{ scale: 1.025, y: -0.5 }}
        whileTap={{ scale: 0.985, y: 0 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children as React.ReactNode}
        </span>
        {variant !== 'ghost' && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/12 to-transparent opacity-60" />
            <div className="pointer-events-none absolute -inset-px rounded-[inherit] bg-gradient-to-b from-white/8 via-transparent to-transparent opacity-70" />
          </>
        )}
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
