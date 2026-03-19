'use client';

import { motion } from 'motion/react';

export default function DashboardPage() {
  return (
    <div className="voca-navy-bg relative min-h-[100dvh] px-6 pt-28 pb-24 text-white">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="mx-auto max-w-2xl text-center"
      >
        <div className="glass mx-auto max-w-xl rounded-3xl px-8 py-10">
          <div className="text-[12px] font-semibold tracking-[0.28em] text-white/70 uppercase">
            Dashboard
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">Coming soon</div>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            This route exists to match the reference navigation. Your live metrics are available
            inside the voice session UI.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
