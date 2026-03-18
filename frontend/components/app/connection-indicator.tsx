'use client';

import { ConnectionState } from 'livekit-client';
import { WarningIcon, WifiHighIcon, WifiNoneIcon } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';

interface ConnectionIndicatorProps {
  state: ConnectionState;
  className?: string;
}

const STATE_CONFIG: Record<
  ConnectionState,
  { label: string; icon: React.ElementType; color: string }
> = {
  [ConnectionState.Connected]: { label: 'Live', icon: WifiHighIcon, color: 'text-emerald-400' },
  [ConnectionState.Connecting]: {
    label: 'Connecting',
    icon: WifiNoneIcon,
    color: 'text-amber-400 animate-pulse',
  },
  [ConnectionState.Reconnecting]: {
    label: 'Reconnecting',
    icon: WarningIcon,
    color: 'text-rose-400 animate-pulse',
  },
  [ConnectionState.SignalReconnecting]: {
    label: 'Reconnecting',
    icon: WarningIcon,
    color: 'text-rose-400 animate-pulse',
  },
  [ConnectionState.Disconnected]: {
    label: 'Offline',
    icon: WifiNoneIcon,
    color: 'text-muted-foreground',
  },
};

export function ConnectionIndicator({ state, className }: ConnectionIndicatorProps) {
  const config = STATE_CONFIG[state];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border border-white/5 bg-black/40 px-3 py-1 backdrop-blur-md',
        className
      )}
    >
      <Icon className={cn('size-4', config.color)} weight="bold" />
      <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
        {config.label}
      </span>
    </div>
  );
}
