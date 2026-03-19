from dataclasses import dataclass


# Module-level constants (requested public surface).
TTS_MAX_SECONDS = 600
STT_MAX_SECONDS = 600
API_CHAR_BUDGET = 100_000
MAX_CONCURRENT_SESSIONS = 2
WS_IDLE_TIMEOUT_SECONDS = 180
RATE_LIMIT_RPM = 1000

EARLY_RESPONSE_MODE = True
PARTIAL_STT_CONFIDENCE_THRESHOLD = 0.72
DEAD_AIR_THRESHOLD_MS = 800
INTERRUPT_PRIORITY = "high"
DEMO_MODE = True


@dataclass(frozen=True)
class AppConfig:
    tts_max_seconds: int = TTS_MAX_SECONDS
    stt_max_seconds: int = STT_MAX_SECONDS
    api_char_budget: int = API_CHAR_BUDGET
    max_concurrent_sessions: int = MAX_CONCURRENT_SESSIONS
    ws_idle_timeout_seconds: int = WS_IDLE_TIMEOUT_SECONDS
    rate_limit_rpm: int = RATE_LIMIT_RPM

    early_response_mode: bool = EARLY_RESPONSE_MODE
    partial_stt_confidence_threshold: float = PARTIAL_STT_CONFIDENCE_THRESHOLD
    dead_air_threshold_ms: int = DEAD_AIR_THRESHOLD_MS
    interrupt_priority: str = INTERRUPT_PRIORITY
    demo_mode: bool = DEMO_MODE


DEFAULT_CONFIG = AppConfig()
