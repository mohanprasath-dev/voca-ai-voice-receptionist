'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { motion } from 'motion/react';
import type { AppConfig } from '@/app-config';
import { ChatTranscript } from '@/components/app/chat-transcript';
import { BudgetIndicator } from '@/components/app/budget-indicator';
import { DemoScenarioPanel } from '@/components/app/demo-scenario-panel';
import { InterruptHint } from '@/components/app/interrupt-hint';
import { LatencyDebugPanel } from '@/components/app/latency-debug-panel';
import { LiveMetricsPanel } from '@/components/app/live-metrics-panel';
import { PreConnectMessage } from '@/components/app/preconnect-message';
import { TileLayout } from '@/components/app/tile-layout';
import { VoiceStatusPill } from '@/components/app/voice-status-pill';
import {
  AgentControlBar,
  type ControlBarControls,
} from '@/components/livekit/agent-control-bar/agent-control-bar';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConnectionHealth } from '@/hooks/useConnectionHealth';
import { useConnectionTimeout } from '@/hooks/useConnectionTimout';
import { useDebugMode } from '@/hooks/useDebug';
import { useLiveMetrics } from '@/hooks/useLiveMetrics';
import { useVoiceSessionState } from '@/hooks/useVoiceSessionState';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../livekit/scroll-area/scroll-area';

const MotionBottom = motion.create('div');

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut',
  },
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}
interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  useConnectionTimeout(200_000);
  useDebugMode({ enabled: IN_DEVELOPMENT });

  const messages = useChatMessages();
  const { phase } = useVoiceSessionState();
  const metrics = useLiveMetrics();
  const { connectionHealth } = useConnectionHealth();
  const room = useRoomContext();
  const [chatOpen, setChatOpen] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Ingest queue position from room session data
  useEffect(() => {
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
        const data = JSON.parse(text) as { queue_position?: number };
        if (typeof data.queue_position === 'number') {
          setQueuePosition(data.queue_position);
        }
      } catch {
        // Ignore invalid payloads.
      }
    }
    
    room.on(RoomEvent.DataReceived, onDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, onDataReceived);
    };
  }, [room]);

  const budgetSnapshot = {
    sttSecondsUsed: 0,
    ttsSecondsUsed: 0,
    charUsed: 0,
    activeSessions: 1,
    mode: (metrics.budgetMode ?? 'normal') as 'normal' | 'near_limit' | 'hard_limit',
    budgetUsagePercentage: metrics.budgetUsagePercentage,
  };

  const controls: ControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsVideoInput,
  };

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section className="bg-background relative z-10 h-full w-full overflow-hidden" {...props}>
      {/* Chat Transcript */}
      <div
        className={cn(
          'fixed inset-0 grid grid-cols-1 grid-rows-1',
          !chatOpen && 'pointer-events-none'
        )}
      >
        <Fade top className="absolute inset-x-4 top-0 h-40" />
        <ScrollArea ref={scrollAreaRef} className="px-4 pt-40 pb-37.5 md:px-6 md:pb-45">
          <ChatTranscript
            hidden={!chatOpen}
            messages={messages}
            className="mx-auto max-w-2xl space-y-3 transition-opacity duration-300 ease-out"
          />
        </ScrollArea>
      </div>

      {/* Tile Layout */}
      <TileLayout chatOpen={chatOpen} />

      <div className="pointer-events-none fixed top-4 left-4 z-50 flex flex-col gap-2 md:top-8 md:left-8">
        <VoiceStatusPill phase={phase} />
        <BudgetIndicator budget={budgetSnapshot} />
        {queuePosition !== null && queuePosition > 0 && (
          <div className="bg-background/90 border-input/60 rounded-md border px-3 py-2 text-xs shadow-sm">
            <div className="font-medium text-amber-700">Queue: #{queuePosition}</div>
          </div>
        )}
        <LiveMetricsPanel metrics={metrics} />
        <LatencyDebugPanel latencyMs={metrics.avgResponseLatencyMs} connectionHealth={connectionHealth} />
        <DemoScenarioPanel />
      </div>

      {/* Bottom */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        {appConfig.isPreConnectBufferEnabled && (
          <PreConnectMessage messages={messages} className="pb-4" />
        )}
        <div className="bg-background relative mx-auto max-w-2xl pb-3 md:pb-12">
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
          <div className="px-2 pb-2">
            <InterruptHint phase={phase} />
          </div>
          <AgentControlBar controls={controls} onChatOpenChange={setChatOpen} />
        </div>
      </MotionBottom>
    </section>
  );
};
