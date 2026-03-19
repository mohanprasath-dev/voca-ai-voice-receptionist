import re

from voca.api.contracts import BudgetMode, LanguageSegment, SessionState, Tone


# Tone prefix map per language
TONE_PREFIXES = {
    Tone.FRIENDLY: {
        "en": "I can help. ",
        "hi": "मैं मदद कर सकती हूँ। ",
        "ta": "நான் உதவ முடியும். ",
        "es": "Puedo ayudar. ",
        "fr": "Je peux aider. ",
    },
    Tone.URGENT: {
        "en": "Understood. ",
        "hi": "समझ गई। ",
        "ta": "புரிந்தது. ",
        "es": "Entendido. ",
        "fr": "Compris. ",
    },
}


FILLER_PATTERNS = (
    r"^\s*(just a moment\.?|let me check that for you\.?|one second please\.?)+\s*",
    r"^\s*(alright\.?|okay\.?|hmm\.?|uh\.?|um\.?)+\s*",
    r"^\s*(ठीक है\.?|देखती हूँ\.?|हाँ\.?)+\s*",
    r"^\s*(சரி\.?|பார்க்கிறேன்\.?|ஒரு கணம்\.?)+\s*",
)


class ResponseComposer:
    def compose(
        self,
        state: SessionState,
        base_message: str,
        tone: Tone,
        budget_mode: BudgetMode,
    ) -> str:
        message = base_message.strip()

        # Use detected language from state for tone prefix
        language = getattr(state, 'language', None) or getattr(state, 'user_language', None) or 'en'

        if tone == Tone.FRIENDLY:
            prefix_map = TONE_PREFIXES.get(Tone.FRIENDLY, {})
            prefix = prefix_map.get(language, prefix_map.get("en", ""))
            message = f"{prefix}{message}"
        elif tone == Tone.URGENT:
            prefix_map = TONE_PREFIXES.get(Tone.URGENT, {})
            prefix = prefix_map.get(language, prefix_map.get("en", ""))
            message = f"{prefix}{message}"

        message = self.sanitize_for_tts(message)

        if budget_mode == BudgetMode.NEAR_LIMIT:
            return self._compress(message, max_words=16)
        if budget_mode == BudgetMode.HARD_LIMIT:
            return self._compress(message, max_words=8)

        return self._compress(message, max_words=24)

    def sanitize_for_tts(self, text: str) -> str:
        cleaned = re.sub(r"\s+", " ", (text or "").strip())
        cleaned = re.sub(r"\.\.\.+", ".", cleaned)
        cleaned = re.sub(r"([!?.,;:])\1+", r"\1", cleaned)

        for pattern in FILLER_PATTERNS:
            cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)

        cleaned = self._truncate_sentences(cleaned, max_sentences=2)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()

        if cleaned and cleaned[-1] not in ".!?":
            cleaned = f"{cleaned}."

        return cleaned

    @staticmethod
    def _truncate_sentences(text: str, max_sentences: int) -> str:
        if not text:
            return ""
        parts = re.findall(r"[^.!?]+[.!?]?", text)
        selected = " ".join(part.strip() for part in parts[:max_sentences] if part.strip())
        return selected.strip()

    def segment_multilingual(self, text: str) -> list[LanguageSegment]:
        """Segment text by script for multilingual TTS routing."""
        segments: list[LanguageSegment] = []
        current_text = ""
        current_lang = "en"

        for char in text:
            code = ord(char)
            if 0x0900 <= code <= 0x097F:  # Devanagari (Hindi)
                char_lang = "hi"
            elif 0x0B80 <= code <= 0x0BFF:  # Tamil
                char_lang = "ta"
            elif 0x0600 <= code <= 0x06FF:  # Arabic
                char_lang = "ar"
            else:
                char_lang = "en"

            if char_lang != current_lang and current_text.strip():
                segments.append({"text": current_text.strip(), "lang": current_lang})
                current_text = char
                current_lang = char_lang
            else:
                current_text += char
                current_lang = char_lang

        if current_text.strip():
            segments.append({"text": current_text.strip(), "lang": current_lang})

        # If no segments were created (edge case), return original
        if not segments:
            segments.append({"text": text, "lang": "en"})

        return segments

    @staticmethod
    def _compress(text: str, max_words: int) -> str:
        words = text.split()
        if len(words) <= max_words:
            return text
        return " ".join(words[:max_words]).rstrip(".,") + "."
