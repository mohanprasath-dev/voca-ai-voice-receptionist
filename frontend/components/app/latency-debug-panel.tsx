import type { ConnectionHealth } from '@/hooks/useConnectionHealth';

export function LatencyDebugPanel({
  latencyMs,
  connectionHealth,
}: {
  latencyMs: number;
  connectionHealth: ConnectionHealth;
}) {
  return (
    <div className="bg-background/90 border-input/60 rounded-md border px-3 py-2 text-xs shadow-sm">
      <div>Latency: {Math.round(latencyMs)} ms</div>
      <div>Connection: {connectionHealth}</div>
    </div>
  );
}
