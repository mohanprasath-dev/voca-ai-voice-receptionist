"""
Multilingual agent configuration — Voca AI Voice Receptionist
"""

import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

logger = logging.getLogger("voca.config")

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
    "zh": "zh-CN-xiaoxiao",
}

SUPPORTED_LANGUAGES = list(VOICE_MAP.keys())
VALID_ROLES = ["receptionist", "sales", "support", "assistant"]
AVAILABLE_VOICES = list(VOICE_MAP.values()) + [
    "en-US-matthew", "en-US-brian", "en-US-samantha", "en-GB-ryan", "en-GB-serena"
]

DEFAULT_AGENT_CONFIG: Dict[str, Any] = {
    "voice_id": "en-US-natalie",
    "language": "en",
    "role": "receptionist",
    "tone": "friendly",
    "company": {
        "name": "Voca",
        "description": "A real-time AI voice assistant that helps you with information, scheduling, and support.",
        "services": ["answer questions", "schedule appointments", "provide information"],
        "faq": [],
        "custom_instructions": "Be warm, helpful, and speak like a real human.",
    },
}


def merge_config(user_config: Optional[Dict[str, Any]], default: Dict[str, Any]) -> Dict[str, Any]:
    if not user_config:
        return default.copy()

    def _merge(d: Dict, u: Dict) -> Dict:
        r = d.copy()
        for k, v in u.items():
            if v is None:
                continue
            if k in r and isinstance(r[k], dict) and isinstance(v, dict):
                r[k] = _merge(r[k], v)
            else:
                r[k] = v
        return r

    return _merge(default, user_config)


def validate_agent_config(config: Dict[str, Any]) -> Dict[str, Any]:
    c = config.copy()
    if c.get("role") not in VALID_ROLES:
        c["role"] = "receptionist"
    if c.get("voice_id") not in AVAILABLE_VOICES:
        c["voice_id"] = "en-US-natalie"
    if c.get("language") not in SUPPORTED_LANGUAGES:
        c["language"] = "en"
    if "company" not in c:
        c["company"] = DEFAULT_AGENT_CONFIG["company"].copy()
    return c


def get_voice_for_language(language: str, preferred: Optional[str] = None) -> str:
    if preferred and preferred in AVAILABLE_VOICES:
        return preferred
    return VOICE_MAP.get(language, VOICE_MAP["en"])


def resolve_final_config(
    user_config: Optional[Dict[str, Any]],
    detected_language: Optional[str] = None,
) -> Dict[str, Any]:
    merged = merge_config(user_config, DEFAULT_AGENT_CONFIG)
    validated = validate_agent_config(merged)

    target_language = None
    if detected_language and detected_language in SUPPORTED_LANGUAGES:
        target_language = detected_language
    elif validated.get("language") in SUPPORTED_LANGUAGES:
        target_language = validated["language"]

    if target_language:
        validated["language"] = target_language
        user_voice = user_config.get("voice_id") if user_config else None
        if not user_voice or user_voice not in AVAILABLE_VOICES:
            validated["voice_id"] = get_voice_for_language(target_language)

    logger.info(
        f"Config resolved — role={validated['role']} lang={validated['language']} voice={validated['voice_id']}"
    )
    return validated


def get_voice(config: Dict[str, Any]) -> str:
    return config.get("voice_id", DEFAULT_AGENT_CONFIG["voice_id"])


def get_role(config: Dict[str, Any]) -> str:
    return config.get("role", DEFAULT_AGENT_CONFIG["role"])


def get_company(config: Dict[str, Any]) -> Dict[str, Any]:
    return config.get("company", DEFAULT_AGENT_CONFIG["company"])


def get_language(config: Dict[str, Any]) -> str:
    return config.get("language", DEFAULT_AGENT_CONFIG["language"])


def generate_multilingual_system_prompt(config: Dict[str, Any]) -> str:
    """
    Universal prompt — always covers EN/HI/TA.
    Language is matched by Gemini based on what the user actually speaks.
    """
    role = get_role(config)
    language = get_language(config)
    company = get_company(config)
    tone = config.get("tone", "friendly")
    custom_instructions = company.get("custom_instructions", "")
    services = company.get("services", [])
    company_name = company.get("name", "Voca")
    company_description = company.get("description", "")
    services_text = ", ".join(services) if services else "answering questions and providing information"

    GREETING = {
        "en": f"Hey there! Welcome to {company_name}. How can I help you today?",
        "hi": f"नमस्ते! {company_name} में आपका स्वागत है। आज मैं आपकी कैसे मदद कर सकती हूँ?",
        "ta": f"வணக்கம்! {company_name}-க்கு வரவேற்கிறோம். இன்று நான் உங்களுக்கு எப்படி உதவலாம்?",
    }
    greeting = GREETING.get(language, GREETING["en"])

    return f"""You are Voca Assistant, a warm, human voice {role} for {company_name}.
{company_description}

Always respond in {language}.

SERVICES: {services_text}

━━━ LANGUAGE RULES — CRITICAL ━━━

You support English, Hindi, and Tamil.

ALWAYS match the language the user speaks:
- User speaks English  → respond in English only
- User speaks Hindi (हिंदी / Devanagari script) → respond in Hindi only, using Devanagari
- User speaks Tamil (தமிழ் / Tamil script) → respond in Tamil only, using Tamil script
- User switches language → switch immediately in your VERY NEXT response
- NEVER mix languages in the same response

Greet the user (first message only): "{greeting}"

━━━ SPEAKING STYLE ━━━

- Max 2-3 short sentences per response
- NO bullet points, lists, markdown, asterisks, or headers — ever
- English: use contractions (I'm, we're, you'll, isn't, don't)
- Hindi: use "आप" formal pronoun, warm desi tone
- Tamil: warm, natural Tamil — no code-switching
- NEVER say "As an AI" or reveal you are not human
- Sound calm, warm, helpful — like a real person
- Tone: {tone}

━━━ FALLBACK ━━━

When you don't understand:
- English: "Sorry, I didn't catch that. Could you say that again?"
- Hindi: "माफ़ करें, समझ नहीं आया। दोबारा कहेंगे?"
- Tamil: "மன்னிக்கவும், புரியவில்லை. மீண்டும் சொல்லுங்கள்."

{f"CUSTOM: {custom_instructions}" if custom_instructions else ""}""".strip()
