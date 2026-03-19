'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Globe, User, Building, MessageSquare } from 'lucide-react';
import { AgentConfig, DEFAULT_AGENT_CONFIG, SUPPORTED_LANGUAGES, AVAILABLE_VOICES } from '@/types/agent-config';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

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
        className="fixed top-4 right-4 z-40 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
      >
        <Settings className="w-4 h-4 mr-2" />
        Agent Config
      </Button>

      {/* Configuration Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-black/80 backdrop-blur-xl border-l border-white/10 z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">Agent Configuration</h2>
                <Button
                  onClick={onToggle}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10">
                {[
                  { id: 'voice', label: 'Voice', icon: Globe },
                  { id: 'role', label: 'Role', icon: User },
                  { id: 'company', label: 'Company', icon: Building }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === id
                        ? 'text-white border-b-2 border-cyan-500 bg-white/5'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'voice' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Language
                      </label>
                      <select
                        value={config.language || DEFAULT_AGENT_CONFIG.language}
                        onChange={(e) => updateConfig({ language: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang.toUpperCase()} - {new Intl.DisplayNames([lang], { type: 'language' }).of(lang)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Voice
                      </label>
                      <select
                        value={config.voice_id || DEFAULT_AGENT_CONFIG.voice_id}
                        onChange={(e) => updateConfig({ voice_id: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        {AVAILABLE_VOICES.map((voice) => (
                          <option key={voice} value={voice}>
                            {voice}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Tone
                      </label>
                      <select
                        value={config.tone || DEFAULT_AGENT_CONFIG.tone}
                        onChange={(e) => updateConfig({ tone: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="friendly">Friendly</option>
                        <option value="calm">Calm</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'role' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Agent Role
                      </label>
                      <select
                        value={config.role || DEFAULT_AGENT_CONFIG.role}
                        onChange={(e) => updateConfig({ role: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="receptionist">Receptionist</option>
                        <option value="sales">Sales</option>
                        <option value="support">Support</option>
                        <option value="assistant">Assistant</option>
                      </select>
                    </div>

                    <GlassCard className="p-4">
                      <h4 className="text-sm font-medium text-white/80 mb-2">Role Description</h4>
                      <p className="text-xs text-white/60">
                        {config.role === 'receptionist' && 'Handles appointments, directions, and basic inquiries.'}
                        {config.role === 'sales' && 'Focuses on product information, pricing, and lead generation.'}
                        {config.role === 'support' && 'Provides technical assistance and troubleshooting.'}
                        {config.role === 'assistant' && 'General purpose help with various tasks and information.'}
                      </p>
                    </GlassCard>
                  </motion.div>
                )}

                {activeTab === 'company' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={config.company?.name || DEFAULT_AGENT_CONFIG.company.name}
                        onChange={(e) => updateCompanyConfig({ name: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Company name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Description
                      </label>
                      <textarea
                        value={config.company?.description || DEFAULT_AGENT_CONFIG.company.description}
                        onChange={(e) => updateCompanyConfig({ description: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                        rows={3}
                        placeholder="What your company does"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Services
                      </label>
                      <div className="space-y-2">
                        {(config.company?.services || DEFAULT_AGENT_CONFIG.company.services).map((service, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={service}
                              onChange={(e) => updateService(index, e.target.value)}
                              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              placeholder="Service description"
                            />
                            <Button
                              onClick={() => removeService(index)}
                              variant="ghost"
                              size="sm"
                              className="text-white/60 hover:text-white hover:bg-white/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={addService}
                          variant="outline"
                          size="sm"
                          className="w-full border-white/20 text-white/60 hover:text-white hover:bg-white/10"
                        >
                          Add Service
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Custom Instructions
                      </label>
                      <textarea
                        value={config.company?.custom_instructions || DEFAULT_AGENT_CONFIG.company.custom_instructions}
                        onChange={(e) => updateCompanyConfig({ custom_instructions: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                        rows={3}
                        placeholder="Specific instructions for the agent"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
