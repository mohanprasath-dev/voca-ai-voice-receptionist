'use client';

import { useEffect, useState } from 'react';
import { RoomEvent } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';
import type { LiveMetrics } from '@/lib/contracts';
import { EMPTY_LIVE_METRICS } from '@/lib/telemetry';

export function useLiveMetrics(): LiveMetrics {
  const room = useRoomContext();
  const [metrics, setMetrics] = useState<LiveMetrics>(EMPTY_LIVE_METRICS);

  useEffect(() => {
    if (room.state === 'disconnected') {
      setMetrics(EMPTY_LIVE_METRICS);
      return;
    }

    function onDataReceived(
      payload: Uint8Array,
      _participant?: unknown,
      _kind?: unknown,
      topic?: string
    ) {
      if (topic !== 'voca.metrics') {
        return;
      }
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text) as Record<string, unknown>;
        setMetrics((current) => ({
          avgResponseLatencyMs:
            (data.avgResponseLatencyMs as number) ??
            (data.avg_response_latency as number) ??
            current.avgResponseLatencyMs,
          intentSuccessRate:
            (data.intentSuccessRate as number) ??
            (data.intent_success_rate as number) ??
            current.intentSuccessRate,
          budgetUsagePercentage:
            (data.budgetUsagePercentage as number) ??
            (data.budget_usage_percentage as number) ??
            current.budgetUsagePercentage,
          budgetMode: ((data.budgetMode as string) ??
            (data.budget_mode as string) ??
            current.budgetMode ??
            'normal') as 'normal' | 'near_limit' | 'hard_limit',
        }));
      } catch {
        // Ignore invalid payloads.
      }
    }

    room.on(RoomEvent.DataReceived, onDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, onDataReceived);
    };
  }, [room]);

  return metrics;
}
