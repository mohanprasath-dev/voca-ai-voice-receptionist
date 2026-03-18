'use client';

import React from 'react';
import type { LiveMetrics } from '@/lib/contracts';
import { cn } from '@/lib/utils';

interface LiveMetricsPanelProps {
  metrics: LiveMetrics;
  className?: string;
}

export function LiveMetricsPanel({ metrics, className }: LiveMetricsPanelProps) {
  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-2xl',
        className
      )}
    >
      <div className="text-[10px] font-black tracking-widest text-white/60 uppercase">Live metrics</div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Avg latency</div>
          <div className="mt-1 text-lg font-extrabold text-white">{Math.round(metrics.avgResponseLatencyMs)} ms</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Intent hit</div>
          <div className="mt-1 text-lg font-extrabold text-white">
            {Math.round((metrics.intentSuccessRate ?? 0) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}

