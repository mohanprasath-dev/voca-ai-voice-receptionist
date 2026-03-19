'use client';

import { motion } from 'motion/react';
import * as Icons from '@phosphor-icons/react';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { BlurText } from '@/components/reactbits/BlurText';

const STACK = [
  { label: 'TTS Engine',   value: 'Murf Falcon',      note: 'falcon2 · < 130ms',         icon: Icons.WaveformIcon,       color: 'text-cyan-400' },
  { label: 'STT Engine',   value: 'Deepgram',          note: 'nova-3 · multilingual',     icon: Icons.MicrophoneIcon,     color: 'text-emerald-400' },
  { label: 'LLM',          value: 'Gemini 2.5 Flash',  note: 'Google AI · real-time',     icon: Icons.CpuIcon,            color: 'text-purple-400' },
  { label: 'Transport',    value: 'LiveKit',            note: 'WebRTC · barge-in',         icon: Icons.BroadcastIcon,      color: 'text-blue-400' },
];

const SERVICES = [
  { label: 'Murf Falcon TTS',        status: 'Live',        dot: 'bg-emerald-400' },
  { label: 'Deepgram Nova-3 STT',    status: 'Live',        dot: 'bg-emerald-400' },
  { label: 'Gemini 2.5 Flash LLM',   status: 'Live',        dot: 'bg-emerald-400' },
  { label: 'LiveKit WebRTC',         status: 'Live',        dot: 'bg-emerald-400' },
  { label: 'Language Detection',     status: 'Active',      dot: 'bg-cyan-400' },
  { label: 'Voice Activity Detection', status: 'Silero VAD', dot: 'bg-blue-400' },
];

const LANGUAGES = [
  { code: 'en', name: 'English',  voice: 'en-US-natalie', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi',    voice: 'hi-IN-aditi',   flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil',    voice: 'ta-IN-kavitha', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish',  voice: 'es-ES-laura',   flag: '🇪🇸' },
  { code: 'fr', name: 'French',   voice: 'fr-FR-natalie', flag: '🇫🇷' },
  { code: 'de', name: 'German',   voice: 'de-DE-clara',   flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', voice: 'ja-JP-nanami',  flag: '🇯🇵' },
  { code: 'ko', name: 'Korean',   voice: 'ko-KR-jihun',   flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese',  voice: 'zh-CN-xiaoxiao',flag: '🇨🇳' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-cyan-500/30">
      <main className="mx-auto max-w-7xl px-6 pb-20 pt-32 md:px-10">

        {/* Header */}
        <header className="mb-12">
          <BlurText text="System Overview" className="text-4xl font-black tracking-tight text-white" />
          <p className="mt-2 text-sm text-white/40">
            Live architecture view of the Voca AI voice pipeline
          </p>
        </header>

        {/* Stack cards */}
        <div className="mb-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {STACK.map((item) => (
            <SpotlightCard
              key={item.label}
              className="border-white/8 bg-black/30 p-6 backdrop-blur-md"
            >
              <div className={`mb-4 inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${item.color}`}>
                <item.icon size={20} weight="duotone" />
              </div>
              <div className="text-[10px] font-bold tracking-widest text-white/35 uppercase mb-1">{item.label}</div>
              <div className="text-base font-black text-white">{item.value}</div>
              <div className="mt-1 text-[10px] text-white/35">{item.note}</div>
            </SpotlightCard>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Services health */}
          <SpotlightCard className="lg:col-span-1 border-white/8 bg-black/30 p-7 backdrop-blur-md">
            <h3 className="mb-6 text-base font-black text-white">Pipeline Health</h3>
            <div className="space-y-5">
              {SERVICES.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-white/60">{s.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white/35">{s.status}</span>
                    <div className={`size-2 rounded-full ${s.dot} animate-pulse`} />
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>

          {/* Language support */}
          <SpotlightCard className="lg:col-span-2 border-white/8 bg-black/30 p-7 backdrop-blur-md">
            <h3 className="mb-6 text-base font-black text-white">Supported Languages &amp; Voices</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-4 py-3"
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div>
                    <div className="text-xs font-bold text-white">{lang.name}</div>
                    <div className="text-[10px] text-white/35">{lang.voice}</div>
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </div>

        {/* How it works */}
        <div className="mt-10">
          <SpotlightCard className="border-white/8 bg-black/30 p-8 backdrop-blur-md">
            <h3 className="mb-8 text-base font-black text-white">Voice Pipeline Flow</h3>
            <div className="flex flex-col items-start gap-0 sm:flex-row sm:items-center sm:gap-0 overflow-x-auto pb-2">
              {[
                { step: '1', label: 'User speaks',         icon: Icons.MicrophoneIcon,    color: 'text-white' },
                { step: '2', label: 'Deepgram STT',        icon: Icons.WaveformIcon,      color: 'text-emerald-400' },
                { step: '3', label: 'Language detect',     icon: Icons.TranslateIcon,     color: 'text-cyan-400' },
                { step: '4', label: 'Gemini 2.5 Flash',    icon: Icons.CpuIcon,           color: 'text-purple-400' },
                { step: '5', label: 'Murf Falcon TTS',     icon: Icons.SpeakerHighIcon,   color: 'text-blue-400' },
                { step: '6', label: 'Agent speaks',        icon: Icons.ChatCenteredIcon,  color: 'text-white' },
              ].map((step, i) => (
                <div key={step.step} className="flex items-center">
                  <div className="flex flex-col items-center gap-2 px-4 py-2">
                    <div className={`flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${step.color}`}>
                      <step.icon size={18} weight="duotone" />
                    </div>
                    <span className="text-[10px] text-center font-bold text-white/50 w-20">{step.label}</span>
                  </div>
                  {i < 5 && (
                    <div className="hidden text-white/20 sm:block">
                      <Icons.ArrowRightIcon size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SpotlightCard>
        </div>

      </main>
    </div>
  );
}
