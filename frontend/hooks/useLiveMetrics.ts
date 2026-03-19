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

    function onData(payload: Uint8Array, _p?: unknown, _k?: unknown, topic?: string) {
      if (topic !== 'voca.metrics') return;
      try {
        const data = JSON.parse(new TextDecoder().decode(payload)) as Record<string, unknown>;
        setMetrics((cur) => ({
          avgResponseLatencyMs:
            (data.avgResponseLatencyMs as number) ??
            (data.avg_response_latency as number) ??
            cur.avgResponseLatencyMs,
          intentSuccessRate:
            (data.intentSuccessRate as number) ??
            (data.intent_success_rate as number) ??
            cur.intentSuccessRate,
        }));
      } catch { /* ignore */ }
    }

    room.on(RoomEvent.DataReceived, onData);
    return () => { room.off(RoomEvent.DataReceived, onData); };
  }, [room]);

  return metrics;
}
