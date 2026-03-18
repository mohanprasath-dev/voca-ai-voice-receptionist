from voca.api.contracts import BudgetMode, SessionState, Tone
from voca.orchestration.response_composer import ResponseComposer


def test_response_composer_enforces_length_caps() -> None:
    composer = ResponseComposer()
    state = SessionState(session_id="s1")
    long_text = "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen"

    near = composer.compose(state, long_text, Tone.CALM, BudgetMode.NEAR_LIMIT)
    hard = composer.compose(state, long_text, Tone.CALM, BudgetMode.HARD_LIMIT)

    assert len(near.split()) <= 16
    assert len(hard.split()) <= 8


def test_response_composer_applies_friendly_prefix() -> None:
    composer = ResponseComposer()
    state = SessionState(session_id="s1")

    msg = composer.compose(state, "I can help with that", Tone.FRIENDLY, BudgetMode.NORMAL)

    assert msg.startswith("Sure, happy to help")
