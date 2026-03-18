from voca.api.contracts import SessionState
from voca.orchestration.context_memory import ContextMemory


def test_context_memory_updates_summary_and_profile() -> None:
    memory = ContextMemory()
    state = SessionState(session_id="s1")

    memory.update_summary(state, "I need to book for tomorrow")
    memory.update_summary(state, "at 5 pm")
    memory.update_user_profile(state, "name", "Alex")

    assert "tomorrow" in state.conversation_summary
    assert "5 pm" in state.conversation_summary
    assert state.user_profile["name"] == "Alex"


def test_contextual_reminder_uses_summary() -> None:
    memory = ContextMemory()
    state = SessionState(session_id="s1", conversation_summary="booking tomorrow")

    reminder = memory.contextual_reminder(state)

    assert "Earlier you mentioned" in reminder
    assert "booking tomorrow" in reminder
