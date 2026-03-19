'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import * as Icons from '@phosphor-icons/react';
import { Container } from './container';
import { GlassButton } from './glass-button';
import { GlassCard } from './glass-card';

const FEATURES = [
  {
    title: 'Murf Falcon TTS',
    description: 'Sub-130ms voice synthesis. Murf Falcon is the fastest production-grade neural TTS — responses feel instant.',
    icon: Icons.WaveformIcon,
  },
  {
    title: 'Voice-First Interface',
    description: 'No buttons, no forms. Just speak naturally — the agent listens, thinks, and responds in real time.',
    icon: Icons.MicrophoneIcon,
  },
  {
    title: 'Multilingual Support',
    description: 'Automatic language detection across 13+ languages. Switch languages mid-conversation without any configuration.',
    icon: Icons.TranslateIcon,
  },
  {
    title: 'Gemini 2.5 Flash LLM',
    description: 'Google Gemini 2.5 Flash powers every response — context-aware, fast, and genuinely helpful.',
    icon: Icons.CpuIcon,
  },
  {
    title: 'LiveKit WebRTC',
    description: 'Production-grade real-time audio transport with <50ms round-trip and full barge-in interruption.',
    icon: Icons.BroadcastIcon,
  },
  {
    title: 'Deepgram Nova-3 STT',
    description: 'State-of-the-art multilingual speech recognition with live interim results and per-utterance language detection.',
    icon: Icons.SpeakerHighIcon,
  },
];

export const Features = () => {
  return (
    <section id="features" className="relative z-10 py-24 md:py-32">
      <Container>
        <div className="mb-16 text-center">
          <motion.h2
            className="text-4xl font-black tracking-tight text-white sm:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            The Full Stack Behind Voca
          </motion.h2>
          <motion.p
            className="mx-auto mt-5 max-w-2xl text-base text-white/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Every component is production-grade. The voice pipeline you experience in the demo
            is the same one running in production.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <GlassCard
                intensity="medium"
                glowColor="rgba(34,211,238,0.08)"
                className="group h-full p-7 transition-all hover:-translate-y-1"
                style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}
              >
                <div className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-400 transition-transform group-hover:scale-110">
                  <feature.icon size={22} weight="duotone" />
                </div>
                <h3 className="text-base font-bold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export const CTASection = () => {
  return (
    <section className="relative z-10 w-full py-24">
      <Container>
        <div
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 px-8 py-20 text-center md:px-16 md:py-28"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(24px)' }}
        >
          <div className="relative z-10 mx-auto max-w-3xl">
            <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Try Voca{' '}
              <span style={{ background: 'linear-gradient(90deg,#22d3ee,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Right Now
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/55">
              Allow microphone access and start speaking in any language.
              The agent greets you, detects your language, and responds in under 150ms.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/demo">
                <GlassButton variant="primary" size="lg" className="w-full px-10 sm:w-auto">
                  Start Live Demo
                </GlassButton>
              </Link>
              <Link href="/about">
                <GlassButton variant="ghost" size="lg" className="w-full px-10 sm:w-auto">
                  Learn How It Works
                </GlassButton>
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full bg-cyan-500/15 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-indigo-500/15 blur-[80px]" />
        </div>
      </Container>
    </section>
  );
};
