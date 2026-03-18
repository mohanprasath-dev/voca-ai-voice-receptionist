import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Room, RoomEvent, TokenSource } from 'livekit-client';
import { AppConfig } from '@/app-config';

export interface RoomHookState {
  room: Room;
  isSessionActive: boolean;
  queuePosition: number | null;
  restoredAfterDisconnect: boolean;
  startSession: () => void;
  endSession: () => void;
}

export function useRoom(appConfig: AppConfig): RoomHookState {
  const aborted = useRef(false);
  const room = useMemo(() => new Room(), []);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [restoredAfterDisconnect, setRestoredAfterDisconnect] = useState(false);

  useEffect(() => {
    function onDisconnected() {
      setIsSessionActive(false);
    }

    function onConnected() {
      setRestoredAfterDisconnect(true);
    }

    function onDataReceived(
      payload: Uint8Array,
      _participant?: unknown,
      _kind?: unknown,
      topic?: string
    ) {
      if (topic !== 'voca.session') {
        return;
      }
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text) as {
          queue_position?: number;
          restored_after_disconnect?: boolean;
        };
        if (typeof data.queue_position === 'number') {
          setQueuePosition(data.queue_position);
        }
        if (typeof data.restored_after_disconnect === 'boolean') {
          setRestoredAfterDisconnect(data.restored_after_disconnect);
        }
      } catch {
        // Ignore non-JSON data payloads.
      }
    }

    function onMediaDevicesError(error: Error) {
      console.error('Encountered an error with your media devices:', error);
    }

    room.on(RoomEvent.Disconnected, onDisconnected);
    room.on(RoomEvent.Connected, onConnected);
    room.on(RoomEvent.MediaDevicesError, onMediaDevicesError);
    room.on(RoomEvent.DataReceived, onDataReceived);

    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.Connected, onConnected);
      room.off(RoomEvent.MediaDevicesError, onMediaDevicesError);
      room.off(RoomEvent.DataReceived, onDataReceived);
    };
  }, [room]);

  useEffect(() => {
    return () => {
      aborted.current = true;
      room.disconnect();
    };
  }, [room]);

  const tokenSource = useMemo(
    () =>
      TokenSource.custom(async () => {
        const url = new URL(
          process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? '/api/connection-details',
          window.location.origin
        );

        try {
          const res = await fetch(url.toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Sandbox-Id': appConfig.sandboxId ?? '',
            },
            body: JSON.stringify({
              room_config: appConfig.agentName
                ? {
                    agents: [{ agent_name: appConfig.agentName }],
                  }
                : undefined,
            }),
          });
          return await res.json();
        } catch (error) {
          console.error('Error fetching connection details:', error);
          throw new Error('Error fetching connection details!');
        }
      }),
    [appConfig]
  );

  const startSession = useCallback(() => {
    setIsSessionActive(true);

    if (room.state === 'disconnected') {
      const { isPreConnectBufferEnabled } = appConfig;
      Promise.all([
        room.localParticipant.setMicrophoneEnabled(true, undefined, {
          preConnectBuffer: isPreConnectBufferEnabled,
        }),
        tokenSource
          .fetch({ agentName: appConfig.agentName })
          .then((connectionDetails) =>
            room.connect(connectionDetails.serverUrl, connectionDetails.participantToken)
          ),
      ]).catch((error) => {
        if (aborted.current) {
          // Once the effect has cleaned up after itself, drop any errors
          //
          // These errors are likely caused by this effect rerunning rapidly,
          // resulting in a previous run `disconnect` running in parallel with
          // a current run `connect`
          return;
        }

        console.error('There was an error connecting to the agent:', error);
      });
    }
  }, [room, appConfig, tokenSource]);

  const endSession = useCallback(() => {
    setIsSessionActive(false);
  }, []);

  return {
    room,
    isSessionActive,
    startSession,
    endSession,
    queuePosition,
    restoredAfterDisconnect,
  };
}
