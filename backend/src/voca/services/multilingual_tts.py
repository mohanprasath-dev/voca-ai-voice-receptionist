"""
Multilingual TTS service for Voca AI Voice Receptionist.

Handles dynamic voice selection based on language and configuration.
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


class MultilingualTTSService:
    """Service for managing multilingual text-to-speech with dynamic voice selection."""

    def __init__(self):
        self._current_tts = None
        self._current_config = None
        self._voice_cache = {}

    def create_tts_instance(self, config: Dict[str, Any]) -> murf.TTS:
        """
        Create a new Murf TTS instance based on configuration.
        
        Args:
            config: Agent configuration
            
        Returns:
            Configured Murf TTS instance
        """
        voice_id = get_voice(config)
        language = get_language(config)

        logger.info(f"Creating Falcon TTS with voice: {voice_id} for language: {language}")

        # Get language-specific speed — Hindi and Tamil need slightly slower pace
        speed = self._get_speed_for_language(language)

        try:
            tts_instance = murf.TTS(
                voice=voice_id,
                model="falcon2",         # Murf Falcon model — sub-130ms latency
                style="Conversational",
                speed=speed,
                pitch=0,
                text_pacing=True,
            )
        except TypeError:
            # Backward compatibility for plugin versions that don't accept `model`.
            logger.warning("Murf SDK does not support `model` parameter; falling back to default model")
            tts_instance = murf.TTS(
                voice=voice_id,
                style="Conversational",
                speed=speed,
                pitch=0,
                text_pacing=True,
            )

        self._current_tts = tts_instance
        self._current_config = config.copy()

        return tts_instance

    def _get_speed_for_language(self, language: str) -> int:
        """
        Get optimal TTS speed for each language.
        Hindi and Tamil need slightly slower pace for clarity.
        English benefits from a natural conversational pace.
        """
        SPEED_MAP = {
            "en": -4,   # Natural conversational English
            "hi": -8,   # Slower for Hindi clarity and naturalness
            "ta": -8,   # Slower for Tamil clarity
            "es": -5,
            "fr": -5,
            "ar": -6,
            "de": -5,
            "it": -5,
            "pt": -5,
            "ru": -6,
            "ja": -6,
            "ko": -6,
            "zh": -6,
        }
        return SPEED_MAP.get(language, -5)

    def update_tts_for_language(self, detected_language: str, current_config: Dict[str, Any]) -> Optional[murf.TTS]:
        """
        Update TTS instance if language has changed.
        
        Args:
            detected_language: Newly detected language
            current_config: Current agent configuration
            
        Returns:
            New TTS instance if language changed, None otherwise
        """
        current_language = get_language(current_config)

        if detected_language != current_language:
            logger.info(f"Language changed from {current_language} to {detected_language}")

            # Update configuration with new language
            updated_config = current_config.copy()
            updated_config["language"] = detected_language

            # Update voice to match new language
            user_voice = updated_config.get("voice_id")
            if not user_voice or not self.validate_voice_id(str(user_voice)):
                updated_config["voice_id"] = get_voice_for_language(detected_language)
                logger.info(f"Updated voice to: {updated_config['voice_id']}")

            return self.create_tts_instance(updated_config)

        return None

    def get_current_voice(self) -> Optional[str]:
        """Get the voice ID of the current TTS instance."""
        if self._current_config:
            return get_voice(self._current_config)
        return None

    def get_current_language(self) -> Optional[str]:
        """Get the language of the current TTS instance."""
        if self._current_config:
            return get_language(self._current_config)
        return None

    def validate_voice_id(self, voice_id: str) -> bool:
        """
        Validate if a voice ID is supported.
        
        Args:
            voice_id: Voice ID to validate
            
        Returns:
            True if voice is supported, False otherwise
        """
        from voca.config.multilingual_config import AVAILABLE_VOICES
        return voice_id in AVAILABLE_VOICES

    def get_fallback_voice(self, language: str) -> str:
        """
        Get fallback voice for a language.
        
        Args:
            language: Language code
            
        Returns:
            Fallback voice ID
        """
        return VOICE_MAP.get(language, VOICE_MAP["en"])


# Global TTS service instance
multilingual_tts_service = MultilingualTTSService()
