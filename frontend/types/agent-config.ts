/**
 * Multilingual agent configuration for Voca AI Voice Receptionist
 */

export interface CompanyConfig {
  name: string;
  description: string;
  services: string[];
  faq: string[];
  custom_instructions: string;
}

export interface AgentConfig {
  voice_id: string;
  language: string;
  role: 'receptionist' | 'sales' | 'support' | 'assistant';
  tone: 'friendly' | 'calm' | 'urgent';
  company: CompanyConfig;
}

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  voice_id: 'en-US-natalie',
  language: 'en',
  role: 'receptionist',
  tone: 'friendly',
  company: {
    name: 'Voca Assistant',
    description: 'A smart AI voice assistant that helps users with tasks, scheduling, and information.',
    services: [
      'answer questions',
      'schedule appointments',
      'provide information'
    ],
    faq: [],
    custom_instructions: 'Be helpful, concise, and human-like.'
  }
};

// Voice mapping for different languages
export const VOICE_MAP = {
  en: 'en-US-natalie',
  hi: 'hi-IN-aditi',
  ta: 'ta-IN-kavitha',
  es: 'es-ES-laura',
  fr: 'fr-FR-natalie',
  ar: 'ar-SA-fatima',
  de: 'de-DE-clara',
  it: 'it-IT-isabella',
  pt: 'pt-BR-camila',
  ru: 'ru-RU-daria',
  ja: 'ja-JP-nanami',
  ko: 'ko-KR-jihun',
  zh: 'zh-CN-xiaoxiao'
} as const;

export const SUPPORTED_LANGUAGES = Object.keys(VOICE_MAP) as Array<keyof typeof VOICE_MAP>;

export const AVAILABLE_VOICES = [
  ...Object.values(VOICE_MAP),
  'en-US-matthew',
  'en-US-brian',
  'en-US-samantha',
  'en-GB-ryan',
  'en-GB-serena'
] as const;

export type LanguageCode = keyof typeof VOICE_MAP;
export type VoiceId = typeof AVAILABLE_VOICES[number];
export type AgentRole = AgentConfig['role'];
export type AgentTone = AgentConfig['tone'];
