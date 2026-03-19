export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

  // for LiveKit Cloud Sandbox
  sandboxId?: string;
  agentName?: string;
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Voca',
  pageTitle: 'Voca — Multilingual AI Voice Agent',
  pageDescription: 'Real-time multilingual AI voice agent powered by Murf Falcon, Deepgram, and Gemini',

  supportsChatInput: true,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,

  logo: '/favicon.svg',
  accent: '#06b6d4',
  logoDark: '/favicon.svg',
  accentDark: '#06b6d4',
  startButtonText: 'Start Voice Session',

  // for LiveKit Cloud Sandbox
  sandboxId: undefined,
  agentName: undefined,
};
