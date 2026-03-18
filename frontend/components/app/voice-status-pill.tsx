import type { VoicePhase } from '@/lib/contracts';
import { cn } from '@/lib/utils';

export function phaseLabel(phase: VoicePhase): string {
  return phase.replace('_', ' ');
}

const PHASE_CLASSNAME: Record<VoicePhase, string> = {
  idle: 'bg-muted text-muted-foreground',
  listening: 'bg-emerald-100 text-emerald-800',
  reasoning: 'bg-amber-100 text-amber-800',
  speaking: 'bg-blue-100 text-blue-800',
  awaiting_confirmation: 'bg-violet-100 text-violet-800',
  escalated: 'bg-rose-100 text-rose-800',
  ended: 'bg-slate-200 text-slate-700',
};

export function VoiceStatusPill({ phase }: { phase: VoicePhase }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize',
        PHASE_CLASSNAME[phase]
      )}
      aria-label={`voice status ${phase}`}
    >
      {phaseLabel(phase)}
    </div>
  );
}
