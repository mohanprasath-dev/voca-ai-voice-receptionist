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
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-6 pt-28"
      {...props}
    >
      <Container className="relative z-10 max-w-3xl text-center">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="mb-8 inline-flex size-16 items-center justify-center rounded-2xl border border-white/15 bg-white/8 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
        >
          <Icons.WaveformIcon className="size-7 text-cyan-400" weight="duotone" />
        </motion.div>

        {/* Heading */}
        <div className="mb-5 flex justify-center">
          <BlurText
            text="Your AI Voice Agent"
            delay={80}
            animateBy="words"
            className="text-4xl font-black tracking-tight text-white sm:text-6xl"
          />
        </div>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mx-auto max-w-md text-base leading-relaxed text-white/60"
        >
          Speak naturally in English, Hindi, or Tamil. Interrupt anytime.
          Powered by Murf Falcon TTS for sub-150ms responses.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <Button
            size="lg"
            onClick={onStartCall}
            className="h-14 rounded-2xl bg-white px-12 font-bold tracking-wide text-black shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all duration-200 hover:scale-[1.02] hover:bg-white/92 active:scale-[0.98]"
          >
            <span className="flex items-center gap-2">
              {startButtonText}
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
                →
              </motion.span>
            </span>
          </Button>
        </motion.div>

        {/* Feature chips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {[
            { icon: Icons.MicrophoneIcon,   label: 'Voice Enabled',    sub: 'Deepgram Nova-3 STT',       color: 'text-emerald-400' },
            { icon: Icons.TranslateIcon,    label: 'EN · HI · TA',     sub: 'Auto language switch',      color: 'text-cyan-400' },
            { icon: Icons.WaveformIcon,     label: 'Murf Falcon TTS',  sub: '< 150ms voice response',    color: 'text-purple-400' },
          ].map((item, i) => (
            <SpotlightCard
              key={i}
              className="flex flex-col items-center gap-2 border-white/8 bg-black/30 p-5 backdrop-blur-md"
            >
              <item.icon className={`size-5 ${item.color}`} weight="duotone" />
              <span className="text-[11px] font-black tracking-widest text-white uppercase">{item.label}</span>
              <span className="text-[10px] text-white/35">{item.sub}</span>
            </SpotlightCard>
          ))}
        </motion.div>
      </Container>
    </div>
  );
};
