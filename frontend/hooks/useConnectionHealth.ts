'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';

export type ConnectionHealth = 'healthy' | 'stale' | 'disconnected';

export function evaluateConnectionHealth(
  connected: boolean,
  lastActivityMs: number,
  nowMs: number,
  staleThresholdMs: number
): ConnectionHealth {
  if (!connected) {
    return 'disconnected';
  }
  return nowMs - lastActivityMs > staleThresholdMs ? 'stale' : 'healthy';
}

export function useConnectionHealth(staleThresholdMs: number = 25_000): {
  connectionHealth: ConnectionHealth;
  lastActivityMs: number;
} {
  const room = useRoomContext();
  const [lastActivityMs, setLastActivityMs] = useState<number>(Date.now());
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const tick = () => setLastActivityMs((v) => v);
    timer.current = window.setInterval(tick, 2_000);
    return () => {
      if (timer.current !== undefined) {
        window.clearInterval(timer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (room.state !== 'disconnected') {
      setLastActivityMs(Date.now());
    }
  }, [room.state]);

  const connectionHealth = useMemo(
    () =>
      evaluateConnectionHealth(
        room.state !== 'disconnected',
        lastActivityMs,
        Date.now(),
        staleThresholdMs
      ),
    [room.state, lastActivityMs, staleThresholdMs]
  );

  return { connectionHealth, lastActivityMs };
}
