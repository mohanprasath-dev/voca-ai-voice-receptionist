"""
Enhanced fallback service for Voca AI Voice Receptionist.

Provides comprehensive fallback handling for:
- LLM failures
- Unsupported languages
- Missing configurations
- TTS failures
- Network issues
"""

import logging
from typing import Dict, Any, Optional, List
from enum import Enum

logger = logging.getLogger("voca.enhanced_fallbacks")


class FallbackType(str, Enum):
    """Types of fallback responses."""
    LLM_ERROR = "llm_error"
    UNSUPPORTED_LANGUAGE = "unsupported_language"
    MISSING_CONFIG = "missing_config"
    TTS_ERROR = "tts_error"
    NETWORK_ERROR = "network_error"
    GENERAL_ERROR = "general_error"


class MultilingualFallbackService:
    """Enhanced fallback service with multilingual support."""
    
    def __init__(self):
        self._filler_index = 0
        self._error_count = 0
        
        # Multilingual fallback messages
        self._fallback_messages = {
            "en": {
                "llm_error": "Sorry... I'm having trouble right now.",
                "unsupported_language": "I can only help in English for now.",
                "missing_config": "Just a moment... let me get that for you.",
                "tts_error": "Sorry... I can't speak right now.",
                "network_error": "Having connection issues... please try again.",
                "general_error": "Sorry... something went wrong. Please try again."
            },
            "hi": {
                "llm_error": "माफ करें... मुझे अभी दिक्कत हो रही है।",
                "unsupported_language": "मैं अभी केवल अंग्रेजी में मदद कर सकती हूँ।",
                "missing_config": "एक क्षण... मैं आपके लिए लेकर आती हूँ।",
                "tts_error": "माफ करें... मैं अभी बोल नहीं सकती।",
                "network_error": "कनेक्शन में दिक्कत हो रही है... कृपया फिर से कोशिश करें।",
                "general_error": "माफ करें... कुछ गलत हो गया। कृपया फिर से कोशिश करें।"
            },
            "ta": {
                "llm_error": "மன்னிக்கவும்... எனக்கு இப்போது சிரமம் ஏற்படுகிறது.",
                "unsupported_language": "நான் இப்போது ஆங்கிலத்தில் மட்டுமே உதவ முடியும்.",
                "missing_config": "ஒரு கணம்... நான் அதை உங்களுக்கு கொண்டு வருகிறேன்.",
                "tts_error": "மன்னிக்கவும்... நான் இப்போது பேச முடியவில்லை.",
                "network_error": "இணைப்பில் சிக்கல்... தயவுசெய்து மீண்டும் முயற்சி செய்யவும்.",
                "general_error": "மன்னிக்கவும்... ஏதோ தவறு நடந்தது. தயவுசெய்து மீண்டும் முயற்சி செய்யவும்."
            },
            "es": {
                "llm_error": "Lo siento... tengo problemas ahora mismo.",
                "unsupported_language": "Solo puedo ayudar en inglés por ahora.",
                "missing_config": "Un momento... déjame conseguir eso para ti.",
                "tts_error": "Lo siento... no puedo hablar ahora.",
                "network_error": "Problemas de conexión... por favor intenta de nuevo.",
                "general_error": "Lo siento... algo salió mal. Por favor intenta de nuevo."
            },
            "fr": {
                "llm_error": "Désolée... j'ai des problèmes en ce moment.",
                "unsupported_language": "Je ne peux aider qu'en anglais pour le moment.",
                "missing_config": "Un instant... laissez-moi vous aider.",
                "tts_error": "Désolée... je ne peux pas parler maintenant.",
                "network_error": "Problèmes de connexion... veuillez réessayer.",
                "general_error": "Désolée... quelque chose s'est mal passé. Veuillez réessayer."
            }
        }
        
        # Fallback fillers for different languages
        self._filler_messages = {
            "en": [
                "Just a moment...",
                "Let me check that for you...",
                "One moment please...",
                "Hmm... let me see...",
                "Alright... give me a second..."
            ],
            "hi": [
                "एक क्षण...",
                "मैं आपके लिए देखती हूँ...",
                "कृपया एक क्षण इंतजार करें...",
                "हम्म... देखती हूँ...",
                "ठीक है... एक सेकंड दीजिए..."
            ],
            "ta": [
                "ஒரு கணம்...",
                "நான் உங்களுக்கு பார்க்கிறேன்...",
                "தயவுசெய்து ஒரு கணம் காத்திருங்கள்...",
                "ஹம்ம்... பார்க்கிறேன்...",
                "சரி... ஒரு விநாடியாவது..."
            ]
        }
    
    def get_fallback_message(self, fallback_type: FallbackType, language: str = "en") -> str:
        """
        Get appropriate fallback message for the given type and language.
        
        Args:
            fallback_type: Type of fallback needed
            language: Language code (defaults to English)
            
        Returns:
            Fallback message in the requested language
        """
        # Get messages for the language, fallback to English if not available
        lang_messages = self._fallback_messages.get(language, self._fallback_messages["en"])
        
        # Get specific fallback type message
        message = lang_messages.get(fallback_type.value, lang_messages["general_error"])
        
        self._error_count += 1
        logger.warning(f"Fallback triggered: {fallback_type.value} in {language} (error #{self._error_count})")
        
        return message
    
    def get_filler_message(self, language: str = "en") -> str:
        """
        Get a filler message for dead-air situations.
        
        Args:
            language: Language code
            
        Returns:
            Filler message in the requested language
        """
        # Get fillers for the language, fallback to English if not available
        lang_fillers = self._filler_messages.get(language, self._filler_messages["en"])
        
        # Rotate through fillers
        filler = lang_fillers[self._filler_index % len(lang_fillers)]
        self._filler_index += 1
        
        logger.debug(f"Filler message in {language}: {filler}")
        
        return filler
    
    def handle_llm_failure(self, language: str = "en") -> str:
        """Handle LLM API failure."""
        return self.get_fallback_message(FallbackType.LLM_ERROR, language)
    
    def handle_unsupported_language(self, detected_language: str) -> str:
        """Handle unsupported language detection."""
        logger.warning(f"Unsupported language detected: {detected_language}")
        return self.get_fallback_message(FallbackType.UNSUPPORTED_LANGUAGE)
    
    def handle_missing_config(self, language: str = "en") -> str:
        """Handle missing configuration."""
        return self.get_fallback_message(FallbackType.MISSING_CONFIG, language)
    
    def handle_tts_failure(self, language: str = "en") -> str:
        """Handle TTS failure."""
        return self.get_fallback_message(FallbackType.TTS_ERROR, language)
    
    def handle_network_error(self, language: str = "en") -> str:
        """Handle network connectivity issues."""
        return self.get_fallback_message(FallbackType.NETWORK_ERROR, language)
    
    def handle_general_error(self, language: str = "en") -> str:
        """Handle general unexpected errors."""
        return self.get_fallback_message(FallbackType.GENERAL_ERROR, language)
    
    def get_error_count(self) -> int:
        """Get total error count."""
        return self._error_count
    
    def reset_error_count(self) -> None:
        """Reset error count."""
        self._error_count = 0
        logger.info("Error count reset")
    
    def is_error_threshold_exceeded(self, threshold: int = 5) -> bool:
        """
        Check if error threshold is exceeded.
        
        Args:
            threshold: Error threshold
            
        Returns:
            True if threshold exceeded
        """
        return self._error_count >= threshold
    
    def get_emergency_fallback(self, language: str = "en") -> str:
        """
        Get emergency fallback when all else fails.
        
        Args:
            language: Language code
            
        Returns:
            Simple emergency message
        """
        emergency_messages = {
            "en": "Help is on the way.",
            "hi": "मदद के रास्ते में है।",
            "ta": "உதவி வழியில் உள்ளது.",
            "es": "La ayuda está en camino.",
            "fr": "L'aide est en chemin."
        }
        
        return emergency_messages.get(language, emergency_messages["en"])


# Global enhanced fallback service instance
enhanced_fallback_service = MultilingualFallbackService()
