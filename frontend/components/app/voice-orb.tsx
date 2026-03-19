'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { VoicePhase } from '@/lib/contracts';
import { cn } from '@/lib/utils';

interface VoiceOrbProps {
  phase: VoicePhase;
  className?: string;
  isSessionActive: boolean;
}

const PHASE_COLORS: Record<VoicePhase, { primary: string; glow: string; ring: string }> = {
  idle: {
    primary: 'rgba(255,255,255,0.08)',
    glow: 'rgba(255,255,255,0.04)',
    ring: 'rgba(255,255,255,0.08)',
  },
  listening: {
    primary: 'rgba(34,211,238,0.9)',
    glow: 'rgba(34,211,238,0.35)',
    ring: 'rgba(34,211,238,0.4)',
  },
  reasoning: {
    primary: 'rgba(99,102,241,0.9)',
    glow: 'rgba(99,102,241,0.35)',
    ring: 'rgba(99,102,241,0.4)',
  },
  speaking: {
    primary: 'rgba(255,255,255,0.95)',
    glow: 'rgba(255,255,255,0.30)',
    ring: 'rgba(255,255,255,0.3)',
  },
  awaiting_confirmation: {
    primary: 'rgba(34,211,238,0.9)',
    glow: 'rgba(34,211,238,0.30)',
    ring: 'rgba(34,211,238,0.3)',
  },
  escalated: {
    primary: 'rgba(99,102,241,0.9)',
    glow: 'rgba(99,102,241,0.30)',
    ring: 'rgba(99,102,241,0.3)',
  },
  ended: {
    primary: 'rgba(244,63,94,0.7)',
    glow: 'rgba(244,63,94,0.20)',
    ring: 'rgba(244,63,94,0.2)',
  },
};

export function VoiceOrb({ phase, className, isSessionActive }: VoiceOrbProps) {
  const colors = PHASE_COLORS[phase] ?? PHASE_COLORS.idle;
  const isActive = isSessionActive;

  const isListening = phase === 'listening';
  const isReasoning = phase === 'reasoning';
  const isSpeaking = phase === 'speaking';

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: 220, height: 220 }}
    >
      {isActive && isListening && (
        <motion.div
          className="absolute rounded-full"
          style={{ width: 220, height: 220, border: `1px solid ${colors.ring}` }}
          animate={{ scale: [1, 1.6, 2.2], opacity: [0.6, 0.2, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeOut' }}
        />
      )}
      {isActive && isListening && (
        <motion.div
          className="absolute rounded-full"
          style={{ width: 220, height: 220, border: `1px solid ${colors.ring}` }}
          animate={{ scale: [1, 1.5, 2.0], opacity: [0.4, 0.15, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, delay: 0.6, ease: 'easeOut' }}
        />
      )}

      {isActive && (
        <motion.div
          className="absolute rounded-full"
          style={{ width: 180, height: 180, background: colors.glow, filter: 'blur(40px)' }}
          animate={
            isSpeaking
              ? { scale: [1, 1.3, 1.1, 1.4, 1.1, 1], opacity: [0.7, 1, 0.85, 1, 0.85, 0.7] }
              : isListening
                ? { scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }
                : isReasoning
                  ? { scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }
                  : { scale: 1, opacity: 0.2 }
          }
          transition={
            isSpeaking
              ? { repeat: Infinity, duration: 0.7, ease: 'easeInOut' }
              : isListening
                ? { repeat: Infinity, duration: 2.0, ease: 'easeInOut' }
                : isReasoning
                  ? { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }
                  : {}
          }
        />
      )}

      <motion.div
        className="absolute rounded-full"
        style={{
          width: 140,
          height: 140,
          border: `1px solid ${isActive ? colors.ring : 'rgba(255,255,255,0.06)'}`,
        }}
        animate={
          isReasoning ? { rotate: 360 } : isListening ? { scale: [1, 1.04, 1] } : { scale: 1 }
        }
        transition={
          isReasoning
            ? { repeat: Infinity, duration: 4, ease: 'linear' }
            : isListening
              ? { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
              : {}
        }
      />

      {isActive && isReasoning && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 160,
            height: 160,
            border: '1px dashed rgba(99,102,241,0.25)',
          }}
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 7, ease: 'linear' }}
        />
      )}

      <motion.div
        className="absolute rounded-full"
        style={{
          width: 100,
          height: 100,
          background: isActive
            ? `radial-gradient(circle at 38% 35%, rgba(255,255,255,0.25) 0%, ${colors.primary} 55%, rgba(0,0,0,0.15) 100%)`
            : 'radial-gradient(circle at 38% 35%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
          boxShadow: isActive
            ? `0 0 60px ${colors.glow}, 0 0 120px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`
            : '0 0 20px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
          backdropFilter: 'blur(4px)',
        }}
        animate={
          isSpeaking
            ? { scale: [1, 1.18, 1.05, 1.22, 1.04, 1] }
            : isListening
              ? { scale: [1, 1.08, 1] }
              : isReasoning
                ? { scale: [1, 1.04, 1] }
                : { scale: 1 }
        }
        transition={
          isSpeaking
            ? { repeat: Infinity, duration: 0.65, ease: 'easeInOut' }
            : isListening
              ? { repeat: Infinity, duration: 2.0, ease: 'easeInOut' }
              : isReasoning
                ? { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }
                : {}
        }
      >
        <div
          className="absolute rounded-full"
          style={{
            width: 36,
            height: 36,
            top: 12,
            left: 14,
            background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
            filter: 'blur(6px)',
          }}
        />
      </motion.div>

      {isActive && isReasoning && (
        <>
          {[0, 120, 240].map((deg, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 5,
                height: 5,
                background: colors.primary,
                boxShadow: `0 0 8px ${colors.glow}`,
                top: '50%',
                left: '50%',
                originX: '50%',
                originY: '50%',
              }}
              animate={{
                rotate: [deg, deg + 360],
                x: [
                  Math.cos((deg * Math.PI) / 180) * 68,
                  Math.cos(((deg + 360) * Math.PI) / 180) * 68,
                ],
                y: [
                  Math.sin((deg * Math.PI) / 180) * 68,
                  Math.sin(((deg + 360) * Math.PI) / 180) * 68,
                ],
                opacity: [0.8, 0.3, 0.8],
              }}
              transition={{ repeat: Infinity, duration: 2.5 + i * 0.3, ease: 'linear' }}
            />
          ))}
        </>
      )}

      {!isActive && (
        <div
          className="absolute rounded-full"
          style={{
            width: 100,
            height: 100,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(8px)',
          }}
        />
      )}
    </div>
  );
}
