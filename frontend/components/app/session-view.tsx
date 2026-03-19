'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useRoomContext } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { BudgetIndicator } from '@/components/app/budget-indicator';
import { ConnectionIndicator } from '@/components/app/connection-indicator';
import { InterruptHint } from '@/components/app/interrupt-hint';
import { LatencyDebugPanel } from '@/components/app/latency-debug-panel';
import { LiveMetricsPanel } from '@/components/app/live-metrics-panel';
import { QueuePositionIndicator } from '@/components/app/queue-position-indicator';
import { AgentConfigPanel } from '@/components/app/agent-config-panel';
import { useSession } from '@/components/app/session-provider';
import { TranscriptView } from '@/components/app/transcript-view';
import { VoiceControlBar } from '@/components/app/voice-control-bar';
import { VoiceOrb } from '@/components/app/voice-orb';
import { VoiceStatusPill } from '@/components/app/voice-status-pill';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConnectionTimeout } from '@/hooks/useConnectionTimout';
import { useLiveMetrics } from '@/hooks/useLiveMetrics';
import { useVoiceSessionState } from '@/hooks/useVoiceSessionState';
import { useRoom } from '@/hooks/useRoom';
import { useAgentConfigContext } from '@/components/app/agent-config-provider';

interface SessionViewProps {
  appConfig: AppConfig;
  onAnimationComplete?: () => void;
}

export const SessionView = ({ ...props }: React.ComponentProps<'section'> & SessionViewProps) => {
  useConnectionTimeout(200_000);

  const [chatOpen, setChatOpen] = useState(false);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const messages = useChatMessages();
  const { phase } = useVoiceSessionState();
  const room = useRoomContext();
  const { queuePosition } = useSession();
  const liveMetrics = useLiveMetrics();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Agent configuration hook
  const { config, updateConfig, getFinalConfig } = useAgentConfigContext();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <section
      className="ambient-bg noise-overlay relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#050505] font-sans selection:bg-cyan-500/30"
      {...props}
    >
      {/* Deep Space Background Glows */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden mix-blend-screen">
        <motion.div
          animate={{
            scale: phase === 'listening' ? 1.4 : phase === 'speaking' ? 1.6 : 1,
            opacity: phase === 'listening' ? 0.3 : phase === 'speaking' ? 0.4 : 0.15,
          }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/30 blur-[150px]"
        />
        <div className="absolute -bottom-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-[100%] bg-blue-500/12 blur-[120px]" />
        <div className="absolute top-16 right-[-140px] h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* Floating Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute top-8 right-0 left-0 z-50 flex w-full items-center justify-between gap-3 px-6 md:px-12"
      >
        <ConnectionIndicator state={room.state} />
        <div className="flex items-center gap-3">
          <QueuePositionIndicator queuePosition={queuePosition} />
          <BudgetIndicator metrics={liveMetrics} />
          <VoiceStatusPill phase={phase} />
        </div>
      </motion.div>

      {/* Center Voice Orb - Absolute Dead Center */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <VoiceOrb
          phase={phase}
          isSessionActive={room.state === 'connected'}
          className="scale-[1.2] md:scale-[1.5]"
        />
      </div>

      {/* Floating Conversation Layer */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            ref={scrollAreaRef}
            initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, filter: 'blur(10px)', transition: { duration: 0.2 } }}
            className="no-scrollbar absolute bottom-32 left-1/2 z-40 max-h-[40vh] w-full max-w-2xl -translate-x-1/2 overflow-y-auto scroll-smooth px-4"
            style={{
              maskImage:
                'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
            }}
          >
            <TranscriptView messages={messages} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Control Bar */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="absolute bottom-8 left-0 z-50 flex w-full justify-center px-4"
      >
        <VoiceControlBar isChatOpen={chatOpen} onChatOpenChange={setChatOpen} />
      </motion.div>

      {/* Side panels */}
      <div className="pointer-events-none absolute right-6 bottom-28 z-50 hidden flex-col items-end gap-3 md:flex">
        <InterruptHint show={phase === 'speaking'} />
        <LiveMetricsPanel metrics={liveMetrics} />
        <LatencyDebugPanel metrics={liveMetrics} />
      </div>

      {/* Agent Configuration Panel */}
      <AgentConfigPanel
        config={config}
        onConfigChange={updateConfig}
        isOpen={configPanelOpen}
        onToggle={() => setConfigPanelOpen(!configPanelOpen)}
      />
    </section>
  );
};
