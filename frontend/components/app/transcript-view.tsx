'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { type ReceivedChatMessage } from '@livekit/components-react';
import { cn } from '@/lib/utils';

interface TranscriptViewProps {
  messages: ReceivedChatMessage[];
  className?: string;
}

export function TranscriptView({ messages, className }: TranscriptViewProps) {
  // Only show the last 4 messages to keep UI minimal as requested
  const visibleMessages = useMemo(() => messages.slice(-4), [messages]);

  return (
    <div className={cn('flex flex-col gap-6 py-12', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {visibleMessages.map((msg, index) => {
          const isAgent = msg.from?.isAgent;
          // Use a more stable key combining ID and message hash
          const stableKey = msg.id || `${index}-${msg.message.substring(0, 10)}`;

          return (
            <motion.div
              key={stableKey}
              layout
              initial={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)', transition: { duration: 0.2 } }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                layout: { duration: 0.4 },
              }}
              className={cn('flex w-full flex-col', isAgent ? 'items-start' : 'items-end')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-6 py-4 text-base leading-relaxed shadow-2xl md:text-lg',
                  isAgent
                    ? 'text-foreground border border-white/10 bg-white/5 backdrop-blur-md'
                    : 'bg-foreground text-background font-medium'
                )}
              >
                {msg.message}
              </div>
              <span className="text-muted-foreground mt-2.5 px-3 text-[10px] font-bold tracking-[0.2em] uppercase opacity-40">
                {isAgent ? 'Voca' : 'You'}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
