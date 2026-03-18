import re

from voca.api.contracts import Intent, SlotMap


class SlotFiller:
    def extract(self, intent: Intent, user_text: str) -> SlotMap:
        slots: SlotMap = {}
        lowered = user_text.lower()

        date_match = re.search(r"\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday)\b", lowered)
        if date_match:
            slots["date"] = date_match.group(1)

        time_match = re.search(r"\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b", lowered)
        if time_match:
            slots["time"] = time_match.group(0)

        if "consult" in lowered:
            slots["service_type"] = "consultation"

        if intent == Intent.URGENT_TRIAGE:
            slots["urgency_level"] = "high"

        return slots

    def missing_required(self, intent: Intent, slots: SlotMap) -> list[str]:
        required = {
            Intent.NEW_APPOINTMENT: ["date", "time"],
            Intent.RESCHEDULE: ["date", "time"],
            Intent.CANCEL: ["date"],
        }.get(intent, [])

        return [key for key in required if key not in slots]
