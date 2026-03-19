'use client';

import { useRef } from 'react';
import { motion } from 'motion/react';
import * as Icons from '@phosphor-icons/react';
import { Container } from '@/components/ui/container';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { BlurText } from '@/components/reactbits/BlurText';
import { Lanyard } from '@/components/reactbits/Lanyard';

const TECH = [
  { title: 'Murf Falcon TTS', desc: 'Sub-130ms voice synthesis — Murf\'s fastest model for real-time AI conversation.', icon: Icons.WaveformIcon, color: 'text-cyan-400' },
  { title: 'Deepgram Nova-3', desc: 'Multilingual streaming speech-to-text with live interim results and language detection.', icon: Icons.MicrophoneIcon, color: 'text-emerald-400' },
  { title: 'Gemini 2.5 Flash', desc: 'Google\'s fastest LLM for real-time conversation generation with full context awareness.', icon: Icons.CpuIcon, color: 'text-purple-400' },
  { title: 'LiveKit WebRTC', desc: 'Production-grade real-time transport with barge-in interruption and noise cancellation.', icon: Icons.BroadcastIcon, color: 'text-blue-400' },
];

export default function AboutPage() {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} className="min-h-screen bg-transparent text-white overflow-x-hidden selection:bg-cyan-500/30">
      <Navbar />
      <main>

        {/* Hero */}
        <section className="relative z-10 w-full pt-44 pb-20">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <div className="flex justify-center mb-8">
                <BlurText
                  text="The Vision Behind Voca"
                  className="text-5xl font-black tracking-tight text-white sm:text-6xl"
                  delay={100}
                />
              </div>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-lg leading-relaxed text-white/50"
              >
                Voice is the most natural human interface. Voca is built on the belief that
                AI assistants should feel like real conversations — not command interfaces.
              </motion.p>
            </div>

            {/* Two-column */}
            <div className="mt-24 grid grid-cols-1 gap-12 lg:grid-cols-2 items-start">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="inline-block rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-cyan-400 uppercase mb-6">
                  Philosophy
                </div>
                <h3 className="text-3xl font-black tracking-tight mb-6">
                  Built for Real Conversations
                </h3>
                <p className="text-base leading-relaxed text-white/55 mb-5">
                  Voca supports English, Hindi, and Tamil out of the box — with automatic
                  language switching. If you start in English and switch to Hindi mid-sentence,
                  the agent follows immediately.
                </p>
                <p className="text-base leading-relaxed text-white/40">
                  The entire pipeline — STT → LLM → TTS — runs in under 500ms end-to-end.
                  Murf Falcon alone contributes less than 130ms of that. This is what real-time
                  voice AI looks like.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <SpotlightCard className="border-white/8 bg-black/35 p-8 backdrop-blur-md">
                  <div className="mb-2 text-[10px] font-black tracking-[0.3em] text-cyan-400 uppercase">
                    The Builder
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">Mohan Prasath P</h3>
                  <p className="text-sm leading-relaxed text-white/50 mb-6">
                    AI Engineer and Builder. 1st-year B.Tech CSE (AI &amp; ML) student at
                    B.S.A. Crescent Institute × NIAT, Chennai. Built Voca as a hackathon
                    project to demonstrate the full real-time voice AI pipeline.
                  </p>
                  <div className="flex items-center gap-5">
                    <a href="https://github.com/mohanprasath-dev" target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1.5 text-xs font-bold text-white/35 hover:text-white transition-colors">
                      <Icons.GithubLogoIcon size={14} weight="fill" /> GitHub
                    </a>
                    <a href="https://linkedin.com/in/mohanprasath21" target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1.5 text-xs font-bold text-white/35 hover:text-white transition-colors">
                      <Icons.LinkedinLogoIcon size={14} weight="fill" /> LinkedIn
                    </a>
                    <a href="https://www.mohanprasath.dev" target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1.5 text-xs font-bold text-white/35 hover:text-white transition-colors">
                      <Icons.GlobeIcon size={14} weight="fill" /> Website
                    </a>
                  </div>
                </SpotlightCard>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Tech stack */}
        <section className="relative z-10 py-24">
          <Container>
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Technology Stack
              </h2>
              <p className="mt-4 text-sm text-white/40">
                Every component is production-grade and runs live in the demo.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {TECH.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <SpotlightCard className="h-full border-white/8 bg-black/35 p-7 backdrop-blur-md group">
                    <div className={`mb-5 inline-flex size-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${item.color}`}>
                      <item.icon size={22} weight="duotone" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs leading-relaxed text-white/45">{item.desc}</p>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Lanyard / builder card */}
        <section className="relative z-10 py-24">
          <Container>
            <div className="mb-14 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-5"
              >
                <span className="text-[10px] font-black tracking-[0.2em] text-cyan-400 uppercase">
                  The Builder
                </span>
              </motion.div>
              <h2 className="text-4xl font-black tracking-tight text-white">Behind the Scenes</h2>
            </div>
            <div className="flex justify-center py-4">
              <Lanyard
                name="Mohan Prasath P"
                role="AI Engineer / Builder"
                socials={{
                  linkedin: 'mohanprasath21',
                  github: 'mohanprasath-dev',
                  website: 'www.mohanprasath.dev',
                }}
              />
            </div>
          </Container>
        </section>

      </main>
      <Footer />
    </div>
  );
}
