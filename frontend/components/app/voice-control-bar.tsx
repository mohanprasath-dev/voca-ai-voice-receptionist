'use client';

import { type HTMLAttributes, useCallback, useState } from 'react';
import { Track } from 'livekit-client';
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
  const [internalChatOpen, setInternalChatOpen] = useState(false);
  const chatOpen = isChatOpen !== undefined ? isChatOpen : internalChatOpen;
  const { isSessionActive, endSession } = useSession();
  const { microphoneToggle } = useInputControls({ onDeviceError });

  const handleToggleTranscript = useCallback(() => {
    const next = !chatOpen;
    setInternalChatOpen(next);
    onChatOpenChange?.(next);
  }, [chatOpen, onChatOpenChange]);

  const handleDisconnect = useCallback(async () => {
    endSession();
    onDisconnect?.();
  }, [endSession, onDisconnect]);

  return (
    <div
      className={cn(
        'mx-auto flex w-fit min-w-[300px] items-center justify-between gap-3 rounded-full border border-white/10 bg-black/50 p-2.5 backdrop-blur-3xl transition-all duration-300 md:gap-4',
        className
      )}
      {...props}
    >
      <div className="flex gap-2">
        <GlassButton
          variant={microphoneToggle.enabled ? 'primary' : 'danger'}
          size="icon"
          className="size-12 rounded-full"
          onClick={() => microphoneToggle.toggle()}
          aria-label={microphoneToggle.enabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {microphoneToggle.enabled ? (
            <MicrophoneIcon weight="bold" className="size-5" />
          ) : (
            <MicrophoneSlashIcon weight="bold" className="size-5" />
          )}
        </GlassButton>

        <GlassButton
          variant={chatOpen ? 'secondary' : 'ghost'}
          size="icon"
          className="size-12 rounded-full"
          onClick={handleToggleTranscript}
          aria-label="Toggle transcript"
        >
          <ChatTextIcon weight="bold" className="size-5 text-white/80" />
        </GlassButton>
      </div>

      <GlassButton
        variant="danger"
        size="md"
        onClick={handleDisconnect}
        disabled={!isSessionActive}
        className="h-12 flex-1 rounded-full px-6 text-[11px] font-black tracking-widest uppercase md:text-xs"
      >
        <PhoneDisconnectIcon weight="bold" className="size-4 mr-1.5" />
        End Call
      </GlassButton>
    </div>
  );
}
