from typing import Optional

from voca.app_config import AppConfig, DEFAULT_CONFIG

EARLY_RESPONSE_MODE = True
INTERRUPT_PRIORITY = "high"


class TurnManager:
    def __init__(self, config: AppConfig = DEFAULT_CONFIG) -> None:
        self._config = config
        self._latest_partial: Optional[str] = None

    def should_start_early_response(self, is_partial: bool, confidence: Optional[float]) -> bool:
        if not self._config.early_response_mode:
            return False
        if not is_partial:
            return False
        if confidence is None:
            return False
        return confidence >= self._config.partial_stt_confidence_threshold

    def should_interrupt(self, user_speaking_while_tts: bool) -> bool:
        return user_speaking_while_tts

    def record_partial(self, turn: dict) -> None:
        """Capture partial transcripts for early planning/observability."""
        text = str(turn.get("user_text") or "").strip()
        if text:
            self._latest_partial = text

    def latest_partial(self) -> Optional[str]:
        return self._latest_partial
