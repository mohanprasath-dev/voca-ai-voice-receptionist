from voca.orchestration.session_orchestrator import SessionOrchestrator


def _turn(session_id: str, text: str) -> dict:
    return {
        "session_id": session_id,
        "user_text": text,
        "language_hint": "en",
        "partial": False,
        "partial_confidence": None,
        "timestamp_ms": 1,
    }


def test_session_orchestrator_creates_state_and_increments_turns() -> None:
    orchestrator = SessionOrchestrator()

    output_one = orchestrator.handle_turn(_turn("s-1", "book appointment tomorrow at 5 pm"))
    state_after_one = orchestrator.store.get("s-1")

    assert state_after_one is not None
    assert state_after_one.turn_count == 1
    assert state_after_one.phase == "speaking"
    assert output_one["intent"] == "new_appointment"

    output_two = orchestrator.handle_turn(_turn("s-1", "my name is alex"))
    state_after_two = orchestrator.store.get("s-1")

    assert state_after_two is not None
    assert state_after_two.turn_count == 2
    assert "book appointment" in state_after_two.conversation_summary
    assert output_two["session_id"] == "s-1"
    assert "Earlier you mentioned" in output_two["speech_text"]
