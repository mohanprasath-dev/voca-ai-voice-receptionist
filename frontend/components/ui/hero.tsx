'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Container } from './container';
import { LandingButton } from './landing-button';

export const Hero = () => {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center px-6 pt-24 pb-24">
      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="text-6xl font-extrabold tracking-[0.22em] text-white sm:text-7xl md:text-8xl">
            VOCA
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base font-medium tracking-wide text-white/70 sm:text-lg">
            The Voice Layer for Every Conversation on Earth
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link href="/app" passHref legacyBehavior>
              <LandingButton variant="primary" className="w-full sm:w-auto">
                Launch App →
              </LandingButton>
            </Link>
            <Link href="/dashboard" passHref legacyBehavior>
              <LandingButton variant="secondary" className="w-full sm:w-auto">
                View Dashboard →
              </LandingButton>
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
