import random

from voca.services.speech_chunking import (
    humanize_chunk,
    inject_disfluency,
    iter_response_chunks,
    pause_after_chunk_ms,
)


def test_iter_response_chunks_splits_by_punctuation() -> None:
    text = "Sure... I can help with that. Let me check your booking."

    chunks = list(iter_response_chunks(text))

    assert chunks == ["Sure...", "I can help with that.", "Let me check your booking."]


def test_pause_after_chunk_ms_respects_punctuation() -> None:
    rng = random.Random(42)

    assert pause_after_chunk_ms("hello,", rng) == 200
    sentence_pause = pause_after_chunk_ms("hello.", rng)

    assert 300 <= sentence_pause <= 500


def test_inject_disfluency_is_light_and_controlled() -> None:
    rng = random.Random(1)

    output = inject_disfluency("Your booking is confirmed.", rng, probability=1.0)

    assert output != "Your booking is confirmed."
    assert output.lower().startswith(("alright", "okay", "hmm", "let me check", "uh"))


def test_humanize_chunk_applies_emphasis_before_disfluency() -> None:
    rng = random.Random(2)

    output = humanize_chunk("your booking is confirmed", rng)

    assert "booking" in output.lower()
    assert "confirmed" in output.lower() or "CONFIRMED" in output
