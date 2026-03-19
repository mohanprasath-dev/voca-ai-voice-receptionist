from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Literal, Optional, TypedDict


class Intent(str, Enum):
    NEW_APPOINTMENT = "new_appointment"
    RESCHEDULE = "reschedule"
    CANCEL = "cancel"
    PRICING_INFO = "pricing_info"
    HOURS_LOCATION = "hours_location"
    URGENT_TRIAGE = "urgent_triage"
    HUMAN_HANDOFF = "human_handoff"
    UNKNOWN = "unknown"


class RouteAction(str, Enum):
    RESOLVE = "resolve"
    CLARIFY = "clarify"
    ESCALATE = "escalate"


class Tone(str, Enum):
    CALM = "calm"
    FRIENDLY = "friendly"
    URGENT = "urgent"


class BudgetMode(str, Enum):
    NORMAL = "normal"
    NEAR_LIMIT = "near_limit"
    HARD_LIMIT = "hard_limit"


class LanguageSegment(TypedDict):
    text: str
    lang: str


class TurnInput(TypedDict):
    session_id: str
    user_text: str
    language_hint: Optional[str]
    language: Optional[str]
    partial: bool
    partial_confidence: Optional[float]
    timestamp_ms: int
    detected_language: Optional[str]


class SlotMap(TypedDict, total=False):
    date: str
    time: str
    person_name: str
    phone: str
    service_type: str
    urgency_level: str


class TurnOutput(TypedDict):
    session_id: str
    intent: str
    intent_confidence: float
    route_action: str
    tone: str
    missing_slots: List[str]
    speech_text: str
    language_segments: List[LanguageSegment]
    escalation_required: bool
    queue_position: Optional[int]
    dead_air_filler_used: bool
    telemetry_tags: Dict[str, str]


class UsageBudget(TypedDict):
    stt_seconds: float
    tts_seconds: float
    llm_characters: int
    usage_percentage: float


@dataclass
class SessionState:
    session_id: str
    language: str = "en"
    current_intent: str = Intent.UNKNOWN.value
    intent_confidence: float = 0.0
    slots: Dict[str, str] = field(default_factory=dict)
    pending_questions: List[str] = field(default_factory=list)
    last_agent_message: str = ""
    conversation_summary: str = ""
    user_profile: Dict[str, str] = field(default_factory=dict)
    queue_position: Optional[int] = None
    turn_count: int = 0
    restored_after_disconnect: bool = False
    phase: Literal[
        "idle", "listening", "reasoning", "speaking",
        "awaiting_confirmation", "escalated", "ended",
    ] = "idle"
    user_language: str = "en"
    last_detected_language: Optional[str] = None
    agent_config: Dict[str, Any] = field(default_factory=dict)
