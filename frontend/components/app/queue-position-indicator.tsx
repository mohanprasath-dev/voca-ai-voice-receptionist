'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface QueuePositionIndicatorProps {
  queuePosition: number | null;
  className?: string;
}

export function QueuePositionIndicator({ queuePosition, className }: QueuePositionIndicatorProps) {
  if (queuePosition === null || queuePosition <= 0) return null;
  return (
    <div
      className={cn(
        'rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-[10px] font-black tracking-widest text-amber-100 uppercase backdrop-blur-2xl',
        className
      )}
    >
      Queue position: {queuePosition}
    </div>
  );
}
