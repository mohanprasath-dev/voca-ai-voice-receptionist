'use client';

import { motion } from 'motion/react';
import * as Icons from '@phosphor-icons/react';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { BlurText } from '@/components/reactbits/BlurText';

const BACKEND_STACK = [
  { label: 'TTS',        value: 'Murf Falcon',      note: 'falcon2 · <130ms',          icon: Icons.WaveformIcon,      color: 'text-cyan-400' },
  { label: 'STT',        value: 'Deepgram',          note: 'nova-3 · multilingual',     icon: Icons.MicrophoneIcon,    color: 'text-emerald-400' },
  { label: 'LLM',        value: 'Gemini 2.5 Flash',  note: 'Google AI · real-time',     icon: Icons.CpuIcon,           color: 'text-purple-400' },
  { label: 'Transport',  value: 'LiveKit',            note: 'WebRTC · barge-in',         icon: Icons.BroadcastIcon,     color: 'text-blue-400' },
  { label: 'VAD',        value: 'Silero',             note: 'Voice activity detection',  icon: Icons.SpeakerHighIcon,   color: 'text-amber-400' },
  { label: 'Framework',  value: 'LiveKit Agents',     note: 'Python · async pipeline',   icon: Icons.TerminalWindowIcon,color: 'text-rose-400' },
];

const FRONTEND_STACK = [
  { label: 'Framework',  value: 'Next.js 15',         note: 'App Router · Turbopack',    icon: Icons.BracketsCurlyIcon, color: 'text-white' },
  { label: 'Language',   value: 'TypeScript',          note: 'Strict mode',               icon: Icons.CodeIcon,          color: 'text-blue-400' },
  { label: 'Styling',    value: 'Tailwind CSS v4',     note: 'Utility-first',             icon: Icons.PaintBucketIcon,   color: 'text-cyan-400' },
  { label: 'Animation',  value: 'Motion/React',        note: 'Framer Motion v12',         icon: Icons.MagicWandIcon,     color: 'text-purple-400' },
  { label: 'WebGL',      value: 'OGL',                 note: 'Aurora background shader',  icon: Icons.SquaresFourIcon,   color: 'text-emerald-400' },
  { label: 'Icons',      value: 'Phosphor',            note: 'React icon library',        icon: Icons.StarIcon,          color: 'text-amber-400' },
];

const PIPELINE_STEPS = [
  { label: 'User Speaks',       icon: Icons.MicrophoneIcon,     color: 'text-white',       bg: 'bg-white/8' },
  { label: 'Noise Cancel',      icon: Icons.ProhibitIcon,       color: 'text-rose-400',    bg: 'bg-rose-500/10' },
  { label: 'Deepgram STT',      icon: Icons.WaveformIcon,       color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Lang Detect',       icon: Icons.TranslateIcon,      color: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
  { label: 'VAD / Turn',        icon: Icons.TimerIcon,          color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  { label: 'Gemini Flash',      icon: Icons.CpuIcon,            color: 'text-purple-400',  bg: 'bg-purple-500/10' },
  { label: 'Murf Falcon',       icon: Icons.SpeakerHighIcon,    color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  { label: 'Agent Speaks',      icon: Icons.ChatCenteredIcon,   color: 'text-white',       bg: 'bg-white/8' },
];

const SERVICES = [
  { label: 'Murf Falcon TTS',         status: 'Live',       dot: 'bg-emerald-400' },
  { label: 'Deepgram Nova-3 STT',     status: 'Live',       dot: 'bg-emerald-400' },
  { label: 'Gemini 2.5 Flash LLM',    status: 'Live',       dot: 'bg-emerald-400' },
  { label: 'LiveKit WebRTC',          status: 'Live',       dot: 'bg-emerald-400' },
  { label: 'Silero VAD',              status: 'Active',     dot: 'bg-cyan-400' },
  { label: 'Language Detection',      status: 'Active',     dot: 'bg-cyan-400' },
  { label: 'Turn Detection (Multilingual)', status: 'Active', dot: 'bg-blue-400' },
  { label: 'Noise Cancellation (BVC)', status: 'Active',    dot: 'bg-blue-400' },
];

const LANGUAGES = [
  { code: 'en', name: 'English',    voice: 'en-US-natalie',    flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi',      voice: 'hi-IN-aditi',      flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil',      voice: 'ta-IN-kavitha',    flag: '🇮🇳' },
  { code: 'es', name: 'Spanish',    voice: 'es-ES-laura',      flag: '🇪🇸' },
  { code: 'fr', name: 'French',     voice: 'fr-FR-natalie',    flag: '🇫🇷' },
  { code: 'de', name: 'German',     voice: 'de-DE-clara',      flag: '🇩🇪' },
  { code: 'it', name: 'Italian',    voice: 'it-IT-isabella',   flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', voice: 'pt-BR-camila',     flag: '🇧🇷' },
  { code: 'ru', name: 'Russian',    voice: 'ru-RU-daria',      flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese',   voice: 'ja-JP-nanami',     flag: '🇯🇵' },
  { code: 'ko', name: 'Korean',     voice: 'ko-KR-jihun',      flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese',    voice: 'zh-CN-xiaoxiao',   flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic',     voice: 'ar-SA-fatima',     flag: '🇸🇦' },
];

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/8 p-6 ${className}`}
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)' }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-5 text-[11px] font-black tracking-[0.2em] text-white/40 uppercase">
      {children}
    </h3>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-cyan-500/30">
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-32 md:px-10">

        {/* Header */}
        <header className="mb-10">
          <BlurText text="System Overview" className="text-4xl font-black tracking-tight text-white" />
          <p className="mt-2 text-sm text-white/40">
            Architecture view of the Voca real-time multilingual voice AI pipeline
          </p>
        </header>

        {/* ── Voice Pipeline ─────────────────────────────────────────────── */}
        <SectionCard className="mb-8">
          <SectionTitle>Voice Pipeline — End to End</SectionTitle>
          <div className="overflow-x-auto">
            <div className="flex min-w-max items-center gap-0 pb-1">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="flex flex-col items-center gap-2 px-3"
                  >
                    <div className={`flex size-11 items-center justify-center rounded-xl border border-white/10 ${step.bg} ${step.color}`}>
                      <step.icon size={20} weight="duotone" />
                    </div>
                    <span className="w-20 text-center text-[9px] font-bold leading-tight text-white/50">
                      {step.label}
                    </span>
                  </motion.div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <Icons.ArrowRightIcon size={14} className="shrink-0 text-white/15" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-white/35">
            <span className="rounded-full border border-white/8 px-3 py-1">Total latency: ~300–500ms</span>
            <span className="rounded-full border border-white/8 px-3 py-1">TTS alone: &lt;130ms (Murf Falcon)</span>
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/8 px-3 py-1 text-cyan-400">Barge-in interruption supported</span>
            <span className="rounded-full border border-purple-500/20 bg-purple-500/8 px-3 py-1 text-purple-400">13 languages · auto-detect</span>
          </div>
        </SectionCard>

        {/* ── Backend + Frontend stacks ───────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Backend */}
          <SectionCard>
            <SectionTitle>Backend Stack</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {BACKEND_STACK.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1 rounded-xl border border-white/6 bg-white/3 p-4"
                >
                  <div className={`mb-1 inline-flex size-8 items-center justify-center rounded-lg border border-white/8 bg-white/5 ${item.color}`}>
                    <item.icon size={16} weight="duotone" />
                  </div>
                  <div className="text-[9px] font-bold tracking-widest text-white/35 uppercase">{item.label}</div>
                  <div className="text-xs font-bold text-white">{item.value}</div>
                  <div className="text-[9px] text-white/30 leading-tight">{item.note}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Frontend */}
          <SectionCard>
            <SectionTitle>Frontend Stack</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {FRONTEND_STACK.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1 rounded-xl border border-white/6 bg-white/3 p-4"
                >
                  <div className={`mb-1 inline-flex size-8 items-center justify-center rounded-lg border border-white/8 bg-white/5 ${item.color}`}>
                    <item.icon size={16} weight="duotone" />
                  </div>
                  <div className="text-[9px] font-bold tracking-widest text-white/35 uppercase">{item.label}</div>
                  <div className="text-xs font-bold text-white">{item.value}</div>
                  <div className="text-[9px] text-white/30 leading-tight">{item.note}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ── Services + Languages ─────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-5">

          {/* Pipeline Health */}
          <SectionCard className="lg:col-span-2">
            <SectionTitle>Pipeline Health</SectionTitle>
            <div className="space-y-3">
              {SERVICES.map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-white/60">{s.label}</span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="text-[10px] font-bold text-white/30">{s.status}</span>
                    <div className={`size-1.5 rounded-full ${s.dot} animate-pulse`} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Language support */}
          <SectionCard className="lg:col-span-3">
            <SectionTitle>Supported Languages &amp; Murf Voices</SectionTitle>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  className="flex items-center gap-2 rounded-xl border border-white/6 bg-white/3 px-3 py-2"
                >
                  <span className="text-base leading-none">{lang.flag}</span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-white truncate">{lang.name}</div>
                    <div className="text-[9px] text-white/30 truncate">{lang.voice}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ── How Language Switching Works ─────────────────────────────────── */}
        <SectionCard>
          <SectionTitle>How Multilingual Detection Works</SectionTitle>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Script Analysis',
                desc: 'Unicode block scanning identifies Devanagari (Hindi), Tamil script, Arabic, CJK, etc. — works even when STT misreports language.',
                color: 'text-cyan-400',
                border: 'border-cyan-500/20',
                bg: 'bg-cyan-500/5',
              },
              {
                step: '02',
                title: 'Deepgram Language Code',
                desc: 'With detect_language=True, Deepgram returns per-utterance ISO codes. Used as a secondary signal to confirm script detection.',
                color: 'text-purple-400',
                border: 'border-purple-500/20',
                bg: 'bg-purple-500/5',
              },
              {
                step: '03',
                title: 'Live Config Switch',
                desc: 'On language change: Murf TTS voice swaps, Gemini system prompt updates, and the agent continues seamlessly mid-conversation.',
                color: 'text-emerald-400',
                border: 'border-emerald-500/20',
                bg: 'bg-emerald-500/5',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`rounded-xl border ${item.border} ${item.bg} p-5`}
              >
                <div className={`mb-3 text-[10px] font-black tracking-widest uppercase ${item.color}`}>
                  Step {item.step}
                </div>
                <div className="mb-2 text-sm font-bold text-white">{item.title}</div>
                <div className="text-xs leading-relaxed text-white/45">{item.desc}</div>
              </div>
            ))}
          </div>
        </SectionCard>

      </main>
    </div>
  );
}
