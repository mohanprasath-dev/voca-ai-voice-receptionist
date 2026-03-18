from voca.api.contracts import RouteAction, SessionState
from voca.orchestration.policy_engine import PolicyEngine


def test_queue_simulation_when_over_capacity() -> None:
    engine = PolicyEngine()
    state = SessionState(session_id="s1", current_intent="new_appointment", intent_confidence=0.9)

    action, message = engine.decide(state, missing_slots=[], active_sessions=3)

    assert action == RouteAction.CLARIFY
    assert state.queue_position == 1
    assert "number 1 in line" in message
