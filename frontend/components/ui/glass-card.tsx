import React from 'react';
import { type MotionProps, motion } from 'motion/react';
import { cn } from '@/lib/utils';

type GlassCardProps = React.ComponentPropsWithoutRef<'div'> &
  MotionProps & {
    glowColor?: string;
    intensity?: 'low' | 'medium' | 'high';
  };

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, glowColor, intensity = 'medium', ...props }, ref) => {
    const intensityMap = {
      low: 'shadow-[0_0_20px_rgba(255,255,255,0.02)]',
      medium: glowColor
        ? `shadow-[0_0_40px_${glowColor}]`
        : 'shadow-[0_0_40px_rgba(255,255,255,0.05)]',
      high: glowColor
        ? `shadow-[0_0_80px_${glowColor}]`
        : 'shadow-[0_0_80px_rgba(255,255,255,0.1)]',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'glass relative overflow-hidden rounded-3xl',
          intensityMap[intensity],
          className
        )}
        {...props}
      >
        {/* Subtle top edge highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        {/* Inner glow edge */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/5" />
        {children as React.ReactNode}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
