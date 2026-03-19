from dataclasses import dataclass


EARLY_RESPONSE_MODE = True
PARTIAL_STT_CONFIDENCE_THRESHOLD = 0.72
DEAD_AIR_THRESHOLD_MS = 800
INTERRUPT_PRIORITY = "high"


@dataclass(frozen=True)
class AppConfig:
    early_response_mode: bool = EARLY_RESPONSE_MODE
    partial_stt_confidence_threshold: float = PARTIAL_STT_CONFIDENCE_THRESHOLD
    dead_air_threshold_ms: int = DEAD_AIR_THRESHOLD_MS
    interrupt_priority: str = INTERRUPT_PRIORITY


DEFAULT_CONFIG = AppConfig()
