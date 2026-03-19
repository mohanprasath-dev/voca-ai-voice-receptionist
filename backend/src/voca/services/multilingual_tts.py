"""
Multilingual TTS service — Voca AI Voice Receptionist.
Handles dynamic voice selection and language-aware speed tuning.
"""

import logging
from typing import Any, Dict, Optional

from livekit.plugins import murf

from voca.config.multilingual_config import (
    VOICE_MAP,
    get_language,
    get_voice,
    get_voice_for_language,
)

logger = logging.getLogger("voca.multilingual_tts")

# Language-specific TTS speed (Murf range: -10 to +10)
SPEED_MAP: Dict[str, int] = {
    "en": -4,   # Natural English cadence
    "hi": -8,   # Slower for Hindi clarity
    "ta": -8,   # Slower for Tamil clarity
    "es": -5, "fr": -5, "de": -5, "it": -5, "pt": -5,
    "ar": -6, "ru": -6, "ja": -6, "ko": -6, "zh": -6,
}


class MultilingualTTSService:
    def __init__(self):
        self._current_tts: Optional[murf.TTS] = None
        self._current_config: Optional[Dict[str, Any]] = None

    def create_tts_instance(self, config: Dict[str, Any]) -> murf.TTS:
        voice_id = get_voice(config)
        language = get_language(config)
        speed = SPEED_MAP.get(language, -5)

        logger.info(f"Creating TTS: voice={voice_id} lang={language} speed={speed}")

        # Try Falcon model first; fall back if SDK version doesn't support it
        try:
            tts = murf.TTS(
                voice=voice_id,
                model="falcon2",
                style="Conversational",
                speed=speed,
                pitch=0,
                text_pacing=True,
            )
        except TypeError:
            logger.warning("Murf SDK does not support 'model' param — using default model")
            tts = murf.TTS(
                voice=voice_id,
                style="Conversational",
                speed=speed,
                pitch=0,
                text_pacing=True,
            )

        self._current_tts = tts
        self._current_config = config.copy()
        return tts

    def update_tts_for_language(
        self, detected_language: str, current_config: Dict[str, Any]
    ) -> Optional[murf.TTS]:
        """Return a new TTS instance if language has changed, else None."""
        if detected_language == get_language(current_config):
            return None

        updated = current_config.copy()
        updated["language"] = detected_language
        updated["voice_id"] = get_voice_for_language(detected_language)
        return self.create_tts_instance(updated)

    def validate_voice_id(self, voice_id: str) -> bool:
        from voca.config.multilingual_config import AVAILABLE_VOICES
        return voice_id in AVAILABLE_VOICES

    def get_fallback_voice(self, language: str) -> str:
        return VOICE_MAP.get(language, VOICE_MAP["en"])


multilingual_tts_service = MultilingualTTSService()
