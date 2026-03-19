'use client';

import { motion } from 'motion/react';
import type { LiveMetrics } from '@/lib/contracts';
import { cn } from '@/lib/utils';

interface LiveMetricsPanelProps {
  metrics: LiveMetrics;
  className?: string;
}

export function LiveMetricsPanel({ metrics, className }: LiveMetricsPanelProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
          Avg Latency
        </div>
        <motion.div
          key={Math.round(metrics.avgResponseLatencyMs)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-1 text-lg font-extrabold text-white"
        >
          {Math.round(metrics.avgResponseLatencyMs)} ms
        </motion.div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
          Intent Hit
        </div>
        <motion.div
          key={Math.round((metrics.intentSuccessRate ?? 0) * 100)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-1 text-lg font-extrabold text-white"
        >
          {Math.round((metrics.intentSuccessRate ?? 0) * 100)}%
        </motion.div>
      </div>
    </div>
  );
}
