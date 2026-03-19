from voca.api.contracts import Intent, RouteAction, SessionState
from voca.app_config import AppConfig, DEFAULT_CONFIG


HIGH_CONFIDENCE_THRESHOLD = 0.85
MEDIUM_CONFIDENCE_THRESHOLD = 0.55


class PolicyEngine:
    def __init__(self, config: AppConfig = DEFAULT_CONFIG) -> None:
        self._config = config

    def decide(
        self,
        state: SessionState,
        missing_slots: list[str],
        active_sessions: int,
    ) -> tuple[RouteAction, str]:
        if active_sessions > self._config.max_concurrent_sessions:
            state.queue_position = active_sessions - self._config.max_concurrent_sessions
            return (
                RouteAction.CLARIFY,
                f"You are number {state.queue_position} in line. I will help you shortly.",
            )

        if state.current_intent in (Intent.URGENT_TRIAGE.value, Intent.HUMAN_HANDOFF.value):
            return RouteAction.ESCALATE, "This sounds urgent. I am escalating to a human now."

        if state.intent_confidence >= MEDIUM_CONFIDENCE_THRESHOLD and state.intent_confidence < HIGH_CONFIDENCE_THRESHOLD:
            return RouteAction.CLARIFY, "I want to make sure I understood correctly. Could you confirm that?"

        if missing_slots:
            return RouteAction.CLARIFY, "Could you share a bit more detail so I can complete that?"

        return RouteAction.RESOLVE, "Done. I have handled that for you."

    def suggest_next_step(self) -> str:
        return "Would you like me to book a slot for tomorrow evening?"
