'use client';

import React from 'react';
import type { LiveMetrics } from '@/lib/contracts';
import { cn } from '@/lib/utils';

interface LatencyDebugPanelProps {
  metrics: LiveMetrics;
  className?: string;
}

export function LatencyDebugPanel({ metrics, className }: LatencyDebugPanelProps) {
  if (process.env.NODE_ENV === 'production') return null;
  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-[11px] text-white/80 backdrop-blur-2xl',
        className
      )}
    >
      <div className="mb-2 font-sans text-[10px] font-black tracking-widest text-white/50 uppercase">
        Latency debug (dev)
      </div>
      <div>avgResponseLatencyMs: {Math.round(metrics.avgResponseLatencyMs)}</div>
      <div>intentSuccessRate: {metrics.intentSuccessRate.toFixed(3)}</div>
      <div>budgetUsagePercentage: {metrics.budgetUsagePercentage.toFixed(1)}</div>
      <div>budgetMode: {metrics.budgetMode ?? 'normal'}</div>
    </div>
  );
}
