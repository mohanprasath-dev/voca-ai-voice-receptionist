import { useEffect, useMemo, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import {
  type ReceivedChatMessage,
  type TextStreamData,
  useChat,
  useRoomContext,
  useTranscriptions,
} from '@livekit/components-react';

type AgentDataMessage = {
  id?: string;
  role?: 'agent' | 'user';
  message?: string;
  timestamp_ms?: number;
};

function transcriptionToChatMessage(textStream: TextStreamData, room: Room): ReceivedChatMessage {
  return {
    id: textStream.streamInfo.id,
    timestamp: textStream.streamInfo.timestamp,
    message: textStream.text,
    from:
      textStream.participantInfo.identity === room.localParticipant.identity
        ? room.localParticipant
        : Array.from(room.remoteParticipants.values()).find(
            (p) => p.identity === textStream.participantInfo.identity
          ),
  };
}

export function useChatMessages() {
  const chat = useChat();
  const room = useRoomContext();
  const transcriptions: TextStreamData[] = useTranscriptions();
  const [agentMessages, setAgentMessages] = useState<ReceivedChatMessage[]>([]);

  useEffect(() => {
    if (room.state === 'disconnected') {
      setAgentMessages([]);
      return;
    }

    function onDataReceived(
      payload: Uint8Array,
      _participant?: unknown,
      _kind?: unknown,
      topic?: string
    ) {
      if (topic !== 'voca.chat') return;
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text) as AgentDataMessage;
        if (data.role !== 'agent' || !data.message) return;
        const timestamp = typeof data.timestamp_ms === 'number' ? data.timestamp_ms : Date.now();
        setAgentMessages((current) => [
          ...current,
          {
            id: data.id ?? `${timestamp}`,
            timestamp,
            message: data.message ?? '',
            from: { isAgent: true } as unknown as ReceivedChatMessage['from'],
          },
        ]);
      } catch {
        // ignore invalid payloads
      }
    }

    room.on(RoomEvent.DataReceived, onDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, onDataReceived);
    };
  }, [room]);

  const mergedTranscriptions = useMemo(() => {
    const merged: Array<ReceivedChatMessage> = [
      ...transcriptions.map((transcription) => transcriptionToChatMessage(transcription, room)),
      ...chat.chatMessages,
      ...agentMessages,
    ];
    return merged.sort((a, b) => a.timestamp - b.timestamp);
  }, [transcriptions, chat.chatMessages, agentMessages, room]);

  return mergedTranscriptions;
}
