from voca.orchestration.session_orchestrator import SessionOrchestrator


def test_keepalive_prompt_before_timeout() -> None:
    orchestrator = SessionOrchestrator()
    session_id = "s1"

    orchestrator.handle_turn(
        {
            "session_id": session_id,
            "user_text": "book appointment tomorrow",
            "language_hint": "en",
            "partial": False,
            "partial_confidence": None,
            "timestamp_ms": 1,
        }
    )

    now_ms = orchestrator._last_activity_ms[session_id] + 200_000
    prompt = orchestrator.keepalive_prompt(session_id, now_ms)

    assert "Still with me" in prompt


def test_state_restored_after_reconnect() -> None:
    orchestrator = SessionOrchestrator()
    session_id = "s2"

    orchestrator.handle_turn(
        {
            "session_id": session_id,
            "user_text": "I need help",
            "language_hint": "en",
            "partial": False,
            "partial_confidence": None,
            "timestamp_ms": 1,
        }
    )

    restored = orchestrator.mark_reconnected(session_id)

    assert restored is not None
    assert restored.restored_after_disconnect is True
