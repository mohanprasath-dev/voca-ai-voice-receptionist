'use client';

import { useState, useCallback, useEffect } from 'react';
import { AgentConfig, DEFAULT_AGENT_CONFIG } from '@/types/agent-config';

export const useAgentConfig = () => {
  const [config, setConfig] = useState<Partial<AgentConfig>>(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('voca-agent-config');
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  const [isLoading, setIsLoading] = useState(false);

  // Save to localStorage whenever config changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('voca-agent-config', JSON.stringify(config));
      } catch (error) {
        console.warn('Failed to save agent config to localStorage:', error);
      }
    }
  }, [config]);

  const updateConfig = useCallback((updates: Partial<AgentConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('voca-agent-config');
    }
  }, []);

  const getFinalConfig = useCallback((): AgentConfig => {
    // Deep merge with defaults
    const mergeDeep = (target: any, source: any): any => {
      const result = { ...target };
      
      for (const key in source) {
        if (source[key] === null || source[key] === undefined) {
          continue;
        }
        
        if (key in result && typeof result[key] === 'object' && typeof source[key] === 'object') {
          result[key] = mergeDeep(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
      
      return result;
    };

    return mergeDeep(DEFAULT_AGENT_CONFIG, config);
  }, [config]);

  const validateConfig = useCallback((configToValidate: Partial<AgentConfig>): string[] => {
    const errors: string[] = [];

    // Validate role
    if (configToValidate.role && !['receptionist', 'sales', 'support', 'assistant'].includes(configToValidate.role)) {
      errors.push('Invalid role. Must be: receptionist, sales, support, or assistant');
    }

    // Validate language
    if (configToValidate.language && !['en', 'hi', 'ta', 'es', 'fr', 'ar', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'].includes(configToValidate.language)) {
      errors.push('Invalid language code. Use ISO 639-1 codes (en, hi, ta, etc.)');
    }

    // Validate voice
    if (configToValidate.voice_id) {
      const validVoices = [
        ...Object.values({
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
        }),
        'en-US-matthew',
        'en-US-brian',
        'en-US-samantha',
        'en-GB-ryan',
        'en-GB-serena'
      ];
      
      if (!validVoices.includes(configToValidate.voice_id)) {
        errors.push('Invalid voice ID. Please select from available voices');
      }
    }

    // Validate tone
    if (configToValidate.tone && !['friendly', 'calm', 'urgent'].includes(configToValidate.tone)) {
      errors.push('Invalid tone. Must be: friendly, calm, or urgent');
    }

    return errors;
  }, []);

  const exportConfig = useCallback(() => {
    const finalConfig = getFinalConfig();
    const dataStr = JSON.stringify(finalConfig, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'voca-agent-config.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [getFinalConfig]);

  const importConfig = useCallback((file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        const errors = validateConfig(imported);
        
        if (errors.length > 0) {
          throw new Error(errors.join(', '));
        }
        
        updateConfig(imported);
      } catch (error) {
        console.error('Failed to import config:', error);
        alert('Failed to import configuration: ' + (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      alert('Failed to read file');
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  }, [updateConfig, validateConfig]);

  return {
    config,
    updateConfig,
    resetConfig,
    getFinalConfig,
    validateConfig,
    exportConfig,
    importConfig,
    isLoading
  };
};
