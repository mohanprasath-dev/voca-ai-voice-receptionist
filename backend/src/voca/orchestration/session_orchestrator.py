from time import time
from typing import Optional

from voca.api.contracts import BudgetMode, RouteAction, SessionState, Tone, TurnInput, TurnOutput
from voca.config import AppConfig, DEFAULT_CONFIG
from voca.domain.state_store import InMemorySessionStore
from voca.orchestration.context_memory import ContextMemory
from voca.orchestration.experience_controller import ExperienceController
from voca.orchestration.intent_router import IntentRouter
from voca.orchestration.policy_engine import PolicyEngine
from voca.orchestration.response_composer import ResponseComposer
from voca.orchestration.slot_filler import SlotFiller
from voca.orchestration.turn_manager import TurnManager
from voca.services.budget_manager import BudgetManager
from voca.services.fallbacks import FallbackService


class SessionOrchestrator:
    def __init__(
        self,
        store: Optional[InMemorySessionStore] = None,
        memory: Optional[ContextMemory] = None,
        experience: Optional[ExperienceController] = None,
        intent_router: Optional[IntentRouter] = None,
        slot_filler: Optional[SlotFiller] = None,
        policy: Optional[PolicyEngine] = None,
        composer: Optional[ResponseComposer] = None,
        budget: Optional[BudgetManager] = None,
        fallback_service: Optional[FallbackService] = None,
        turn_manager: Optional[TurnManager] = None,
        config: AppConfig = DEFAULT_CONFIG,
    ) -> None:
        self.store = store or InMemorySessionStore()
        self.memory = memory or ContextMemory()
        self.experience = experience or ExperienceController(config)
        self.intent_router = intent_router or IntentRouter()
        self.slot_filler = slot_filler or SlotFiller()
        self.policy = policy or PolicyEngine(config)
        self.composer = composer or ResponseComposer()
        self.budget = budget or BudgetManager(config)
        self.fallback_service = fallback_service or FallbackService()
        self.turn_manager = turn_manager or TurnManager(config)
        self.config = config
        self._last_activity_ms: dict[str, int] = {}

    def handle_turn(self, turn: TurnInput) -> TurnOutput:
        started = time()
        state = self.store.get_or_create(turn["session_id"])
        state.phase = "listening"
        state.turn_count += 1
        self.memory.update_summary(state, turn["user_text"])

        early_response_started = self.turn_manager.should_start_early_response(
            turn["partial"],
            turn.get("partial_confidence"),
        )

        intent, confidence, _ = self.intent_router.route(turn["user_text"])
        state.current_intent = intent.value
        state.intent_confidence = confidence
        state.phase = "reasoning"

        extracted = self.slot_filler.extract(intent, turn["user_text"])
        state.slots.update(extracted)
        missing = self.slot_filler.missing_required(intent, state.slots)

        action, policy_message = self.policy.decide(state, missing, self.store.active_sessions())
        plan = self.experience.build_plan(state, turn["user_text"], policy_message)

        base_message = plan.base_message
        if plan.include_memory_reminder:
            reminder = self.memory.contextual_reminder(state)
            if reminder:
                base_message = f"{reminder} {base_message}".strip()

        budget_mode = BudgetMode(self.budget.current_mode())
        text = self.composer.compose(state, base_message, plan.tone, budget_mode)

        elapsed_ms = int((time() - started) * 1000)
        dead_air_filler_used = False
        if self.experience.should_emit_filler(elapsed_ms):
            dead_air_filler_used = True
            filler = self.fallback_service.next_filler()
            text = f"{filler} {text}".strip()

        state.last_agent_message = text
        state.phase = "speaking"
        self.store.save(state)
        self._last_activity_ms[state.session_id] = int(time() * 1000)

        return {
            "session_id": state.session_id,
            "intent": state.current_intent,
            "intent_confidence": state.intent_confidence,
            "route_action": action.value,
            "tone": plan.tone.value,
            "missing_slots": missing,
            "speech_text": text,
            "language_segments": self.composer.segment_multilingual(text),
            "escalation_required": action == RouteAction.ESCALATE,
            "queue_position": state.queue_position,
            "dead_air_filler_used": dead_air_filler_used,
            "telemetry_tags": {
                "phase": state.phase,
                "budget_mode": budget_mode.value,
                "early_response_started": str(early_response_started).lower(),
            },
        }

    def should_keepalive(self, session_id: str, now_ms: int) -> bool:
        last_ms = self._last_activity_ms.get(session_id, now_ms)
        threshold = self.config.ws_idle_timeout_seconds * 1000 - 30_000
        return now_ms - last_ms >= threshold

    def keepalive_prompt(self, session_id: str, now_ms: int) -> str:
        if self.should_keepalive(session_id, now_ms):
            return "Still with me? I can continue helping if you need a moment."
        return ""

    def mark_reconnected(self, session_id: str) -> Optional[SessionState]:
        state = self.store.get(session_id)
        if not state:
            return None
        state.restored_after_disconnect = True
        self.store.save(state)
        return state
