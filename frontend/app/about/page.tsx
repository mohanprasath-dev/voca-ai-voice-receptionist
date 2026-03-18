'use client';

import { motion } from 'motion/react';
import { Code, Globe, Lightbulb, Users } from '@phosphor-icons/react';
import { Container } from '@/components/ui/container';
import { Footer } from '@/components/ui/footer';
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
        <section className="pt-40 pb-20">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <motion.h1
                className="text-4xl font-extrabold tracking-tight sm:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                The Vision Behind Voca
              </motion.h1>
              <motion.p
                className="text-muted-foreground mt-8 text-xl leading-relaxed"
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
              >
                <h3 className="text-2xl font-bold">Our Philosophy</h3>
                <p className="text-muted-foreground mt-6 leading-relaxed">
                  We don&apos;t just build AI. We build relationships. Our goal is to make AI feel
                  less like a tool and more like a partner. By focusing on latency, emotion, and
                  context, we create voice experiences that are indistinguishable from human
                  conversation.
                </p>
                <p className="text-muted-foreground mt-6 leading-relaxed">
                  Using Murf Falcon for ultra-fast synthesis and LiveKit for real-time streaming,
                  Voca represents the pinnacle of current voice technology.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8"
              >
                <div className="from-primary/10 to-accentDark/10 absolute inset-0 bg-gradient-to-br via-transparent" />
                <div className="relative z-10">
                  <h4 className="text-muted-foreground text-sm font-bold tracking-widest uppercase">
                    The Creator
                  </h4>
                  <div className="mt-12">
                    <h3 className="text-3xl font-bold">Mohan Prasath P</h3>
                    <p className="text-muted-foreground mt-4">
                      A product engineer and designer obsessed with creating seamless digital
                      experiences. With a background in high-performance frontend systems, Mohan
                      built Voca to showcase the future of real-time AI.
                    </p>
                    <div className="mt-8 flex gap-6">
                      <a
                        href="https://github.com/mohanprasath-dev"
                        className="text-sm font-medium hover:underline"
                      >
                        GitHub
                      </a>
                      <a
                        href="https://linkedin.com/in/mohanprasath21"
                        className="text-sm font-medium hover:underline"
                      >
                        LinkedIn
                      </a>
                      <a
                        href="https://www.mohanprasath.dev"
                        className="text-sm font-medium hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        <section className="border-y border-white/5 bg-white/[0.02] py-24">
          <Container>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Core Values</h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
                These principles guide every decision we make, from engineering to design.
              </p>
            </div>
            <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((value, index) => (
                <motion.div
                  key={value.title}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="bg-foreground text-background mb-6 inline-flex size-14 items-center justify-center rounded-2xl shadow-lg">
                    <value.icon size={28} weight="bold" />
                  </div>
                  <h3 className="text-xl font-bold">{value.title}</h3>
                  <p className="text-muted-foreground mt-4 leading-relaxed">{value.description}</p>
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
