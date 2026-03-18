'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ChartPieSlice,
  Cpu,
  Globe,
  Lightning,
  Microphone,
  SpeakerHigh,
} from '@phosphor-icons/react';
import { Button } from './button';
import { Container } from './container';
import { GlassButton } from './glass-button';
import { GlassCard } from './glass-card';

const FEATURES = [
  {
    title: 'Ultra-Low Latency',
    description:
      'Powered by Murf Falcon, experience response times that feel natural and human-like.',
    icon: Lightning,
  },
  {
    title: 'Voice-First UX',
    description: 'Replaces traditional interfaces with an intuitive conversational flow.',
    icon: SpeakerHigh,
  },
  {
    title: 'Multilingual Support',
    description: 'Seamlessly switch between languages with native-level fluency and accent.',
    icon: Globe,
  },
  {
    title: 'Intent Intelligence',
    description: 'Advanced NLU to understand complex requests and provide accurate responses.',
    icon: Cpu,
  },
  {
    title: 'Real-time Analytics',
    description: 'Monitor session health, budget, and performance metrics as they happen.',
    icon: ChartPieSlice,
  },
  {
    title: 'Crystal Clear Audio',
    description: 'High-fidelity voice synthesis that captures emotion and nuance.',
    icon: Microphone,
  },
];

export const Features = () => {
  return (
    <section id="features" className="relative z-10 py-24 md:py-32">
      <Container>
        <div className="text-center">
          <motion.h2
            className="bg-gradient-to-br from-white to-white/60 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Engineered for <br className="sm:hidden" /> Perfect Conversations.
          </motion.h2>
          <motion.p
            className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Voca combines state-of-the-art AI models with a focus on real-time performance and user
            experience.
          </motion.p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard
                intensity="medium"
                glowColor="rgba(56,189,248,0.1)"
                className="group h-full p-8 transition-all hover:-translate-y-2 hover:bg-white/10"
              >
                <div className="bg-primary/20 text-primary mb-6 inline-flex size-14 items-center justify-center rounded-2xl p-2.5 shadow-[0_0_30px_rgba(56,189,248,0.3)] transition-transform group-hover:scale-110">
                  <feature.icon size={28} weight="duotone" />
                </div>
                <h3 className="text-foreground text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground mt-4 leading-relaxed font-medium">
                  {feature.description}
                </p>
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
        <GlassCard
          intensity="high"
          glowColor="rgba(56,189,248,0.2)"
          className="relative overflow-hidden px-8 py-20 text-center md:px-16 md:py-28"
        >
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
              Ready to{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Revolutionize
              </span>{' '}
              Your CX?
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed font-medium text-white/70">
              Integrate Voca’s voice AI to deliver unparalleled customer experiences. Get started
              with our demo or talk to our sales team today.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Link href="/demo">
                <GlassButton
                  variant="primary"
                  size="lg"
                  className="w-full px-12 text-base sm:w-auto"
                >
                  Try the Demo
                </GlassButton>
              </Link>
              <Link href="/contact">
                <GlassButton variant="ghost" size="lg" className="w-full px-12 text-base sm:w-auto">
                  Contact Sales
                </GlassButton>
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden mix-blend-screen">
            <div className="bg-primary/40 absolute -top-[50%] -left-[20%] h-[800px] w-[800px] rounded-full blur-[150px]" />
            <div className="absolute -right-[20%] -bottom-[50%] h-[800px] w-[800px] rounded-full bg-blue-500/30 blur-[150px]" />
          </div>
        </GlassCard>
      </Container>
    </section>
  );
};
