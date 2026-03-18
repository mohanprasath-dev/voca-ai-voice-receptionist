from voca.api.contracts import SessionState


class ContextMemory:
    """Maintains rolling conversation memory and user profile hints."""

    def update_summary(self, state: SessionState, user_text: str) -> None:
        previous = state.conversation_summary.strip()
        addition = user_text.strip()
        if not addition:
            return
        if not previous:
            state.conversation_summary = addition
            return
        merged = f"{previous} | {addition}"
        # Keep summary compact to reduce prompt token pressure.
        state.conversation_summary = merged[-600:]

    def update_user_profile(self, state: SessionState, key: str, value: str) -> None:
        if key and value:
            state.user_profile[key] = value

    def contextual_reminder(self, state: SessionState) -> str:
        if not state.conversation_summary:
            return ""
        return f"Earlier you mentioned: {state.conversation_summary}."
