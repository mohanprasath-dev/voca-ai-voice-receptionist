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

    assert msg.startswith("I can help")


def test_response_composer_strips_fillers_and_normalizes_punctuation() -> None:
    composer = ResponseComposer()

    msg = composer.sanitize_for_tts("Just a moment... Okay... I can help!!!")

    assert msg == "I can help!"


def test_response_composer_limits_to_two_sentences_for_clarity() -> None:
    composer = ResponseComposer()
    state = SessionState(session_id="s2")

    msg = composer.compose(
        state,
        "First sentence. Second sentence. Third sentence should be dropped.",
        Tone.CALM,
        BudgetMode.NORMAL,
    )

    assert msg == "First sentence. Second sentence."
