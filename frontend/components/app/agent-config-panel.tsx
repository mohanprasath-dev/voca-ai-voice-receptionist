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

export const AgentConfigPanel: React.FC<AgentConfigPanelProps> = ({
  config,
  onConfigChange,
  isOpen,
  onToggle
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'role' | 'company'>('voice');

  const updateConfig = (updates: Partial<AgentConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const updateCompanyConfig = (updates: Partial<AgentConfig['company']>) => {
    onConfigChange({
      ...config,
      company: { ...DEFAULT_AGENT_CONFIG.company, ...config.company, ...updates }
    });
  };

  const addService = () => {
    const currentServices = config.company?.services || [];
    updateCompanyConfig({
      services: [...currentServices, '']
    });
  };

  const updateService = (index: number, value: string) => {
    const currentServices = config.company?.services || [];
    const updatedServices = [...currentServices];
    updatedServices[index] = value;
    updateCompanyConfig({ services: updatedServices });
  };

  const removeService = (index: number) => {
    const currentServices = config.company?.services || [];
    updateCompanyConfig({
      services: currentServices.filter((_, i) => i !== index)
    });
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-10 left-8 z-40 bg-white/5 backdrop-blur-xl border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-xl px-4 h-12 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
      >
        <Settings className="w-4 h-4 mr-2" />
        Configure Agent
      </Button>

      {/* Configuration Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
            />
            
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#080808] border-l border-white/5 z-70 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-8 border-b border-white/5">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">Agent Persona</h2>
                  <p className="text-xs text-white/40 font-medium mt-1 uppercase tracking-widest">Customize your voice experience</p>
                </div>
                <Button
                  onClick={onToggle}
                  variant="ghost"
                  size="sm"
                  className="size-10 rounded-full text-white/40 hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex p-2 bg-white/5 mx-8 mt-8 rounded-2xl gap-1">
                {[
                  { id: 'voice', label: 'Voice', icon: Globe },
                  { id: 'role', label: 'Role', icon: User },
                  { id: 'company', label: 'Company', icon: Building }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as 'voice' | 'role' | 'company')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 ${
                      activeTab === id
                        ? 'text-white bg-white/10 shadow-lg'
                        : 'text-white/30 hover:text-white/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                {activeTab === 'voice' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-white/30 uppercase ml-1">Native Language</label>
                        <select
                          value={config.language || DEFAULT_AGENT_CONFIG.language}
                          onChange={(e) => updateConfig({ language: e.target.value })}
                          className="w-full h-12 px-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium text-white appearance-none focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
                        >
                          {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang} value={lang} className="bg-[#080808]">
                              {lang.toUpperCase()} - {new Intl.DisplayNames([lang], { type: 'language' }).of(lang)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-white/30 uppercase ml-1">Voice Profile</label>
                        <select
                          value={config.voice_id || DEFAULT_AGENT_CONFIG.voice_id}
                          onChange={(e) => updateConfig({ voice_id: e.target.value as VoiceId })}
                          className="w-full h-12 px-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium text-white appearance-none focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
                        >
                          {AVAILABLE_VOICES.map((voice) => (
                            <option key={voice} value={voice} className="bg-[#080808]">
                              {voice.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-white/30 uppercase ml-1">Conversational Tone</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['friendly', 'calm', 'urgent'].map((t) => (
                            <button
                              key={t}
                              onClick={() => updateConfig({ tone: t as AgentTone })}
                              className={`h-10 rounded-xl text-[10px] font-black tracking-widest uppercase border transition-all duration-300 ${
                                (config.tone || DEFAULT_AGENT_CONFIG.tone) === t
                                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                                  : 'bg-white/5 border-white/5 text-white/30 hover:text-white/60'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'role' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest text-white/30 uppercase ml-1">System Instructions</label>
                      <div className="grid grid-cols-1 gap-3">
                        {['receptionist', 'sales', 'support', 'assistant'].map((r) => (
                          <button
                            key={r}
                            onClick={() => updateConfig({ role: r as AgentRole })}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left ${
                              (config.role || DEFAULT_AGENT_CONFIG.role) === r
                                ? 'bg-cyan-500/10 border-cyan-500/50'
                                : 'bg-white/5 border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div>
                              <div className={`text-xs font-black tracking-widest uppercase mb-1 ${
                                (config.role || DEFAULT_AGENT_CONFIG.role) === r ? 'text-cyan-400' : 'text-white/70'
                              }`}>
                                {r}
                              </div>
                              <div className="text-[10px] text-white/40 font-medium">
                                {r === 'receptionist' && 'Appointment scheduling & office info'}
                                {r === 'sales' && 'Product knowledge & lead capture'}
                                {r === 'support' && 'Technical help & troubleshooting'}
                                {r === 'assistant' && 'General productivity & information'}
                              </div>
                            </div>
                            <ChevronRight size={16} className={
                              (config.role || DEFAULT_AGENT_CONFIG.role) === r ? 'text-cyan-400' : 'text-white/20'
                            } />
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'company' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-white/30 uppercase ml-1">Organization Identity</label>
                        <input
                          type="text"
                          value={config.company?.name || DEFAULT_AGENT_CONFIG.company.name}
                          onChange={(e) => updateCompanyConfig({ name: e.target.value })}
                          className="w-full h-12 px-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                          placeholder="Company name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-white/30 uppercase ml-1">Core Mission</label>
                        <textarea
                          value={config.company?.description || DEFAULT_AGENT_CONFIG.company.description}
                          onChange={(e) => updateCompanyConfig({ description: e.target.value })}
                          className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-cyan-500/50 transition-colors resize-none h-24"
                          placeholder="Describe your organization..."
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black tracking-widest text-white/30 uppercase ml-1">Key Services</label>
                        <div className="space-y-2">
                          {(config.company?.services || DEFAULT_AGENT_CONFIG.company.services).map((service, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={service}
                                onChange={(e) => updateService(index, e.target.value)}
                                className="flex-1 h-10 px-4 bg-white/5 border border-white/5 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                placeholder="e.g. 24/7 technical support"
                              />
                              <Button
                                onClick={() => removeService(index)}
                                variant="ghost"
                                size="sm"
                                className="size-10 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-400/10"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            onClick={addService}
                            variant="outline"
                            className="w-full h-10 border-white/5 bg-white/5 text-[10px] font-black tracking-widest uppercase text-white/40 hover:text-white hover:bg-white/10 rounded-xl mt-2"
                          >
                            Add New Service
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-white/5">
                <Button
                  onClick={onToggle}
                  className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-black tracking-widest uppercase text-xs shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                >
                  Apply Configuration
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
