'use client';

import { useState, useCallback } from 'react';
import { AgentConfig, DEFAULT_AGENT_CONFIG } from '@/types/agent-config';

export const useAgentConfig = () => {
  const [config, setConfig] = useState<Partial<AgentConfig>>({});

  const updateConfig = useCallback((updates: Partial<AgentConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const getFinalConfig = useCallback((): AgentConfig => {
    function merge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
      const result = { ...target };
      for (const key in source) {
        const v = source[key];
        if (v === null || v === undefined) continue;
        if (key in result && typeof result[key] === 'object' && typeof v === 'object') {
          result[key] = merge(result[key] as Record<string, unknown>, v as Record<string, unknown>);
        } else {
          result[key] = v;
        }
      }
      return result;
    }
    return merge(
      DEFAULT_AGENT_CONFIG as unknown as Record<string, unknown>,
      config as Record<string, unknown>
    ) as unknown as AgentConfig;
  }, [config]);

  return {
    config,
    updateConfig,
    getFinalConfig,
    isLoading: false,
  };
};
