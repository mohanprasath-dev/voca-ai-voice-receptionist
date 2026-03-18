'use client';

import { motion } from 'motion/react';
import { Code, Globe, Lightbulb, Users } from '@phosphor-icons/react';
import { Container } from '@/components/ui/container';
import { Footer } from '@/components/ui/footer';
import { GlassCard } from '@/components/ui/glass-card';
import { Navbar } from '@/components/ui/navbar';

const VALUES = [
  {
    title: 'Voice-First UX',
    description:
      'We believe voice is the most natural way for humans to interact with machines. Voca eliminates UI friction.',
    icon: Users,
  },
  {
    title: 'Unmatched Speed',
    description:
      'Real-time means real-time. We optimize every millisecond of the voice-to-voice pipeline.',
    icon: Lightbulb,
  },
  {
    title: 'Global Accessibility',
    description: 'Breaking language barriers with native-level fluency in over 50 languages.',
    icon: Globe,
  },
  {
    title: 'Developer Focused',
    description:
      'Built by engineers for engineers. Robust APIs and modular architecture for total control.',
    icon: Code,
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      <main>
        <section className="relative z-10 w-full pt-40 pb-20">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <motion.h1
                className="bg-gradient-to-br from-white to-white/60 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl"
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.8 }}
              >
                The Vision Behind Voca
              </motion.h1>
              <motion.p
                className="text-muted-foreground mt-8 text-xl leading-relaxed font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Voca was born from a simple observation: modern software is still built around
                screens, but the world is moving towards ambient, conversational intelligence.
              </motion.p>
            </div>

            <div className="mt-24 grid grid-cols-1 gap-12 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col justify-center"
              >
                <h3 className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
                  Our Philosophy
                </h3>
                <p className="mt-6 text-lg leading-relaxed font-medium text-white/80">
                  We don&apos;t just build AI. We build relationships. Our goal is to make AI feel
                  less like a tool and more like a partner. By focusing on latency, emotion, and
                  context, we create voice experiences that are indistinguishable from human
                  conversation.
                </p>
                <p className="mt-6 leading-relaxed text-white/60">
                  Using Murf Falcon for ultra-fast synthesis and LiveKit for real-time streaming,
                  Voca represents the pinnacle of current voice technology.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <GlassCard
                  intensity="high"
                  glowColor="rgba(56,189,248,0.2)"
                  className="group h-full p-10"
                >
                  <div className="relative z-10">
                    <h4 className="flex items-center gap-2 text-sm font-bold tracking-widest text-cyan-400 uppercase">
                      <span className="h-px w-8 bg-cyan-400/50" />
                      The Creator
                    </h4>
                    <div className="mt-8">
                      <h3 className="text-3xl font-bold text-white">Mohan Prasath P</h3>
                      <p className="mt-4 leading-relaxed font-medium text-white/70">
                        A product engineer and designer obsessed with creating seamless digital
                        experiences. With a background in high-performance frontend systems, Mohan
                        built Voca to showcase the future of real-time AI.
                      </p>
                      <div className="mt-10 flex gap-6">
                        <a
                          href="https://github.com/mohanprasath-dev"
                          className="text-sm font-semibold text-white/60 transition-colors hover:text-white"
                        >
                          GitHub
                        </a>
                        <a
                          href="https://linkedin.com/in/mohanprasath21"
                          className="text-sm font-semibold text-white/60 transition-colors hover:text-white"
                        >
                          LinkedIn
                        </a>
                        <a
                          href="https://www.mohanprasath.dev"
                          className="text-sm font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
                        >
                          Website →
                        </a>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </Container>
        </section>

        <section className="relative z-10 mb-20 py-24">
          <Container>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Our Core Values
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg font-medium">
                These principles guide every decision we make, from engineering to design.
              </p>
            </div>
            <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GlassCard
                    intensity="low"
                    className="h-full p-8 text-center transition-all hover:scale-105 hover:bg-white/10"
                  >
                    <div className="bg-primary/20 text-primary mb-6 inline-flex size-14 items-center justify-center rounded-2xl shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                      <value.icon size={28} weight="duotone" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{value.title}</h3>
                    <p className="text-muted-foreground mt-4 leading-relaxed font-medium">
                      {value.description}
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
