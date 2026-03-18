from typing import Optional

from voca.config import AppConfig, DEFAULT_CONFIG

EARLY_RESPONSE_MODE = True
INTERRUPT_PRIORITY = "high"


class TurnManager:
    def __init__(self, config: AppConfig = DEFAULT_CONFIG) -> None:
        self._config = config

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
