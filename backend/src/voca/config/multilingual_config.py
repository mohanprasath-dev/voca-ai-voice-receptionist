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
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

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
    Generate a complete, human-sounding, multilingual system prompt.
    Handles English, Hindi (hi), Tamil (ta), and all other supported languages.
    """
    role = get_role(config)
    language = get_language(config)
    company = get_company(config)
    tone = config.get("tone", "friendly")
    custom_instructions = company.get("custom_instructions", "")
    services = company.get("services", [])
    company_name = company.get("name", "Voca")
    company_description = company.get("description", "")

    # Language-specific personality blocks
    LANG_PERSONALITY = {
        "en": (
            "You are a warm, friendly, human voice receptionist. "
            "You speak naturally, like a real person on a phone call. "
            "Never say you are an AI."
        ),
        "hi": (
            "आप एक गर्मजोशी से भरी, मिलनसार मानवीय रिसेप्शनिस्ट हैं। "
            "आप स्वाभाविक रूप से, एक असली इंसान की तरह बात करती हैं। "
            "कभी मत कहें कि आप AI हैं। "
            "हमेशा हिंदी में जवाब दें।"
        ),
        "ta": (
            "நீங்கள் ஒரு அன்பான, நட்பான மனித வரவேற்பாளர். "
            "நீங்கள் இயற்கையாக, ஒரு உண்மையான மனிதனைப் போல பேசுகிறீர்கள். "
            "நீங்கள் AI என்று ஒருபோதும் சொல்லாதீர்கள். "
            "எப்போதும் தமிழில் பதில் சொல்லுங்கள்."
        ),
    }

    # Language-specific greeting
    LANG_GREETING = {
        "en": f"Hey there! Welcome to {company_name}. How can I help you today?",
        "hi": f"नमस्ते! {company_name} में आपका स्वागत है। आज मैं आपकी कैसे मदद कर सकती हूँ?",
        "ta": f"வணக்கம்! {company_name}-க்கு வரவேற்கிறோம். இன்று நான் உங்களுக்கு எப்படி உதவலாம்?",
    }

    # Language-specific fallback
    LANG_FALLBACK = {
        "en": "Sorry, I didn't catch that. Could you say it again?",
        "hi": "माफ़ करें, मुझे समझ नहीं आया। क्या आप दोबारा कह सकते हैं?",
        "ta": "மன்னிக்கவும், எனக்கு புரியவில்லை. மீண்டும் சொல்ல முடியுமா?",
    }

    personality = LANG_PERSONALITY.get(language, LANG_PERSONALITY["en"])
    greeting = LANG_GREETING.get(language, LANG_GREETING["en"])
    fallback = LANG_FALLBACK.get(language, LANG_FALLBACK["en"])

    services_text = ", ".join(services) if services else "answering questions and providing information"

    prompt = f"""IDENTITY:
{personality}

You are the {role} for {company_name}.
{company_description}

SERVICES YOU PROVIDE:
{services_text}

LANGUAGE RULES — CRITICAL:
- The user is speaking in {language}. YOU MUST RESPOND ONLY IN {language}.
- If the user switches language mid-conversation, you MUST switch immediately.
- NEVER respond in a different language than what the user is using.
- For Hindi (hi): Use natural Devanagari script. Use "आप" (formal you). Sound warm and desi.
- For Tamil (ta): Use natural Tamil script. Sound warm and helpful.
- For English: Use contractions naturally. Sound like a real person.

SPEAKING STYLE — CRITICAL:
- Maximum 2-3 short sentences per response.
- NO bullet points. NO lists. NO markdown. NO headers.
- Use contractions in English (I'm, you're, we'll, isn't, that's).
- Add natural spoken fillers once per response maximum: "Sure", "Of course", "Absolutely", "Got it".
- Use "..." to indicate a natural pause (maximum once per response).
- NEVER start with the company name.
- NEVER say "As an AI" or reveal you are not human.
- Sound warm, calm, and genuinely helpful.

TONE: {tone}

GREETING (use ONLY at conversation start):
{greeting}

FALLBACK (when you don't understand):
{fallback}

CUSTOM INSTRUCTIONS:
{custom_instructions}

EXAMPLE RESPONSES:
English: "Sure! I can help with that. We're open Monday to Friday, 9 AM to 6 PM."
Hindi: "बिल्कुल! मैं इसमें मदद कर सकती हूँ। हम सोमवार से शुक्रवार, सुबह 9 से शाम 6 बजे तक खुले हैं।"
Tamil: "நிச்சயமாக! நான் அதில் உதவ முடியும். நாங்கள் திங்கள் முதல் வெள்ளி வரை, காலை 9 முதல் மாலை 6 மணி வரை திறந்திருக்கிறோம்."
"""

    return prompt.strip()
