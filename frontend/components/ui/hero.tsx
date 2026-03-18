'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Button } from './button';
import { Container } from './container';
import { GlassButton } from './glass-button';

export const Hero = () => {
  return (
    <section className="relative flex h-screen items-start justify-center overflow-hidden pt-36 pb-16 md:pb-24">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="bg-primary/20 absolute -top-[25%] -left-[10%] h-[1000px] w-[1000px] rounded-full blur-[120px]" />
        <div className="bg-accentDark/10 absolute top-[20%] -right-[10%] h-[800px] w-[800px] rounded-full blur-[100px]" />
      </div>

      <Container className="relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-muted-foreground inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
              The Future of Real-time Interaction
            </span>
          </motion.div>

          <motion.div
            className="from-foreground via-foreground/90 to-background/50 mt-6 bg-gradient-to-b bg-clip-text text-5xl leading-[1.1] font-extrabold tracking-tight text-transparent sm:text-7xl lg:text-[6rem]"
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          >
            Voice-First <br />
            Intelligence.
          </motion.div>

          <motion.p
            className="text-muted-foreground mx-auto mt-8 max-w-2xl text-lg font-medium tracking-wide sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Voca is a premium, real-time AI conversational engine that redefines how humans interact
            with technology. Experience absolute flawless latency.
          </motion.p>

          <motion.div
            className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/demo">
              <GlassButton variant="primary" size="lg" className="w-full px-12 text-base sm:w-auto">
                Launch Experience
              </GlassButton>
            </Link>
            <Link href="#features">
              <GlassButton
                variant="secondary"
                size="lg"
                className="w-full px-12 text-base sm:w-auto"
              >
                Explore Features
              </GlassButton>
            </Link>
          </motion.div>

          <motion.div
            className="text-muted-foreground mt-20 flex flex-wrap items-center justify-center gap-8 text-sm font-medium grayscale transition-all hover:grayscale-0 md:gap-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <span>POWERED BY MURF FALCON</span>
            <span>LIVEKIT AGENTS</span>
            <span>NEXT.JS 15</span>
            <span>REAL-TIME VOICE</span>
          </motion.div>
        </div>
      </Container>

      {/* Scroll Down Hint */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-white/40"
            animate={{ y: [0, 16, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      </motion.div>
    </section>
  );
};
