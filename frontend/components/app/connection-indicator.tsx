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
  { label: string; icon: React.ElementType; iconColor: string; textColor: string }
> = {
  [ConnectionState.Connected]: {
    label: 'Live',
    icon: WifiHighIcon,
    iconColor: 'text-emerald-400',
    textColor: 'text-emerald-400',
  },
  [ConnectionState.Connecting]: {
    label: 'Connecting',
    icon: WifiNoneIcon,
    iconColor: 'text-amber-400 animate-pulse',
    textColor: 'text-amber-400',
  },
  [ConnectionState.Reconnecting]: {
    label: 'Reconnecting',
    icon: WarningIcon,
    iconColor: 'text-rose-400 animate-pulse',
    textColor: 'text-rose-400',
  },
  [ConnectionState.SignalReconnecting]: {
    label: 'Reconnecting',
    icon: WarningIcon,
    iconColor: 'text-rose-400 animate-pulse',
    textColor: 'text-rose-400',
  },
  [ConnectionState.Disconnected]: {
    label: 'Offline',
    icon: WifiNoneIcon,
    iconColor: 'text-white/35',
    textColor: 'text-white/35',
  },
};

export function ConnectionIndicator({ state, className }: ConnectionIndicatorProps) {
  const cfg = STATE_CONFIG[state];
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border border-white/8 bg-black/50 px-3 py-1.5 backdrop-blur-md',
        className
      )}
    >
      <Icon className={cn('size-3.5', cfg.iconColor)} weight="bold" />
      <span className={cn('text-[10px] font-bold tracking-widest uppercase', cfg.textColor)}>
        {cfg.label}
      </span>
    </div>
  );
}
