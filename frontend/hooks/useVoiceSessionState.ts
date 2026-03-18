'use client';

import { useEffect, useMemo, useState } from 'react';
import { RoomEvent } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';
import type { VoicePhase } from '@/lib/contracts';

type BackendPhase = 'listening' | 'thinking' | 'speaking' | 'reasoning';

function phaseFromBackend(backendPhase: BackendPhase | null, connected: boolean): VoicePhase {
  if (!connected) return 'idle';
  if (backendPhase === 'speaking') return 'speaking';
  if (backendPhase === 'thinking' || backendPhase === 'reasoning') return 'reasoning';
  return 'listening';
}

export function useVoiceSessionState(): { phase: VoicePhase } {
  const room = useRoomContext();
  const [backendPhase, setBackendPhase] = useState<BackendPhase | null>(null);

  useEffect(() => {
    if (room.state === 'disconnected') {
      setBackendPhase(null);
      return;
    }

    function onDataReceived(
      payload: Uint8Array,
      _participant?: unknown,
      _kind?: unknown,
      topic?: string
    ) {
      if (topic !== 'voca.session') return;
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text) as { phase?: BackendPhase };
        if (data.phase) setBackendPhase(data.phase);
      } catch {
        // ignore invalid payloads
      }
    }

    room.on(RoomEvent.DataReceived, onDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, onDataReceived);
    };
  }, [room]);

  return useMemo(() => {
    const connected = room.state !== 'disconnected';
    return { phase: phaseFromBackend(backendPhase, connected) };
  }, [backendPhase, room.state]);
}
