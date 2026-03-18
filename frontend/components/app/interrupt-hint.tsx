'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InterruptHintProps {
  show: boolean;
  className?: string;
}

export function InterruptHint({ show, className }: InterruptHintProps) {
  if (!show) return null;
  return (
    <div
      className={cn(
        'rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[10px] font-black tracking-widest text-cyan-100 uppercase backdrop-blur-2xl',
        className
      )}
    >
      You can interrupt by speaking
    </div>
  );
}

