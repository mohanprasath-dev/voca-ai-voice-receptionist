'use client';

import { motion } from 'motion/react';
import { Container } from './container';

const STATS = [
  { label: 'Latency', value: '150ms' },
  { label: 'Accuracy', value: '99.8%' },
  { label: 'Languages', value: '50+' },
  { label: 'Availability', value: '99.9%' },
];

export const Stats = () => {
  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-24">
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
              <div className="text-foreground text-4xl font-extrabold tracking-tight md:text-5xl">
                {stat.value}
              </div>
              <div className="text-muted-foreground mt-2 text-sm font-medium tracking-wider uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};
