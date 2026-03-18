'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useRoomContext } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { ConnectionIndicator } from '@/components/app/connection-indicator';
import { TranscriptView } from '@/components/app/transcript-view';
import { VoiceControlBar } from '@/components/app/voice-control-bar';
import { VoiceOrb } from '@/components/app/voice-orb';
import { VoiceStatusPill } from '@/components/app/voice-status-pill';
import { Container } from '@/components/ui/container';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConnectionTimeout } from '@/hooks/useConnectionTimout';
import { useVoiceSessionState } from '@/hooks/useVoiceSessionState';

interface SessionViewProps {
  appConfig: AppConfig;
  onAnimationComplete?: () => void;
}

export const SessionView = ({
  appConfig,
  onAnimationComplete,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  useConnectionTimeout(200_000);

  const [chatOpen, setChatOpen] = useState(false);
  const messages = useChatMessages();
  const { phase } = useVoiceSessionState();
  const room = useRoomContext();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript with smooth behavior
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
      className="bg-background relative flex h-full w-full flex-col overflow-hidden"
      {...props}
    >
      {/* Dynamic Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: phase === 'speaking' ? 1.2 : 1,
            opacity: phase === 'listening' ? 0.4 : 0.2,
          }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="bg-primary/20 absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        />
        <div className="bg-secondary/5 absolute top-0 right-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
      </div>

      <Container className="relative z-10 flex h-full max-w-4xl flex-col items-center justify-between py-6">
        {/* Top Header */}
        <div className="flex w-full items-center justify-between pb-4">
          <ConnectionIndicator state={room.state} />
          <VoiceStatusPill phase={phase} />
        </div>

        {/* Experience Zone */}
        <div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden">
          {/* Visual Orb */}
          {/* Refactored Voice Orb */}
          <div className="relative mb-8 flex items-center justify-center md:mb-12">
            <VoiceOrb phase={phase} isSessionActive={room.state === 'connected'} />
          </div>

          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <h2 className="text-foreground/80 text-2xl font-medium">
                  How can I help you today?
                </h2>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {chatOpen && (
              <motion.div
                ref={scrollAreaRef}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full flex-1 overflow-y-auto scroll-smooth p-4"
              >
                <TranscriptView messages={messages} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Control Bar */}
        <div className="w-full pt-4">
          <VoiceControlBar isChatOpen={chatOpen} onChatOpenChange={setChatOpen} />
        </div>
      </Container>
    </section>
  );
};
