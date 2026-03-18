import type { BudgetSnapshot } from '@/lib/contracts';
import { cn } from '@/lib/utils';

const MODE_CLASS: Record<string, string> = {
  normal: 'bg-emerald-100 text-emerald-900',
  near_limit: 'bg-yellow-100 text-yellow-900',
  hard_limit: 'bg-red-100 text-red-900',
};

export function BudgetIndicator({ budget }: { budget: BudgetSnapshot }) {
  const modeClass = MODE_CLASS[budget.mode] || 'bg-muted text-muted-foreground';
  const usage = Math.round(budget.budgetUsagePercentage);
  const label = budget.mode === 'normal' ? 'Normal' : budget.mode === 'near_limit' ? 'Near Limit' : 'Hard Limit';
  
  return (
    <div className="bg-background/90 border-input/60 rounded-md border px-3 py-2 text-xs shadow-sm">
      <div className="font-medium">Budget: {usage}%</div>
      <div className={cn('inline-block rounded px-2 py-0.5 text-[10px] font-semibold', modeClass)}>
        {label}
      </div>
    </div>
  );
}
