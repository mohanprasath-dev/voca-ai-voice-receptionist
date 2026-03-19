"""Session budget tracking for response compression mode transitions."""

from voca.app_config import AppConfig, DEFAULT_CONFIG


MAX_CHARACTER_BUDGET = 100_000


class BudgetManager:
    def __init__(self, config: AppConfig = DEFAULT_CONFIG) -> None:
        self._config = config
        self._characters = 0

    def record_stt_seconds(self, seconds: float) -> None:
        _ = seconds

    def record_tts_seconds(self, seconds: float) -> None:
        _ = seconds

    def record_characters(self, chars: int) -> None:
        self._characters += max(0, int(chars))

    def current_mode(self) -> str:
        usage_ratio = self._characters / float(MAX_CHARACTER_BUDGET)
        if usage_ratio >= self._config.hard_limit_ratio:
            return "hard_limit"
        if usage_ratio >= self._config.near_limit_ratio:
            return "near_limit"
        return "normal"
