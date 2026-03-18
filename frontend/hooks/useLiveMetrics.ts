'use client';

import { useEffect, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
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
        const data = JSON.parse(text) as Partial<LiveMetrics>;
        setMetrics((current) => ({
          avgResponseLatencyMs: data.avgResponseLatencyMs ?? data.avg_response_latency ?? current.avgResponseLatencyMs,
          intentSuccessRate: data.intentSuccessRate ?? data.intent_success_rate ?? current.intentSuccessRate,
          budgetUsagePercentage:
            data.budgetUsagePercentage ?? data.budget_usage_percentage ?? current.budgetUsagePercentage,
          budgetMode: (data.budgetMode ?? data.budget_mode ?? current.budgetMode ?? 'normal') as 'normal' | 'near_limit' | 'hard_limit',
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
