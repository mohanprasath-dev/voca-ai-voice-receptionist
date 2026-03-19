# Configuration module for Voca AI
from .multilingual_config import (
    DEFAULT_AGENT_CONFIG,
    merge_config,
    validate_agent_config,
    resolve_final_config,
    get_voice_for_language,
    get_voice,
    get_role,
    get_company,
    get_language,
    generate_multilingual_system_prompt,
    VOICE_MAP,
    SUPPORTED_LANGUAGES
)

# AppConfig and DEFAULT_CONFIG are imported from the parent config.py
# They are not re-exported from here to avoid circular imports

__all__ = [
    'DEFAULT_AGENT_CONFIG',
    'merge_config', 
    'validate_agent_config',
    'resolve_final_config',
    'get_voice_for_language',
    'get_voice',
    'get_role',
    'get_company',
    'get_language',
    'generate_multilingual_system_prompt',
    'VOICE_MAP',
    'SUPPORTED_LANGUAGES'
]
