import type { VoicePhase } from '@/lib/contracts';

export function InterruptHint({ phase }: { phase: VoicePhase }) {
  if (phase !== 'speaking') {
    return null;
  }

  return (
    <div className="text-muted-foreground rounded-md border border-dashed px-3 py-1 text-[11px]">
      You can interrupt Voca anytime by speaking.
    </div>
  );
}
