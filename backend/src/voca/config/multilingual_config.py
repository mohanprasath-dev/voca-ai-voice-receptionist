"""
Multilingual agent configuration system for Voca AI Voice Receptionist.

Provides comprehensive configuration management with:
- Default agent configuration
- Deep merge capabilities
- Validation layer
- Voice mapping
- Safe access helpers
"""

import logging
from typing import Dict, Any, Optional, List, Union
from dataclasses import dataclass, field

logger = logging.getLogger("voca.config")


# Voice mapping for different languages
VOICE_MAP = {
    "en": "en-US-natalie",
    "hi": "hi-IN-aditi",
    "ta": "ta-IN-kavitha", 
    "es": "es-ES-laura",
    "fr": "fr-FR-natalie",
    "ar": "ar-SA-fatima",
    "de": "de-DE-clara",
    "it": "it-IT-isabella",
    "pt": "pt-BR-camila",
    "ru": "ru-RU-daria",
    "ja": "ja-JP-nanami",
    "ko": "ko-KR-jihun",
    "zh": "zh-CN-xiaoxiao"
}

# Supported languages (ISO codes)
SUPPORTED_LANGUAGES = list(VOICE_MAP.keys())

# Supported roles
VALID_ROLES = ["receptionist", "sales", "support", "assistant"]

# Available voices for validation
AVAILABLE_VOICES = list(VOICE_MAP.values()) + [
    "en-US-matthew",
    "en-US-brian", 
    "en-US-samantha",
    "en-GB-ryan",
    "en-GB-serena"
]


@dataclass
class CompanyConfig:
    """Company-specific configuration."""
    name: str = "Voca Assistant"
    description: str = "A smart AI voice assistant that helps users with tasks, scheduling, and information."
    services: List[str] = field(default_factory=lambda: [
        "answer questions",
        "schedule appointments", 
        "provide information"
    ])
    faq: List[str] = field(default_factory=list)
    custom_instructions: str = "Be helpful, concise, and human-like."


@dataclass
class AgentConfig:
    """Complete agent configuration."""
    voice_id: str = "en-US-natalie"
    language: str = "en"
    role: str = "receptionist"
    tone: str = "friendly"
    company: CompanyConfig = field(default_factory=CompanyConfig)


# Default agent configuration
DEFAULT_AGENT_CONFIG = {
    "voice_id": "en-US-natalie",
    "language": "en", 
    "role": "receptionist",
    "tone": "friendly",
    "company": {
        "name": "Voca Assistant",
        "description": "A smart AI voice assistant that helps users with tasks, scheduling, and information.",
        "services": [
            "answer questions",
            "schedule appointments",
            "provide information"
        ],
        "faq": [],
        "custom_instructions": "Be helpful, concise, and human-like."
    }
}


def merge_config(user_config: Optional[Dict[str, Any]], default_config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Deep merge user config with default config.
    
    Args:
        user_config: User-provided configuration (can be None/partial)
        default_config: Default configuration to fall back to
        
    Returns:
        Complete merged configuration
    """
    if not user_config:
        return default_config.copy()
    
    def _deep_merge(default: Dict[str, Any], user: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively merge two dictionaries."""
        result = default.copy()
        
        for key, user_value in user.items():
            # Skip None/undefined values
            if user_value is None:
                continue
                
            if key in result:
                if isinstance(result[key], dict) and isinstance(user_value, dict):
                    # Recursively merge nested dictionaries
                    result[key] = _deep_merge(result[key], user_value)
                else:
                    # Override with user value
                    result[key] = user_value
            else:
                # Add new key from user
                result[key] = user_value
                
        return result
    
    return _deep_merge(default_config, user_config)


def validate_agent_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate agent configuration and fix invalid values.
    
    Args:
        config: Configuration to validate
        
    Returns:
        Validated configuration with fixes applied
    """
    validated_config = config.copy()
    
    # Validate role
    if "role" in validated_config:
        role = validated_config["role"]
        if role not in VALID_ROLES:
            logger.warning(f"Invalid role '{role}', falling back to 'receptionist'")
            validated_config["role"] = "receptionist"
    
    # Validate voice_id
    if "voice_id" in validated_config:
        voice_id = validated_config["voice_id"]
        if voice_id not in AVAILABLE_VOICES:
            logger.warning(f"Invalid voice_id '{voice_id}', falling back to 'en-US-natalie'")
            validated_config["voice_id"] = "en-US-natalie"
    
    # Validate language
    if "language" in validated_config:
        language = validated_config["language"]
        if language not in SUPPORTED_LANGUAGES:
            logger.warning(f"Invalid language '{language}', falling back to 'en'")
            validated_config["language"] = "en"
    
    # Ensure company section exists
    if "company" not in validated_config:
        validated_config["company"] = DEFAULT_AGENT_CONFIG["company"].copy()
    
    return validated_config


def get_voice_for_language(language: str, preferred_voice: Optional[str] = None) -> str:
    """
    Get appropriate voice for a language.
    
    Args:
        language: ISO language code
        preferred_voice: User-specified voice preference
        
    Returns:
        Voice ID to use
    """
    # If user specified a valid voice, use it
    if preferred_voice and preferred_voice in AVAILABLE_VOICES:
        return preferred_voice
    
    # Otherwise use language mapping
    return VOICE_MAP.get(language, VOICE_MAP["en"])


def resolve_final_config(user_config: Optional[Dict[str, Any]], detected_language: Optional[str] = None) -> Dict[str, Any]:
    """
    Resolve final configuration with all rules applied.
    
    Args:
        user_config: User-provided configuration
        detected_language: Language detected from user speech
        
    Returns:
        Final resolved configuration
    """
    # Start with default + user merge
    merged_config = merge_config(user_config, DEFAULT_AGENT_CONFIG)
    
    # Validate the merged config
    validated_config = validate_agent_config(merged_config)
    
    # Override language if detected
    if detected_language and detected_language in SUPPORTED_LANGUAGES:
        logger.info(f"Detected language: {detected_language}")
        validated_config["language"] = detected_language
        
        # Update voice to match detected language if no user preference
        user_voice = user_config.get("voice_id") if user_config else None
        if not user_voice or user_voice not in AVAILABLE_VOICES:
            validated_config["voice_id"] = get_voice_for_language(detected_language)
            logger.info(f"Using voice: {validated_config['voice_id']}")
    
    logger.info(f"Final config - Role: {validated_config['role']}, Language: {validated_config['language']}, Voice: {validated_config['voice_id']}")
    
    return validated_config


# Safe access helpers
def get_voice(config: Dict[str, Any]) -> str:
    """Safely get voice_id from config."""
    return config.get("voice_id", DEFAULT_AGENT_CONFIG["voice_id"])


def get_role(config: Dict[str, Any]) -> str:
    """Safely get role from config."""
    return config.get("role", DEFAULT_AGENT_CONFIG["role"])


def get_company(config: Dict[str, Any]) -> Dict[str, Any]:
    """Safely get company config from config."""
    return config.get("company", DEFAULT_AGENT_CONFIG["company"])


def get_language(config: Dict[str, Any]) -> str:
    """Safely get language from config."""
    return config.get("language", DEFAULT_AGENT_CONFIG["language"])


def generate_multilingual_system_prompt(config: Dict[str, Any]) -> str:
    """
    Generate dynamic multilingual system prompt.
    
    Args:
        config: Agent configuration
        
    Returns:
        Formatted system prompt
    """
    role = get_role(config)
    language = get_language(config)
    company = get_company(config)
    
    prompt = f"""You are a {role} for {company['name']}.

Company details:
{company['description']}

Services:
{', '.join(company['services'])}

Instructions:
{company['custom_instructions']}

Rules:
- Always respond in {language}
- Match user's language automatically
- Adapt if language changes mid-conversation
- Be natural and human-like
- Use short spoken sentences
- Stay in character as company representative
- Do NOT sound like an AI"""
    
    return prompt.strip()
