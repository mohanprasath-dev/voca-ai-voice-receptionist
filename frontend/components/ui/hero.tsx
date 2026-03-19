'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion } from 'motion/react';
import { Container } from './container';
import { LandingButton } from './landing-button';
import { BlurText } from '../reactbits/BlurText';
import { VariableProximity } from '../reactbits/VariableProximity';
import { SpotlightCard } from '../reactbits/SpotlightCard';

export const Hero = () => {
  const containerRef = useRef(null);

  return (
    <section ref={containerRef} className="relative flex min-h-[100svh] items-center justify-center px-6 pt-24 pb-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Container className="relative z-10">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
          >
            <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">
              Next-Gen AI Voice System
            </span>
          </motion.div>

          <div className="text-center">
            <h1 className="sr-only">VOCA</h1>
            <div className="flex justify-center mb-4">
              <BlurText 
                text="VOCA" 
                delay={150} 
                animateBy="letters" 
                className="text-7xl font-black tracking-[0.3em] text-white sm:text-8xl md:text-9xl ml-[0.3em]" 
              />
            </div>
            
            <div className="mt-4 mb-8">
              <VariableProximity
                label="The Voice Layer for Every Conversation on Earth"
                containerRef={containerRef}
                radius={100}
                fromFontVariationSettings="'wght' 400"
                toFontVariationSettings="'wght' 900"
                className="text-base font-medium tracking-wide text-white/70 sm:text-xl max-w-2xl cursor-default"
              />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
            >
              <Link href="/demo" passHref legacyBehavior>
                <LandingButton variant="primary" className="w-full sm:w-auto px-10 py-6 text-lg">
                  Try Live Demo →
                </LandingButton>
              </Link>
              <Link href="/dashboard" passHref legacyBehavior>
                <LandingButton variant="secondary" className="w-full sm:w-auto px-10 py-6 text-lg">
                  View Dashboard
                </LandingButton>
              </Link>
            </motion.div>
          </div>

          {/* Feature Grid with Spotlight Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
          >
            {[
              { title: 'Ultra Low Latency', desc: 'Sub-500ms responses for natural flow' },
              { title: 'Multi-lingual', desc: 'Support for over 50+ native accents' },
              { title: 'Custom Personas', desc: 'Define roles, knowledge and behavior' }
            ].map((feature, i) => (
              <SpotlightCard key={i} className="p-8 text-left bg-white/5 border-white/5 group">
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">{feature.desc}</p>
              </SpotlightCard>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
};
