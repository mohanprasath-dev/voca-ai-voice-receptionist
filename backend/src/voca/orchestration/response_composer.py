from voca.api.contracts import BudgetMode, LanguageSegment, SessionState, Tone


class ResponseComposer:
    def compose(
        self,
        state: SessionState,
        base_message: str,
        tone: Tone,
        budget_mode: BudgetMode,
    ) -> str:
        message = base_message.strip()

        if tone == Tone.FRIENDLY:
            message = f"Sure, happy to help. {message}"
        elif tone == Tone.URGENT:
            message = f"I understand. {message}"

        if budget_mode == BudgetMode.NEAR_LIMIT:
            return self._compress(message, max_words=16)
        if budget_mode == BudgetMode.HARD_LIMIT:
            return self._compress(message, max_words=8)

        return message

    def segment_multilingual(self, text: str) -> list[LanguageSegment]:
        segments: list[LanguageSegment] = []
        for token in text.split():
            lang = "hi" if token.lower() in {"kal", "baje", "namaste"} else "en"
            segments.append({"text": token, "lang": lang})
        return segments

    @staticmethod
    def _compress(text: str, max_words: int) -> str:
        words = text.split()
        if len(words) <= max_words:
            return text
        return " ".join(words[:max_words]).rstrip(".,") + "."
