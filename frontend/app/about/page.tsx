'use client';

import { useRef } from 'react';
import { motion } from 'motion/react';
import * as Icons from '@phosphor-icons/react';
import { Container } from '@/components/ui/container';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { BlurText } from '@/components/reactbits/BlurText';
import { VariableProximity } from '@/components/reactbits/VariableProximity';

import { Lanyard } from '@/components/reactbits/Lanyard';

const VALUES = [
  {
    title: 'Voice-First UX',
    description: 'We believe voice is the most natural way for humans to interact with machines. Voca eliminates UI friction.',
    icon: Icons.UsersIcon,
    color: 'text-blue-400'
  },
  {
    title: 'Unmatched Speed',
    description: 'Real-time means real-time. We optimize every millisecond of the voice-to-voice pipeline.',
    icon: Icons.LightbulbIcon,
    color: 'text-amber-400'
  },
  {
    title: 'Global Accessibility',
    description: 'Breaking language barriers with native-level fluency in over 50 languages.',
    icon: Icons.GlobeIcon,
    color: 'text-emerald-400'
  },
  {
    title: 'Developer Focused',
    description: 'Built by engineers for engineers. Robust APIs and modular architecture for total control.',
    icon: Icons.CodeIcon,
    color: 'text-purple-400'
  },
];

export default function AboutPage() {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} className="bg-transparent text-white min-h-screen selection:bg-cyan-500/30 overflow-x-hidden">
      <main>
        <section className="relative z-10 w-full pt-48 pb-20 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <div className="flex justify-center mb-8">
                <BlurText
                  text="The Vision Behind Voca"
                  className="text-5xl font-black tracking-tight sm:text-7xl"
                  delay={100}
                />
              </div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white/40 mt-8 text-xl leading-relaxed font-medium max-w-2xl mx-auto"
              >
                Voca was born from a simple observation: modern software is still built around
                screens, but the world is moving towards ambient, conversational intelligence.
              </motion.p>
            </div>

            <div className="mt-32 grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black tracking-[0.2em] uppercase mb-6">
                  Our Philosophy
                </div>
                <h3 className="text-4xl font-black tracking-tight mb-8">
                  Redefining the <br />
                  <span className="text-cyan-400">Human-AI Interface</span>
                </h3>
                <p className="text-lg leading-relaxed font-medium text-white/60 mb-6">
                  We don&apos;t just build AI. We build relationships. Our goal is to make AI feel
                  less like a tool and more like a partner.
                </p>
                <p className="leading-relaxed text-white/40">
                  By focusing on latency, emotion, and context, we create voice experiences that are 
                  indistinguishable from human conversation. Using Murf Falcon for ultra-fast synthesis 
                  and LiveKit for real-time streaming, Voca represents the pinnacle of current voice technology.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <SpotlightCard className="p-10 bg-white/5 border-white/5 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 blur-3xl rounded-full" />
                  <h4 className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-cyan-400 uppercase mb-8">
                    <span className="h-px w-8 bg-cyan-400/50" />
                    The Creator
                  </h4>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black text-white mb-4">Mohan Prasath P</h3>
                    <p className="leading-relaxed font-medium text-white/50 mb-10">
                      A product engineer and designer obsessed with creating seamless digital
                      experiences. Built Voca to showcase the future of real-time AI.
                    </p>
                    <div className="flex gap-8">
                      {['GitHub', 'LinkedIn', 'Website'].map((link) => (
                        <a
                          key={link}
                          href="#"
                          className="text-xs font-bold tracking-widest uppercase text-white/30 hover:text-white transition-colors"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            </div>
          </Container>
        </section>

        <section className="relative z-10 py-32">
          <Container>
            <div className="text-center mb-24">
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl mb-6">
                Core Principles
              </h2>
              <p className="text-white/40 mx-auto max-w-2xl text-lg font-medium">
                These principles guide every decision we make, from engineering to design.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <SpotlightCard
                    className="h-full p-8 transition-all hover:bg-white/10 group bg-white/5 border-white/5"
                  >
                    <div className={`mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-white/5 ${value.color}`}>
                      <value.icon size={28} weight="duotone" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                    <p className="text-white/40 leading-relaxed text-sm font-medium">
                      {value.description}
                    </p>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Builder Section with Lanyard */}
        <section className="relative z-10 py-32 px-6">
          <Container>
             <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6"
              >
                <span className="text-[10px] font-black tracking-[0.2em] text-cyan-400 uppercase">
                  The Builder
                </span>
              </motion.div>
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
                Behind the Scenes
              </h2>
            </div>
            
            <div className="relative">
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

        <section className="py-32 bg-white/5 border-y border-white/5">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-black mb-12">Interactive Interface</h2>
              <div className="p-20 rounded-[3rem] bg-black border border-white/10 flex items-center justify-center cursor-default">
                <VariableProximity
                  label="VOCA IS THE FUTURE OF VOICE"
                  containerRef={containerRef}
                  radius={150}
                  className="text-3xl md:text-6xl font-black tracking-tighter text-white"
                />
              </div>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
