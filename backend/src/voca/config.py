from dataclasses import dataclass


@dataclass(frozen=True)
class AppConfig:
    tts_max_seconds: int = 600
    stt_max_seconds: int = 600
    api_char_budget: int = 100_000
    max_concurrent_sessions: int = 2
    ws_idle_timeout_seconds: int = 180
    rate_limit_rpm: int = 1000

    early_response_mode: bool = True
    partial_stt_confidence_threshold: float = 0.72
    dead_air_threshold_ms: int = 800
    interrupt_priority: str = "high"
    demo_mode: bool = True


DEFAULT_CONFIG = AppConfig()
