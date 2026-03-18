import React from 'react';
import { HTMLMotionProps, motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  glowColor?: string;
  intensity?: 'low' | 'medium' | 'high';
}

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
          'relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl',
          intensityMap[intensity],
          className
        )}
        {...props}
      >
        {/* Subtle top edge highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        {children as React.ReactNode}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
