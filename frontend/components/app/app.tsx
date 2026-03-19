'use client';

import { RoomAudioRenderer, StartAudio } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { SessionProvider } from '@/components/app/session-provider';
import { ViewController } from '@/components/app/view-controller';
import { AgentConfigProvider } from '@/components/app/agent-config-provider';

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  return (
    <AgentConfigProvider>
      <SessionProvider appConfig={appConfig}>
        <div className="relative flex flex-1 flex-col">
          <ViewController />
        </div>
        <RoomAudioRenderer />
      </SessionProvider>
    </AgentConfigProvider>
  );
}
