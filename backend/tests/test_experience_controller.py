from voca.api.contracts import SessionState, Tone
from voca.orchestration.experience_controller import ExperienceController


def test_choose_tone_urgent() -> None:
    controller = ExperienceController()
    state = SessionState(session_id="s1", current_intent="urgent_triage")

    assert controller.choose_tone(state, "this is urgent") == Tone.URGENT


def test_should_emit_filler_after_threshold() -> None:
    controller = ExperienceController()

    assert controller.should_emit_filler(900) is True
    assert controller.should_emit_filler(500) is False


def test_build_plan_adds_suggestion_for_vague_input() -> None:
    controller = ExperienceController()
    state = SessionState(session_id="s1")

    plan = controller.build_plan(state, "not sure", "Could you share a bit more detail?")

    assert plan.should_suggest_next_step is True
    assert "Would you like me to book a slot" in plan.base_message
    assert plan.tone == Tone.CALM
