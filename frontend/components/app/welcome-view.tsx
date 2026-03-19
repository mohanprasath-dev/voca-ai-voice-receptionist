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
    <div
      className="ambient-bg noise-overlay relative flex h-full w-full items-center justify-center overflow-hidden p-6"
      {...props}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-220px] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/18 blur-[140px]" />
        <div className="absolute bottom-[-260px] left-[10%] h-[600px] w-[600px] rounded-full bg-indigo-500/12 blur-[160px]" />
      </div>

      <Container className="relative z-10 max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass mb-10 inline-flex size-24 items-center justify-center rounded-[2rem] shadow-[0_0_70px_rgba(34,211,238,0.12)]"
        >
          <SpeakerHigh className="size-10 text-white/90" weight="fill" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
        >
          <span className="text-gradient-ai">Premium</span> voice,
          <br />
          in real time.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-lg leading-relaxed text-white/70"
        >
          Talk naturally. Interrupt anytime. Voca listens, thinks, and responds with
          production-grade latency.
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
            variant="glow"
            className="glass h-16 px-12 text-lg font-bold tracking-wide shadow-[0_0_70px_rgba(34,211,238,0.12)] transition-transform active:scale-[0.98]"
          >
            {startButtonText}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-1 gap-6 border-t border-white/10 pt-10 sm:grid-cols-3"
        >
          <div className="glass flex flex-col items-center gap-2 rounded-2xl px-5 py-4">
            <Microphone className="size-5 text-emerald-400" weight="bold" />
            <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">
              Voice Enabled
            </span>
          </div>
          <div className="glass flex flex-col items-center gap-2 rounded-2xl px-5 py-4">
            <ShieldCheck className="size-5 text-blue-400" weight="bold" />
            <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">
              Secure Path
            </span>
          </div>
          <div className="glass flex flex-col items-center gap-2 rounded-2xl px-5 py-4">
            <SpeakerHigh className="size-5 text-amber-400" weight="bold" />
            <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">
              Real-time Audio
            </span>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};
