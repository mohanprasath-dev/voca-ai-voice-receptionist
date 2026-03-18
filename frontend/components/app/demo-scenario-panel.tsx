const SCENARIOS = [
  'normal_booking',
  'user_interruption',
  'multilingual_conversation',
  'failure_recovery',
] as const;

export function DemoScenarioPanel() {
  return (
    <div className="bg-background/90 border-input/60 rounded-md border px-3 py-2 text-xs shadow-sm">
      <div className="mb-2 font-medium">Demo Scenarios</div>
      <div className="flex flex-wrap gap-1">
        {SCENARIOS.map((name) => (
          <span key={name} className="bg-muted rounded px-2 py-1">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
