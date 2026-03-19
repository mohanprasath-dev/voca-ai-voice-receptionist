'use client';

import { useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useRoomContext } from '@livekit/components-react';
import { useSession } from '@/components/app/session-provider';
import { SessionView } from '@/components/app/session-view';
import { WelcomeView } from '@/components/app/welcome-view';

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.5,
    ease: 'linear' as const,
  },
} as const;

export function ViewController() {
  const room = useRoomContext();
  const { appConfig, isSessionActive, startSession } = useSession();

  const handleAnimationComplete = () => {
    if (!isSessionActive && room.state !== 'disconnected') {
      room.disconnect();
    }
  };

  return (
    <AnimatePresence mode="wait" onExitComplete={handleAnimationComplete}>
      {/* Welcome screen */}
      {!isSessionActive && (
        <motion.div key="welcome" {...VIEW_MOTION_PROPS}>
          <WelcomeView startButtonText={appConfig.startButtonText} onStartCall={startSession} />
        </motion.div>
      )}
      {/* Session view */}
      {isSessionActive && (
        <motion.div key="session-view" {...VIEW_MOTION_PROPS}>
          <SessionView appConfig={appConfig} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
