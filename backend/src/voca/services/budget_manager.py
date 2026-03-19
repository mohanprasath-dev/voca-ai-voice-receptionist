"""Stub — budget tracking removed. Kept for import compatibility."""

from voca.app_config import AppConfig, DEFAULT_CONFIG


class BudgetManager:
    def __init__(self, config: AppConfig = DEFAULT_CONFIG) -> None:
        pass

    def record_stt_seconds(self, seconds: float) -> None:
        pass

    def record_tts_seconds(self, seconds: float) -> None:
        pass

    def record_characters(self, chars: int) -> None:
        pass

    def current_mode(self) -> str:
        return "normal"
