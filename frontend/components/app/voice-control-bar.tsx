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
import { GlassButton } from '@/components/ui/glass-button';
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
        'mx-auto flex max-w-sm items-center justify-between gap-2 rounded-full border border-white/10 bg-white/5 p-2 shadow-[0_0_50px_rgba(255,255,255,0.05)] backdrop-blur-3xl transition-all duration-300 md:gap-4',
        className
      )}
      {...props}
    >
      <div className="flex gap-2">
        <GlassButton
          variant={microphoneToggle.enabled ? 'ghost' : 'danger'}
          size="icon"
          onClick={() => microphoneToggle.toggle()}
          aria-label={microphoneToggle.enabled ? 'Mute' : 'Unmute'}
        >
          {microphoneToggle.enabled ? (
            <MicrophoneIcon weight="bold" className="size-5" />
          ) : (
            <MicrophoneSlashIcon weight="bold" className="size-5" />
          )}
        </GlassButton>

        <GlassButton
          variant={chatOpen ? 'primary' : 'ghost'}
          size="icon"
          onClick={handleToggleTranscript}
          aria-label="Toggle transcript"
        >
          <ChatTextIcon weight="bold" className="size-5" />
        </GlassButton>
      </div>

      <GlassButton
        variant="danger"
        size="md"
        onClick={handleDisconnect}
        disabled={!isSessionActive}
        className="min-w-[140px] flex-1 text-[11px] font-black tracking-widest uppercase md:text-xs"
      >
        <PhoneDisconnectIcon weight="bold" className="size-4" />
        Stop
      </GlassButton>
    </div>
  );
}
