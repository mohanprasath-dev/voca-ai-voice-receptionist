'use client';

import { motion } from 'motion/react';
import { Container } from './container';

const STATS = [
  { label: 'Voice Latency', value: '<130ms', note: 'Murf Falcon model' },
  { label: 'Languages', value: '13', note: 'EN · HI · TA + 10 more' },
  { label: 'STT Engine', value: 'Nova-3', note: 'Deepgram multilingual' },
  { label: 'LLM', value: 'Gemini', note: '2.5 Flash · real-time' },
];

export const Stats = () => {
  return (
    <section className="border-y border-white/6 py-20" style={{ background: 'rgba(0,0,0,0.35)' }}>
      <Container>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-3xl font-black tracking-tight text-white md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-[11px] font-bold tracking-widest text-white/55 uppercase">
                {stat.label}
              </div>
              <div className="mt-1 text-[10px] text-white/30">{stat.note}</div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};
