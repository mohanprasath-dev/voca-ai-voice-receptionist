import React from 'react';
import { type MotionProps, motion } from 'motion/react';
import { cn } from '@/lib/utils';

type GlassCardProps = React.ComponentPropsWithoutRef<'div'> &
  MotionProps & {
    glowColor?: string;
    intensity?: 'low' | 'medium' | 'high';
  };

const INTENSITY_SHADOW = {
  low:    '0 0 20px rgba(255,255,255,0.02)',
  medium: '0 0 40px rgba(255,255,255,0.05)',
  high:   '0 0 80px rgba(255,255,255,0.1)',
};

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, glowColor, intensity = 'medium', style, ...props }, ref) => {
    const shadow = glowColor
      ? `0 0 ${intensity === 'high' ? 80 : intensity === 'low' ? 20 : 40}px ${glowColor}`
      : INTENSITY_SHADOW[intensity];

    return (
      <motion.div
        ref={ref}
        className={cn('glass relative overflow-hidden rounded-3xl', className)}
        style={{ boxShadow: shadow, ...style }}
        {...props}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/5" />
        {children as React.ReactNode}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
