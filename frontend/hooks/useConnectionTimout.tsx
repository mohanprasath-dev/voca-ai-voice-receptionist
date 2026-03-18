import { useEffect } from 'react';
import { type AgentState, useRoomContext, useVoiceAssistant } from '@livekit/components-react';

function isAgentAvailable(agentState: AgentState) {
  return agentState == 'listening' || agentState == 'thinking' || agentState == 'speaking';
}

export function useConnectionTimeout(timout = 20_000) {
  const room = useRoomContext();
  const { state: agentState } = useVoiceAssistant();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isAgentAvailable(agentState)) {
        const reason =
          agentState === 'connecting'
            ? 'Agent did not join the room. '
            : 'Agent connected but did not complete initializing. ';

        console.warn('Session ended:', reason);

        room.disconnect();
      }
    }, timout);

    return () => clearTimeout(timeout);
  }, [agentState, room, timout]);
}
