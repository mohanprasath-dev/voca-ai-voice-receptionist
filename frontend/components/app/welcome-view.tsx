'use client';

import React from 'react';
import { motion } from 'motion/react';
import * as Icons from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { BlurText } from '../reactbits/BlurText';
import { SpotlightCard } from '../reactbits/SpotlightCard';

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
      className="ambient-bg noise-overlay relative flex min-h-screen h-full w-full items-center justify-center overflow-hidden p-6 pt-24 bg-[#030303]"
      {...props}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-220px] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute bottom-[-260px] left-[10%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[160px]" />
      </div>

      <Container className="relative z-10 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="mb-10 inline-flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.1)]"
        >
          <Icons.SpeakerHighIcon className="size-8 text-cyan-400" weight="duotone" />
        </motion.div>

        <div className="mb-6 flex justify-center">
          <BlurText
            text="Premium Voice Experiences"
            delay={100}
            animateBy="words"
            className="text-4xl font-black tracking-tight text-white sm:text-7xl"
          />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/50 font-medium"
        >
          Talk naturally. Interrupt anytime. Voca listens, thinks, and responds with
          production-grade latency.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Button
            size="lg"
            onClick={onStartCall}
            className="relative overflow-hidden group bg-white text-black hover:bg-white/90 px-12 h-16 rounded-2xl font-bold tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              {startButtonText}
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {[
            { icon: Icons.MicrophoneIcon, label: 'Voice Enabled', color: 'text-emerald-400' },
            { icon: Icons.ShieldCheckIcon, label: 'Secure Path', color: 'text-blue-400' },
            { icon: Icons.SpeakerHighIcon, label: 'Real-time Audio', color: 'text-amber-400' }
          ].map((item, i) => (
            <SpotlightCard key={i} className="flex flex-col items-center gap-3 p-6 bg-white/5 border-white/5 group transition-all duration-300 hover:bg-white/10">
              <item.icon className={`size-6 ${item.color}`} weight="duotone" />
              <span className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase group-hover:text-white/70 transition-colors">
                {item.label}
              </span>
            </SpotlightCard>
          ))}
        </motion.div>
      </Container>
    </div>
  );
};
