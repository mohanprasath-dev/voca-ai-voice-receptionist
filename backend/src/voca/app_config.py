from dataclasses import dataclass


EARLY_RESPONSE_MODE = True
PARTIAL_STT_CONFIDENCE_THRESHOLD = 0.72
DEAD_AIR_THRESHOLD_MS = 800
INTERRUPT_PRIORITY = "high"
MAX_CONCURRENT_SESSIONS = 2
WS_IDLE_TIMEOUT_SECONDS = 180
NEAR_LIMIT_RATIO = 0.80
HARD_LIMIT_RATIO = 0.95


@dataclass(frozen=True)
class AppConfig:
    early_response_mode: bool = EARLY_RESPONSE_MODE
    partial_stt_confidence_threshold: float = PARTIAL_STT_CONFIDENCE_THRESHOLD
    dead_air_threshold_ms: int = DEAD_AIR_THRESHOLD_MS
    interrupt_priority: str = INTERRUPT_PRIORITY
    max_concurrent_sessions: int = MAX_CONCURRENT_SESSIONS
    ws_idle_timeout_seconds: int = WS_IDLE_TIMEOUT_SECONDS
    near_limit_ratio: float = NEAR_LIMIT_RATIO
    hard_limit_ratio: float = HARD_LIMIT_RATIO


DEFAULT_CONFIG = AppConfig()
