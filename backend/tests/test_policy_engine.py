from voca.api.contracts import RouteAction, SessionState
from voca.orchestration.policy_engine import PolicyEngine


def test_policy_engine_resolves_high_confidence_and_complete_slots() -> None:
    engine = PolicyEngine()
    state = SessionState(session_id="s1", current_intent="new_appointment", intent_confidence=0.92)

    action, message = engine.decide(state, missing_slots=[], active_sessions=1)

    assert action == RouteAction.RESOLVE
    assert "handled" in message.lower()


def test_policy_engine_clarifies_medium_confidence() -> None:
    engine = PolicyEngine()
    state = SessionState(session_id="s1", current_intent="new_appointment", intent_confidence=0.7)

    action, message = engine.decide(state, missing_slots=[], active_sessions=1)

    assert action == RouteAction.CLARIFY
    assert "confirm" in message.lower() or "understood" in message.lower()


def test_policy_engine_escalates_for_urgent_or_human_request() -> None:
    engine = PolicyEngine()

    urgent_state = SessionState(session_id="s1", current_intent="urgent_triage", intent_confidence=0.95)
    action_urgent, _ = engine.decide(urgent_state, missing_slots=[], active_sessions=1)
    assert action_urgent == RouteAction.ESCALATE

    human_state = SessionState(session_id="s2", current_intent="human_handoff", intent_confidence=0.95)
    action_human, _ = engine.decide(human_state, missing_slots=[], active_sessions=1)
    assert action_human == RouteAction.ESCALATE
