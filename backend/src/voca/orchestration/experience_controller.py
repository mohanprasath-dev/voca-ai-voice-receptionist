from dataclasses import dataclass

from voca.api.contracts import Intent, SessionState, Tone
from voca.app_config import AppConfig, DEFAULT_CONFIG


@dataclass
class ExperiencePlan:
    tone: Tone
    base_message: str
    include_memory_reminder: bool
    should_suggest_next_step: bool


class ExperienceController:
    def __init__(self, config: AppConfig = DEFAULT_CONFIG) -> None:
        self._config = config

    def choose_tone(self, state: SessionState, user_text: str) -> Tone:
        lower = user_text.lower()
        if state.current_intent == Intent.URGENT_TRIAGE.value or "urgent" in lower:
            return Tone.URGENT
        if "please" in lower or "thank" in lower:
            return Tone.FRIENDLY
        return Tone.CALM

    def should_emit_filler(self, elapsed_ms: int) -> bool:
        return elapsed_ms > self._config.dead_air_threshold_ms

    def should_suggest_next_step(self, user_text: str) -> bool:
        stripped = user_text.strip().lower()
        return stripped in {"", "hmm", "not sure", "anything", "help"}

    def build_plan(self, state: SessionState, user_text: str, policy_message: str) -> ExperiencePlan:
        suggest_next = self.should_suggest_next_step(user_text)
        base = policy_message
        if suggest_next:
            base = f"{policy_message} Would you like me to book a slot for tomorrow evening?"

        return ExperiencePlan(
            tone=self.choose_tone(state, user_text),
            base_message=base,
            include_memory_reminder=state.turn_count > 1 and bool(state.conversation_summary),
            should_suggest_next_step=suggest_next,
        )
