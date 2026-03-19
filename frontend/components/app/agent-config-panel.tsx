'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Globe, User, Building, ChevronRight } from 'lucide-react';
import {
  AgentConfig,
  AgentRole,
  AgentTone,
  DEFAULT_AGENT_CONFIG,
  SUPPORTED_LANGUAGES,
  AVAILABLE_VOICES,
  VoiceId,
} from '@/types/agent-config';
import { Button } from '@/components/ui/button';

interface AgentConfigPanelProps {
  config: Partial<AgentConfig>;
  onConfigChange: (config: Partial<AgentConfig>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const LANG_NAMES: Record<string, string> = {
  en: 'English', hi: 'Hindi — हिंदी', ta: 'Tamil — தமிழ்',
  es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
  pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean',
  zh: 'Chinese', ar: 'Arabic',
};

export const AgentConfigPanel: React.FC<AgentConfigPanelProps> = ({
  config, onConfigChange, isOpen, onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'role' | 'company'>('voice');

  const updateConfig = (updates: Partial<AgentConfig>) =>
    onConfigChange({ ...config, ...updates });

  const updateCompanyConfig = (updates: Partial<AgentConfig['company']>) =>
    onConfigChange({
      ...config,
      company: { ...DEFAULT_AGENT_CONFIG.company, ...config.company, ...updates },
    });

  const addService = () =>
    updateCompanyConfig({ services: [...(config.company?.services || []), ''] });

  const updateService = (i: number, val: string) => {
    const s = [...(config.company?.services || [])];
    s[i] = val;
    updateCompanyConfig({ services: s });
  };

  const removeService = (i: number) =>
    updateCompanyConfig({
      services: (config.company?.services || []).filter((_, idx) => idx !== i),
    });

  return (
    <>
      {/* Toggle button — bottom-left, above control bar */}
      <button
        onClick={onToggle}
        style={{ zIndex: 40 }}
        className="fixed bottom-28 left-6 flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-[11px] font-bold tracking-widest text-white/60 uppercase backdrop-blur-xl hover:text-white hover:bg-black/80 transition-all duration-200 shadow-lg"
      >
        <Settings size={14} />
        Configure
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              style={{ zIndex: 60 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 420 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 420 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              style={{ zIndex: 70, background: '#09090b' }}
              className="fixed right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/8 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/6 px-7 py-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-white">Agent Config</h2>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-white/35">
                    Customize voice · role · company
                  </p>
                </div>
                <button
                  onClick={onToggle}
                  className="flex size-9 items-center justify-center rounded-full border border-white/8 text-white/40 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="mx-7 mt-6 flex gap-1 rounded-xl border border-white/6 bg-white/3 p-1">
                {([
                  { id: 'voice', label: 'Voice', icon: Globe },
                  { id: 'role', label: 'Role', icon: User },
                  { id: 'company', label: 'Company', icon: Building },
                ] as const).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black tracking-widest uppercase transition-all duration-200 ${
                      activeTab === id
                        ? 'bg-white/10 text-white shadow'
                        : 'text-white/30 hover:text-white/60'
                    }`}
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="no-scrollbar flex-1 overflow-y-auto px-7 py-6 space-y-6">

                {/* ── VOICE TAB ── */}
                {activeTab === 'voice' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black tracking-widest text-white/35 uppercase">
                        Language
                      </label>
                      <select
                        value={config.language || DEFAULT_AGENT_CONFIG.language}
                        onChange={(e) => updateConfig({ language: e.target.value })}
                        style={{
                          width: '100%',
                          height: '3rem',
                          padding: '0 2.5rem 0 1rem',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          cursor: 'pointer',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.75rem center',
                        }}
                      >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <option key={lang} value={lang} style={{ background: '#09090b', color: '#f8fafc' }}>
                            {LANG_NAMES[lang] || lang.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black tracking-widest text-white/35 uppercase">
                        Voice Profile
                      </label>
                      <select
                        value={config.voice_id || DEFAULT_AGENT_CONFIG.voice_id}
                        onChange={(e) => updateConfig({ voice_id: e.target.value as VoiceId })}
                        style={{
                          width: '100%',
                          height: '3rem',
                          padding: '0 2.5rem 0 1rem',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          cursor: 'pointer',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.75rem center',
                        }}
                      >
                        {AVAILABLE_VOICES.map((voice) => (
                          <option key={voice} value={voice} style={{ background: '#09090b', color: '#f8fafc' }}>
                            {voice.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black tracking-widest text-white/35 uppercase">
                        Tone
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['friendly', 'calm', 'urgent'] as AgentTone[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => updateConfig({ tone: t })}
                            className={`h-10 rounded-xl border text-[10px] font-black tracking-widest uppercase transition-all duration-200 ${
                              (config.tone || DEFAULT_AGENT_CONFIG.tone) === t
                                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                                : 'border-white/8 bg-white/4 text-white/35 hover:text-white/70'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── ROLE TAB ── */}
                {activeTab === 'role' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <label className="block text-[10px] font-black tracking-widest text-white/35 uppercase">
                      Agent Role
                    </label>
                    {((['receptionist', 'sales', 'support', 'assistant'] as AgentRole[])).map((r) => (
                      <button
                        key={r}
                        onClick={() => updateConfig({ role: r })}
                        className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all duration-200 ${
                          (config.role || DEFAULT_AGENT_CONFIG.role) === r
                            ? 'border-cyan-500/50 bg-cyan-500/8'
                            : 'border-white/6 bg-white/3 hover:border-white/12'
                        }`}
                      >
                        <div>
                          <div className={`text-xs font-black tracking-widest uppercase ${
                            (config.role || DEFAULT_AGENT_CONFIG.role) === r ? 'text-cyan-400' : 'text-white/65'
                          }`}>
                            {r}
                          </div>
                          <div className="mt-0.5 text-[10px] text-white/35">
                            {r === 'receptionist' && 'Scheduling, greetings & office info'}
                            {r === 'sales' && 'Product knowledge & lead capture'}
                            {r === 'support' && 'Help, troubleshooting & escalation'}
                            {r === 'assistant' && 'General tasks & information'}
                          </div>
                        </div>
                        <ChevronRight
                          size={14}
                          className={(config.role || DEFAULT_AGENT_CONFIG.role) === r ? 'text-cyan-400' : 'text-white/15'}
                        />
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* ── COMPANY TAB ── */}
                {activeTab === 'company' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black tracking-widest text-white/35 uppercase">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={config.company?.name || DEFAULT_AGENT_CONFIG.company.name}
                        onChange={(e) => updateCompanyConfig({ name: e.target.value })}
                        placeholder="e.g. Acme Corp"
                        style={{
                          width: '100%',
                          height: '3rem',
                          padding: '0 1rem',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black tracking-widest text-white/35 uppercase">
                        Description
                      </label>
                      <textarea
                        value={config.company?.description || DEFAULT_AGENT_CONFIG.company.description}
                        onChange={(e) => updateCompanyConfig({ description: e.target.value })}
                        placeholder="What does your company do?"
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          resize: 'none',
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black tracking-widest text-white/35 uppercase">
                        Services
                      </label>
                      {(config.company?.services || DEFAULT_AGENT_CONFIG.company.services).map((svc, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={svc}
                            onChange={(e) => updateService(i, e.target.value)}
                            placeholder="e.g. 24/7 support"
                            style={{
                              flex: 1,
                              height: '2.5rem',
                              padding: '0 0.75rem',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '0.625rem',
                              color: '#f8fafc',
                              fontSize: '0.8125rem',
                            }}
                          />
                          <button
                            onClick={() => removeService(i)}
                            className="flex size-10 items-center justify-center rounded-xl border border-white/6 text-white/25 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addService}
                        className="w-full rounded-xl border border-dashed border-white/12 py-2.5 text-[10px] font-black tracking-widest text-white/30 uppercase hover:border-white/25 hover:text-white/60 transition-colors"
                      >
                        + Add Service
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/6 p-6">
                <button
                  onClick={onToggle}
                  className="w-full rounded-2xl bg-white py-3.5 text-xs font-black tracking-widest text-black uppercase shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-white/90 transition-colors"
                >
                  Apply Configuration
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
