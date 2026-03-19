'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AgentConfig, DEFAULT_AGENT_CONFIG } from '@/types/agent-config';
import { useAgentConfig } from '@/hooks/useAgentConfig';

interface AgentConfigContextType {
  config: Partial<AgentConfig>;
  updateConfig: (config: Partial<AgentConfig>) => void;
  getFinalConfig: () => AgentConfig;
  isLoading: boolean;
}

const AgentConfigContext = createContext<AgentConfigContextType | undefined>(undefined);

interface AgentConfigProviderProps {
  children: ReactNode;
}

export function AgentConfigProvider({ children }: AgentConfigProviderProps) {
  const { config, updateConfig, getFinalConfig, isLoading } = useAgentConfig();

  const contextValue: AgentConfigContextType = {
    config,
    updateConfig,
    getFinalConfig,
    isLoading,
  };

  return (
    <AgentConfigContext.Provider value={contextValue}>
      {children}
    </AgentConfigContext.Provider>
  );
}

export function useAgentConfigContext() {
  const context = useContext(AgentConfigContext);
  if (context === undefined) {
    throw new Error('useAgentConfigContext must be used within an AgentConfigProvider');
  }
  return context;
}
