import random
import re
from typing import Iterator

CONNECTOR_PATTERN = re.compile(
    r"\b(and|but|so|because|then|और|लेकिन|तो|क्योंकि|பின்னர்|ஆனால்|மற்றும்)\b",
    re.IGNORECASE | re.UNICODE
)
FILLERS = (
    "Alright...", "Okay...", "Hmm...", "Let me check...", "uh...",
    "ठीक है...", "देखती हूँ...", "हाँ...",
    "சரி...", "பார்க்கிறேன்...", "ஒரு கணம்..."
)
EMPHASIS_KEYWORDS = {
    "confirmed",
    "appointment",
    "tomorrow",
    "today",
    "urgent",
    "available",
    "booking",
    "scheduled",
    # Hindi
    "कल", "आज", "अपॉइंटमेंट", "बुकिंग", "तत्काल",
    # Tamil
    "நாளை", "இன்று", "நியமனம்", "அவசரம்",
}


def iter_response_chunks(text: str) -> Iterator[str]:
    """Split model output into voice-friendly chunks by punctuation and meaning."""
    normalized = re.sub(r"\s+", " ", text).strip()
    if not normalized:
        return

    # Keep punctuation attached to preserve spoken cadence.
    base_chunks = re.findall(r"[^.!?,;:]+(?:\.\.\.|[.!?;,])?", normalized)

    for chunk in base_chunks:
        cleaned = chunk.strip()
        if not cleaned:
            continue

        yield from _split_long_chunk(cleaned)


def _split_long_chunk(chunk: str, max_words: int = 16) -> Iterator[str]:
    words = chunk.split()
    if len(words) <= max_words:
        yield chunk
        return

    # Prefer natural split points on discourse connectors.
    tokens = chunk.split(" ")
    current: list[str] = []

    for token in tokens:
        current.append(token)
        assembled = " ".join(current)

        if len(current) >= max_words and CONNECTOR_PATTERN.search(token):
            yield assembled.strip().rstrip(",") + ","
            current = []

    if current:
        yield " ".join(current).strip()


def pause_after_chunk_ms(previous_chunk: str, rng: random.Random) -> int:
    stripped = previous_chunk.rstrip()
    if not stripped:
        return 250

    if stripped.endswith(","):
        return 200

    if stripped.endswith((".", "?", "!", "...")):
        return rng.randint(300, 500)

    return 180


def apply_moderate_emphasis(text: str) -> str:
    def _replace(match: re.Match[str]) -> str:
        word = match.group(0)
        if word.lower() in EMPHASIS_KEYWORDS:
            return word.upper()
        return word

    return re.sub(r"\b\w+\b", _replace, text, count=1)


def inject_disfluency(text: str, rng: random.Random, probability: float = 0.15) -> str:
    """Inject natural spoken fillers. Reduced probability for cleaner output."""
    if not text.strip():
        return text

    lowered = text.lower()
    # Skip if already starts with a filler (English or multilingual)
    filler_starts = (
        "alright", "okay", "hmm", "let me check", "uh",
        "ठीक", "देखती", "हाँ",
        "சரி", "பார்க்கிறேன்", "ஒரு"
    )
    if any(lowered.startswith(f) for f in filler_starts):
        return text

    if rng.random() >= probability:
        return text

    # Detect language from script to pick appropriate filler
    has_devanagari = any('\u0900' <= c <= '\u097f' for c in text)
    has_tamil = any('\u0b80' <= c <= '\u0bff' for c in text)

    if has_devanagari:
        fillers = ("ठीक है...", "देखती हूँ...", "हाँ...")
    elif has_tamil:
        fillers = ("சரி...", "பார்க்கிறேன்...", "ஒரு கணம்...")
    else:
        fillers = ("Alright...", "Okay...", "Hmm...")

    filler = rng.choice(fillers)
    return f"{filler} {text}".strip()


def humanize_chunk(text: str, rng: random.Random) -> str:
    emphasized = apply_moderate_emphasis(text)
    return inject_disfluency(emphasized, rng, probability=0.15)
