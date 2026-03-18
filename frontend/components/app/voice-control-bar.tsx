'use client';

import { type HTMLAttributes, useCallback, useState } from 'react';
import { Track } from 'livekit-client';
import { useRemoteParticipants } from '@livekit/components-react';
import {
  ChatTextIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  PhoneDisconnectIcon,
} from '@phosphor-icons/react/dist/ssr';
import { useSession } from '@/components/app/session-provider';
import { Button } from '@/components/ui/button';
import { useInputControls } from '@/hooks/useInputControls';
import { cn } from '@/lib/utils';

export interface VoiceControlBarProps {
  isChatOpen?: boolean;
  onDisconnect?: () => void;
  onChatOpenChange?: (open: boolean) => void;
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
}

export function VoiceControlBar({
  isChatOpen,
  onDisconnect,
  onDeviceError,
  onChatOpenChange,
  className,
  ...props
}: VoiceControlBarProps & HTMLAttributes<HTMLDivElement>) {
  const participants = useRemoteParticipants();
  const [internalChatOpen, setInternalChatOpen] = useState(false);
  const chatOpen = isChatOpen !== undefined ? isChatOpen : internalChatOpen;
  const { isSessionActive, endSession } = useSession();

  const { microphoneToggle } = useInputControls({ onDeviceError });

  const handleToggleTranscript = useCallback(() => {
    const newState = !chatOpen;
    setInternalChatOpen(newState);
    onChatOpenChange?.(newState);
  }, [onChatOpenChange, chatOpen]);

  const handleDisconnect = useCallback(async () => {
    endSession();
    onDisconnect?.();
  }, [endSession, onDisconnect]);

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-full border border-white/10 bg-black/60 p-2.5 shadow-2xl backdrop-blur-2xl transition-all duration-300',
        className
      )}
      {...props}
    >
      <div className="flex gap-2">
        <button
          onClick={() => microphoneToggle.toggle()}
          className={cn(
            'flex size-12 items-center justify-center rounded-full transition-all duration-500 active:scale-90',
            microphoneToggle.enabled
              ? 'text-foreground bg-white/5 hover:bg-white/15'
              : 'bg-rose-500/15 text-rose-500 hover:bg-rose-500/25'
          )}
          aria-label={microphoneToggle.enabled ? 'Mute' : 'Unmute'}
        >
          {microphoneToggle.enabled ? (
            <MicrophoneIcon weight="bold" className="size-5" />
          ) : (
            <MicrophoneSlashIcon weight="bold" className="size-5" />
          )}
        </button>

        <button
          onClick={handleToggleTranscript}
          className={cn(
            'flex size-12 items-center justify-center rounded-full transition-all duration-500 active:scale-90',
            chatOpen
              ? 'bg-foreground text-background'
              : 'text-foreground bg-white/5 hover:bg-white/15'
          )}
          aria-label="Toggle transcript"
        >
          <ChatTextIcon weight="bold" className="size-5" />
        </button>
      </div>

      <Button
        variant="destructive"
        onClick={handleDisconnect}
        disabled={!isSessionActive}
        className="shadow-destructive/20 h-12 rounded-full px-8 text-xs font-black tracking-[0.15em] uppercase shadow-lg"
      >
        <PhoneDisconnectIcon weight="bold" className="mr-2.5 size-4" />
        End Session
      </Button>
    </div>
  );
}
