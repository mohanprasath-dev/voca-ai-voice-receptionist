'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { LiveMetrics } from '@/lib/contracts';
import { cn } from '@/lib/utils';

interface LiveMetricsPanelProps {
  metrics: LiveMetrics;
  className?: string;
}

export function LiveMetricsPanel({ metrics, className }: LiveMetricsPanelProps) {
  return (
    <div className={cn('glass w-full max-w-sm rounded-2xl p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-black tracking-widest text-white/60 uppercase">
          Live metrics
        </div>
        <div
          className={cn(
            'rounded-full px-2 py-1 text-[10px] font-black tracking-widest uppercase',
            metrics.budgetMode === 'hard_limit'
              ? 'bg-rose-500/15 text-rose-200'
              : metrics.budgetMode === 'near_limit'
                ? 'bg-amber-400/15 text-amber-100'
                : 'bg-emerald-400/10 text-emerald-100'
          )}
        >
          {metrics.budgetMode ?? 'normal'}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-[0_0_40px_rgba(34,211,238,0.06)]">
          <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
            Avg latency
          </div>
          <motion.div
            key={Math.round(metrics.avgResponseLatencyMs)}
            initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mt-1 text-lg font-extrabold text-white"
          >
            {Math.round(metrics.avgResponseLatencyMs)} ms
          </motion.div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-[0_0_40px_rgba(99,102,241,0.06)]">
          <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
            Intent hit
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <motion.div
              key={Math.round((metrics.intentSuccessRate ?? 0) * 100)}
              initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-lg font-extrabold text-white"
            >
              {Math.round((metrics.intentSuccessRate ?? 0) * 100)}%
            </motion.div>
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                (metrics.intentSuccessRate ?? 0) >= 0.85
                  ? 'bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.45)]'
                  : (metrics.intentSuccessRate ?? 0) >= 0.55
                    ? 'bg-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.45)]'
                    : 'bg-rose-400 shadow-[0_0_18px_rgba(244,63,94,0.45)]'
              )}
              aria-label="Intent success indicator"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
