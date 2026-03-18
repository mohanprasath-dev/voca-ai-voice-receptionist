'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Microphone, ShieldCheck, SpeakerHigh } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ...props
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div className="bg-background flex h-full w-full items-center justify-center p-6" {...props}>
      <Container className="max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-foreground mb-12 inline-flex size-24 items-center justify-center rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.1)]"
        >
          <SpeakerHigh className="text-background size-10" weight="fill" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold tracking-tight sm:text-6xl"
        >
          Ready to Talk?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-6 text-lg leading-relaxed"
        >
          Step into a seamless voice-first experience. Voca is ready to assist you in real-time with
          zero latency.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <Button
            size="lg"
            onClick={onStartCall}
            className="h-16 px-12 text-xl font-bold shadow-2xl"
          >
            {startButtonText}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 grid grid-cols-1 gap-8 border-t border-white/5 pt-12 sm:grid-cols-3"
        >
          <div className="flex flex-col items-center gap-2">
            <Microphone className="size-5 text-emerald-400" weight="bold" />
            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Voice Enabled
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="size-5 text-blue-400" weight="bold" />
            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Secure Path
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <SpeakerHigh className="size-5 text-amber-400" weight="bold" />
            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Real-time Audio
            </span>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};
