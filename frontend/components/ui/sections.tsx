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
    <section id="features" className="py-24 md:py-32">
      <Container>
        <div className="text-center">
          <motion.h2
            className="text-4xl font-bold tracking-tight sm:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Engineered for <br className="sm:hidden" /> Perfect Conversations.
          </motion.h2>
          <motion.p
            className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Voca combines state-of-the-art AI models with a focus on real-time performance and user
            experience.
          </motion.p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-white/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-foreground text-background mb-6 inline-flex size-12 items-center justify-center rounded-2xl p-2.5 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-transform group-hover:scale-110">
                <feature.icon size={24} weight="bold" />
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground mt-4 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export const CTASection = () => {
  return (
    <section className="py-24">
      <Container>
        <div className="border-primary/20 bg-primary/10 relative overflow-hidden rounded-3xl border px-8 py-16 md:px-16 md:py-24">
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Ready to Revolutionize Your CX?
            </h2>
            <p className="text-primary-foreground/80 mt-6 text-lg">
              Integrate Voca’s voice AI to deliver unparalleled customer experiences. Get started
              with our demo or talk to our sales team today.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/demo">
                <Button size="lg" className="h-14 px-10 text-lg">
                  Try the Demo
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 bg-transparent px-10 text-lg text-white hover:bg-white/10 hover:text-white"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="bg-primary/50 absolute -top-48 -left-32 h-[500px] w-[500px] rounded-full blur-[120px]" />
            <div className="bg-accentDark/30 absolute -right-32 -bottom-48 h-[500px] w-[500px] rounded-full blur-[120px]" />
          </div>
        </div>
      </Container>
    </section>
  );
};
