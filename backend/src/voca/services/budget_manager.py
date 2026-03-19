from voca.api.contracts import BudgetMode, UsageBudget
from voca.app_config import AppConfig, DEFAULT_CONFIG


class BudgetManager:
    def __init__(self, config: AppConfig = DEFAULT_CONFIG) -> None:
        self._config = config
        self._usage = UsageBudget()

    def usage(self) -> UsageBudget:
        return self._usage

    def record_stt_seconds(self, seconds: float) -> None:
        self._usage.stt_seconds_used += max(0.0, seconds)
        self._update_mode()

    def record_tts_seconds(self, seconds: float) -> None:
        self._usage.tts_seconds_used += max(0.0, seconds)
        self._update_mode()

    def record_characters(self, chars: int) -> None:
        self._usage.char_used += max(0, chars)
        self._update_mode()

    def set_active_sessions(self, active: int) -> None:
        self._usage.active_sessions = max(0, active)

    def current_mode(self) -> str:
        return self._usage.mode

    def is_blocked(self) -> bool:
        """Budget no longer hard-blocks responses; hard_limit is handled via compression."""
        return False

    def _update_mode(self) -> None:
        stt_ratio = self._usage.stt_seconds_used / self._config.stt_max_seconds
        tts_ratio = self._usage.tts_seconds_used / self._config.tts_max_seconds
        char_ratio = self._usage.char_used / self._config.api_char_budget
        peak = max(stt_ratio, tts_ratio, char_ratio)

        if peak >= 0.95:
            self._usage.mode = BudgetMode.HARD_LIMIT.value
        elif peak >= 0.8:
            self._usage.mode = BudgetMode.NEAR_LIMIT.value
        else:
            self._usage.mode = BudgetMode.NORMAL.value
