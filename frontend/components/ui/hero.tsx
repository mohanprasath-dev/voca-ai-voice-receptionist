'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion } from 'motion/react';
import { Container } from './container';
import { LandingButton } from './landing-button';
import { BlurText } from '../reactbits/BlurText';
import { SpotlightCard } from '../reactbits/SpotlightCard';

export const Hero = () => {
  const containerRef = useRef(null);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-svh items-center justify-center overflow-hidden px-6 pb-24 pt-28"
    >
      <Container className="relative z-10">
        <div className="flex flex-col items-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-sm"
          >
            <div className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-300 uppercase">
              Murf Falcon · Deepgram · Gemini 2.5
            </span>
          </motion.div>

          {/* Title */}
          <div className="text-center">
            <h1 className="sr-only">VOCA — AI Voice Agent</h1>
            <div className="flex justify-center mb-4">
              <BlurText
                text="VOCA"
                delay={120}
                animateBy="letters"
                className="text-7xl font-black tracking-[0.25em] text-white sm:text-8xl md:text-9xl"
              />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mx-auto mt-4 max-w-xl text-lg font-medium text-white/65 sm:text-xl"
            >
              Real-time AI voice agent. Speak in English, Hindi, or Tamil —
              it understands, responds, and adapts instantly.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
            >
              <Link href="/demo">
                <LandingButton variant="primary" className="w-full sm:w-auto px-10 py-5 text-base">
                  Try Live Demo →
                </LandingButton>
              </Link>
              <Link href="/about">
                <LandingButton variant="secondary" className="w-full sm:w-auto px-10 py-5 text-base">
                  How It Works
                </LandingButton>
              </Link>
            </motion.div>
          </div>

          {/* Tech stack cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-5 md:grid-cols-3"
          >
            {[
              {
                title: '< 130ms Latency',
                desc: 'Murf Falcon model delivers the fastest production TTS — responses feel instant.',
              },
              {
                title: 'EN · HI · TA',
                desc: 'Speaks and understands English, Hindi, and Tamil with automatic language switching.',
              },
              {
                title: 'Interrupt Anytime',
                desc: 'Full barge-in support via LiveKit WebRTC. You control the conversation.',
              },
            ].map((card, i) => (
              <SpotlightCard
                key={i}
                className="border-white/8 bg-black/35 p-7 text-left backdrop-blur-md group"
              >
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {card.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/50">{card.desc}</p>
              </SpotlightCard>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
};
