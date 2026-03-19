import pytest

from agent import _iter_speech_chunks


async def _stream_tokens(tokens: list[str]):
    for token in tokens:
        yield token


@pytest.mark.asyncio
async def test_chunk_flushes_on_punctuation_with_min_size() -> None:
    tokens = [
        "Hello there this is a longer response chunk that should flush on punctuation",
        ". Next part starts now",
    ]

    chunks = [chunk async for chunk in _iter_speech_chunks(_stream_tokens(tokens))]

    assert len(chunks) >= 1
    assert "." in chunks[0]
    assert len(chunks[0]) >= 40


@pytest.mark.asyncio
async def test_chunk_flushes_on_target_size_without_punctuation() -> None:
    tokens = ["x" * 30, "y" * 30, "z" * 30]

    chunks = [chunk async for chunk in _iter_speech_chunks(_stream_tokens(tokens))]

    assert chunks
    assert len(chunks[0]) >= 80


@pytest.mark.asyncio
async def test_never_emits_tiny_midstream_chunks() -> None:
    tokens = ["short.", " still too short.", " now this becomes sufficiently long for emission and ends here."]

    chunks = [chunk async for chunk in _iter_speech_chunks(_stream_tokens(tokens))]

    assert chunks
    assert all(len(chunk) >= 40 for chunk in chunks[:-1])


@pytest.mark.asyncio
async def test_final_buffer_is_flushed() -> None:
    tokens = ["This final buffer has no punctuation but should still flush at stream end"]

    chunks = [chunk async for chunk in _iter_speech_chunks(_stream_tokens(tokens))]

    assert len(chunks) == 1
    assert "should still flush" in chunks[0]
