import type { LiveMetrics } from '@/lib/contracts';

export function formatPercentage(v: number): string {
  return `${Math.round(v * 100) / 100}%`;
}

export function LiveMetricsPanel({ metrics }: { metrics: LiveMetrics }) {
  return (
    <div className="bg-background/90 border-input/60 rounded-md border px-3 py-2 text-xs shadow-sm">
      <div className="font-medium">Live Metrics</div>
      <div>Avg latency: {Math.round(metrics.avgResponseLatencyMs)} ms</div>
      <div>Intent success: {formatPercentage(metrics.intentSuccessRate * 100)}</div>
      <div>Budget usage: {formatPercentage(metrics.budgetUsagePercentage)}</div>
    </div>
  );
}
