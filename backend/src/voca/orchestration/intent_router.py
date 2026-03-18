from typing import Callable, Dict, Iterable, Optional, Tuple

from voca.api.contracts import Intent

LlmClassifier = Callable[[str], Tuple[Intent, float]]


class IntentRouter:
    def __init__(self, llm_classifier: Optional[LlmClassifier] = None) -> None:
        self._llm_classifier = llm_classifier

    def route(self, user_text: str) -> tuple[Intent, float, bool]:
        text = user_text.lower()
        mapping: Dict[Intent, Iterable[str]] = {
            Intent.NEW_APPOINTMENT: ["book", "appointment", "schedule"],
            Intent.RESCHEDULE: ["reschedule", "move"],
            Intent.CANCEL: ["cancel"],
            Intent.PRICING_INFO: ["price", "cost", "fee"],
            Intent.HOURS_LOCATION: ["hours", "open", "location", "address"],
            Intent.URGENT_TRIAGE: ["urgent", "emergency", "pain", "immediately"],
            Intent.HUMAN_HANDOFF: ["human", "agent", "representative"],
        }

        best_intent = Intent.UNKNOWN
        best_confidence = 0.0

        for intent, keywords in mapping.items():
            matches = sum(1 for keyword in keywords if keyword in text)
            if matches <= 0:
                continue

            confidence = min(0.99, 0.55 + 0.2 * matches)
            if confidence > best_confidence:
                best_intent = intent
                best_confidence = confidence

        if best_confidence > 0.85:
            return best_intent, best_confidence, True

        if self._llm_classifier is not None:
            llm_intent, llm_confidence = self._llm_classifier(user_text)
            return llm_intent, llm_confidence, False

        return Intent.UNKNOWN, max(best_confidence, 0.5), False
