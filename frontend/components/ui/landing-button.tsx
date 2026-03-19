'use client';

import * as React from 'react';
import { type MotionProps, motion } from 'motion/react';
import { cn } from '@/lib/utils';

type LandingButtonVariant = 'primary' | 'secondary';

type LandingButtonProps = React.ComponentPropsWithoutRef<'a'> &
  MotionProps & {
    variant?: LandingButtonVariant;
  };

export function LandingButton({ className, variant = 'primary', ...props }: LandingButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-colors duration-200';

  const variants: Record<LandingButtonVariant, string> = {
    primary: 'bg-white text-black hover:bg-white/90',
    secondary: 'glass bg-transparent text-white hover:bg-white/5',
  };

  return (
    <motion.a
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}
