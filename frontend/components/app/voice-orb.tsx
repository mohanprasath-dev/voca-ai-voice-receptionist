/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { motion } from 'motion/react';
import type { VoicePhase } from '@/lib/contracts';
import { cn } from '@/lib/utils';

interface VoiceOrbProps {
  phase: VoicePhase;
  className?: string;
  isSessionActive: boolean;
}

export function VoiceOrb({ phase, className, isSessionActive }: VoiceOrbProps) {
  if (!isSessionActive) {
    return (
      <div
        className={cn('relative flex size-48 items-center justify-center md:size-64', className)}
      >
        <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5" />
      </div>
    );
  }

  const orbVariants: any = {
    idle: { scale: 1, filter: 'blur(10px)', opacity: 0.5 },
    listening: {
      scale: [1, 1.05, 1],
      filter: 'blur(12px)',
      opacity: [0.6, 0.8, 0.6],
      transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
    },
    reasoning: {
      scale: [1, 1.02, 1],
      filter: 'blur(20px)',
      opacity: [0.5, 0.9, 0.5],
      transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
    },
    speaking: {
      scale: [1, 1.2, 1.05, 1.25, 1],
      filter: 'blur(8px)',
      opacity: [0.8, 1, 0.9, 1, 0.8],
      transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' },
    },
    awaiting_confirmation: { scale: 1, filter: 'blur(4px)', opacity: 0.8 },
    escalated: { scale: 1, filter: 'blur(4px)', opacity: 0.8 },
    ended: { scale: 0.9, filter: 'blur(10px)', opacity: 0.2 },
  };

  const coreVariants: any = {
    idle: { scale: 1 },
    listening: {
      scale: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
    },
    reasoning: { rotate: 360, transition: { repeat: Infinity, duration: 4, ease: 'linear' } },
    speaking: {
      scale: [1, 1.3, 1.1, 1.4, 1],
      transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' },
    },
    awaiting_confirmation: { scale: 1 },
    escalated: { scale: 1 },
    ended: { scale: 0.9 },
  };

  const ringVariants: any = {
    idle: { opacity: 0, scale: 0.8 },
    listening: {
      opacity: [0, 0.5, 0],
      scale: [0.8, 2],
      transition: { repeat: Infinity, duration: 2, ease: 'easeOut' },
    },
    reasoning: { opacity: 0, scale: 0.8 },
    speaking: { opacity: 0, scale: 0.8 },
    awaiting_confirmation: { opacity: 0 },
    escalated: { opacity: 0 },
    ended: { opacity: 0 },
  };

  const ringVariantsDelayed: any = {
    idle: { opacity: 0, scale: 0.8 },
    listening: {
      opacity: [0, 0.3, 0],
      scale: [0.8, 2.5],
      transition: { repeat: Infinity, duration: 2, delay: 0.5, ease: 'easeOut' },
    },
    reasoning: { opacity: 0, scale: 0.8 },
    speaking: { opacity: 0, scale: 0.8 },
    awaiting_confirmation: { opacity: 0 },
    escalated: { opacity: 0 },
    ended: { opacity: 0 },
  };

  const colorMap: Record<string, string> = {
    idle: 'bg-white/20',
    listening: 'bg-cyan-400',
    reasoning: 'bg-blue-400',
    speaking: 'bg-white',
    awaiting_confirmation: 'bg-cyan-500',
    escalated: 'bg-blue-500',
    ended: 'bg-rose-500',
  };

  const activeColor = colorMap[phase] || colorMap.idle;
  // Use string manipulation to get border color for rings based on background color class
  const ringColor = activeColor.replace('bg-', 'border-');

  return (
    <div className={cn('relative flex size-48 items-center justify-center md:size-64', className)}>
      {/* Expanding Rings for Listening State */}
      <motion.div
        variants={ringVariants}
        animate={phase}
        initial="idle"
        className={cn('absolute inset-0 rounded-full border-2', ringColor)}
      />
      <motion.div
        variants={ringVariantsDelayed}
        animate={phase}
        initial="idle"
        className={cn('absolute inset-0 rounded-full border', ringColor)}
      />

      {/* Outer Glow Orb */}
      <motion.div
        variants={orbVariants}
        animate={phase}
        initial="idle"
        className={cn('absolute inset-0 rounded-full opacity-50 mix-blend-screen', activeColor)}
      />

      {/* Inner Solid Core */}
      <motion.div
        variants={coreVariants}
        animate={phase}
        initial="idle"
        className={cn(
          'relative size-24 rounded-full border border-white/20 shadow-[0_0_40px_currentColor] md:size-32',
          activeColor
        )}
      />

      {/* Core Highlight */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-md md:size-16" />
    </div>
  );
}
