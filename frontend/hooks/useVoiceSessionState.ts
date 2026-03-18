'use client';

import { useMemo } from 'react';
import { useRoomContext, useVoiceAssistant } from '@livekit/components-react';
import type { VoicePhase } from '@/lib/contracts';
import { resolveVoicePhase } from '@/lib/session-state';

export function useVoiceSessionState(): { phase: VoicePhase } {
  const room = useRoomContext();
  const { state } = useVoiceAssistant();

  return useMemo(() => {
    const phase = resolveVoicePhase({
      roomState: room.state,
      assistantState: String(state),
      isConnected: room.state !== 'disconnected',
    });
    return { phase };
  }, [room.state, state]);
}
