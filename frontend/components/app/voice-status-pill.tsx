'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircleIcon,
  CpuIcon,
  HourglassMediumIcon,
  MicrophoneIcon,
  SpeakerHighIcon,
  XCircleIcon,
} from '@phosphor-icons/react/dist/ssr';
import type { VoicePhase } from '@/lib/contracts';
import { cn } from '@/lib/utils';

interface VoiceStatusPillProps {
  phase: VoicePhase;
  className?: string;
}

const PHASE_CONFIG: Record<
  VoicePhase,
  { label: string; icon: React.ElementType; color: string; glow: string }
> = {
  idle: {
    label: 'Ready',
    icon: HourglassMediumIcon,
    color: 'text-muted-foreground',
    glow: 'shadow-none',
  },
  listening: {
    label: 'Listening',
    icon: MicrophoneIcon,
    color: 'text-emerald-400',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]',
  },
  reasoning: {
    label: 'Thinking',
    icon: CpuIcon,
    color: 'text-amber-400',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]',
  },
  speaking: {
    label: 'Speaking',
    icon: SpeakerHighIcon,
    color: 'text-blue-400',
    glow: 'shadow-[0_0_20px_rgba(96,165,250,0.3)]',
  },
  awaiting_confirmation: {
    label: 'Connected',
    icon: CheckCircleIcon,
    color: 'text-violet-400',
    glow: 'shadow-[0_0_20px_rgba(167,139,250,0.3)]',
  },
  escalated: {
    label: 'Handoff',
    icon: CheckCircleIcon,
    color: 'text-indigo-400',
    glow: 'shadow-none',
  },
  ended: { label: 'Ended', icon: XCircleIcon, color: 'text-rose-500', glow: 'shadow-none' },
};

export function VoiceStatusPill({ phase, className }: VoiceStatusPillProps) {
  const config = PHASE_CONFIG[phase] || PHASE_CONFIG.idle;
  const Icon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-md',
          config.glow,
          className
        )}
      >
        <div className={cn('relative flex h-2 w-2 items-center justify-center', config.color)}>
          {(phase === 'listening' || phase === 'speaking' || phase === 'reasoning') && (
            <motion.div
              animate={{ scale: [1, 2, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute h-full w-full rounded-full bg-current"
            />
          )}
          <div className="h-full w-full rounded-full bg-current shadow-[0_0_8px_currentColor]" />
        </div>

        <span className={cn('text-[10px] font-black tracking-[0.2em] uppercase', config.color)}>
          {config.label}
        </span>

        <Icon className={cn('size-3.5', config.color)} weight="bold" />
      </motion.div>
    </AnimatePresence>
  );
}
