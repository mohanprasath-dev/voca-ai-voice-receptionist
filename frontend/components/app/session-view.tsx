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
import { useAgentConfigContext } from '@/components/app/agent-config-provider';
import { VariableProximity } from '../reactbits/VariableProximity';
import { SpotlightCard } from '../reactbits/SpotlightCard';

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
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { config, updateConfig } = useAgentConfigContext();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const getPhaseText = () => {
    switch (phase) {
      case 'listening': return 'LISTENING';
      case 'reasoning': return 'REASONING';
      case 'speaking': return 'SPEAKING';
      default: return 'IDLE';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'listening': return 'text-emerald-400';
      case 'reasoning': return 'text-cyan-400';
      case 'speaking': return 'text-blue-400';
      default: return 'text-white/40';
    }
  };

  return (
    <section
      ref={containerRef}
      className="ambient-bg noise-overlay relative flex h-[100dvh] w-full flex-col overflow-hidden bg-transparent font-sans selection:bg-cyan-500/30"
      {...props}
    >
      {/* Background Glows */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{
            scale: phase === 'listening' ? 1.4 : phase === 'speaking' ? 1.6 : 1,
            opacity: phase === 'listening' ? 0.3 : phase === 'speaking' ? 0.4 : 0.15,
            x: phase === 'listening' ? '-50%' : '-50%',
            y: phase === 'listening' ? '-50%' : '-50%',
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-[150px]"
        />
        <div className="absolute top-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      {/* Top Navigation / State */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-24 inset-x-0 z-50 flex items-center justify-between px-8 md:px-12"
      >
        <div className="flex items-center gap-6">
          <ConnectionIndicator state={room.state} />
          <div className="hidden md:block">
            <VariableProximity
              label={getPhaseText()}
              containerRef={containerRef}
              radius={60}
              fromFontVariationSettings="'wght' 500"
              toFontVariationSettings="'wght' 900"
              className={`text-xs font-black tracking-[0.4em] transition-colors duration-500 ${getPhaseColor()}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <QueuePositionIndicator queuePosition={queuePosition} />
          <BudgetIndicator metrics={liveMetrics} />
          <VoiceStatusPill phase={phase} />
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 items-center justify-center pt-32 pb-32 overflow-hidden">
        <div className="relative flex flex-col items-center w-full max-w-4xl px-4">
          {/* Central AI Orb */}
          <motion.div
            animate={{
              scale: phase === 'listening' ? 1.05 : phase === 'speaking' ? 1.1 : 1,
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="z-20 mb-8"
          >
            <VoiceOrb
              phase={phase}
              isSessionActive={room.state === 'connected'}
              className="scale-[1.2] md:scale-[1.5]"
            />
          </motion.div>

          {/* Transcript / Chat Overlay */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                ref={scrollAreaRef}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="no-scrollbar w-full max-h-[30vh] md:max-h-[40vh] overflow-y-auto scroll-smooth px-4 pb-10"
                style={{
                  maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                }}
              >
                <TranscriptView messages={messages} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side Metrics Panel */}
        <div className="pointer-events-none absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4">
          <SpotlightCard className="pointer-events-auto p-4 bg-white/5 border-white/5 backdrop-blur-xl w-64 shadow-2xl">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">System Intelligence</span>
                <LiveMetricsPanel metrics={liveMetrics} />
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Network Health</span>
                <LatencyDebugPanel metrics={liveMetrics} />
              </div>
            </div>
          </SpotlightCard>
          
          <AnimatePresence>
            {phase === 'speaking' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <InterruptHint show={true} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex w-full max-w-fit justify-center px-4"
      >
        <SpotlightCard className="bg-white/5 border-white/10 backdrop-blur-2xl rounded-2xl overflow-visible">
          <VoiceControlBar isChatOpen={chatOpen} onChatOpenChange={setChatOpen} />
        </SpotlightCard>
      </motion.div>

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
