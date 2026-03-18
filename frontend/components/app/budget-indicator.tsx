'use client';

import React, { useMemo } from 'react';
import type { LiveMetrics } from '@/lib/contracts';
import { cn } from '@/lib/utils';

interface BudgetIndicatorProps {
  metrics: LiveMetrics;
  className?: string;
}

export function BudgetIndicator({ metrics, className }: BudgetIndicatorProps) {
  const pct = Math.max(0, Math.min(100, metrics.budgetUsagePercentage ?? 0));
  const mode = metrics.budgetMode ?? 'normal';

  const color = useMemo(() => {
    if (mode === 'hard_limit') return 'bg-red-500/80';
    if (mode === 'near_limit') return 'bg-amber-400/80';
    return 'bg-emerald-400/70';
  }, [mode]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-2xl',
        className
      )}
      aria-label="Budget usage"
    >
      <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
        <div className={cn('h-full rounded-full transition-all duration-300', color)} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[10px] font-black tracking-widest text-white/70 uppercase">
        {mode.replace('_', ' ')} · {Math.round(pct)}%
      </div>
    </div>
  );
}

