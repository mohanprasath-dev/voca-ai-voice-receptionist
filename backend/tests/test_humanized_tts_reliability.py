import asyncio

import pytest

from voca.services.humanized_tts import HumanizedTTSStreamer


class FakeTTS:
    def __init__(self, voice: str = "en-US-natalie") -> None:
        self.voice = voice
        self.options_calls: list[dict] = []

    def update_options(self, **kwargs) -> None:
        self.options_calls.append(kwargs)


class FakeHandle:
    def __init__(self, on_done) -> None:
        self._done = asyncio.Event()
        self._on_done = on_done
        self.interrupted = False

    def complete(self) -> None:
        if not self._done.is_set():
            self._done.set()
            self._on_done()

    async def wait_for_playout(self) -> None:
        await self._done.wait()

    def interrupt(self, force: bool = True) -> None:
        self.interrupted = True
        self.complete()


class FakeSession:
    def __init__(self, failures_before_success: int = 0, auto_complete: bool = False) -> None:
        self.failures_before_success = failures_before_success
        self.auto_complete = auto_complete
        self.calls: list[str] = []
        self.handles: list[FakeHandle] = []
        self.active = 0
        self.max_active = 0

    async def say(self, text: str, **_kwargs):
        self.calls.append(text)
        if self.failures_before_success > 0:
            self.failures_before_success -= 1
            raise RuntimeError("transient tts failure")

        self.active += 1
        self.max_active = max(self.max_active, self.active)

        def _on_done() -> None:
            self.active -= 1

        handle = FakeHandle(_on_done)
        self.handles.append(handle)
        if self.auto_complete:
            handle.complete()
        return handle


@pytest.mark.asyncio
async def test_interrupt_current_during_speaking() -> None:
    session = FakeSession()
    tts = FakeTTS()
    streamer = HumanizedTTSStreamer(session=session, murf_tts=tts)

    speak_task = asyncio.create_task(streamer.say("Please hold."))
    await asyncio.sleep(0)

    assert session.handles
    handle = session.handles[0]

    streamer.interrupt_current()
    await speak_task

    assert handle.interrupted is True


@pytest.mark.asyncio
async def test_language_switch_is_deferred_while_speaking() -> None:
    session = FakeSession()
    tts_en = FakeTTS("en-US-natalie")
    tts_hi = FakeTTS("hi-IN-aditi")
    streamer = HumanizedTTSStreamer(session=session, murf_tts=tts_en)

    speak_task = asyncio.create_task(streamer.say("Let me confirm your request."))
    await asyncio.sleep(0)

    await streamer.update_tts(tts_hi)
    assert streamer._murf_tts is tts_en

    session.handles[0].complete()
    await speak_task

    assert streamer._murf_tts is tts_hi
    assert streamer._language == "hi"


@pytest.mark.asyncio
async def test_tts_retry_then_fallback_path() -> None:
    session = FakeSession(failures_before_success=2, auto_complete=True)
    primary = FakeTTS("en-US-natalie")
    fallback = FakeTTS("en-US-matthew")
    streamer = HumanizedTTSStreamer(session=session, murf_tts=primary, fallback_tts=fallback)

    await streamer.say("Hello???")

    assert len(session.calls) == 3
    assert session.calls[-1] == "Please say that again."
    assert streamer._murf_tts is fallback


@pytest.mark.asyncio
async def test_no_overlapping_speech_handles() -> None:
    session = FakeSession()
    tts = FakeTTS()
    streamer = HumanizedTTSStreamer(session=session, murf_tts=tts)

    first = asyncio.create_task(streamer.say("First message."))
    await asyncio.sleep(0)

    second = asyncio.create_task(streamer.say("Second message."))
    await asyncio.sleep(0.01)

    assert len(session.calls) == 1
    session.handles[0].complete()
    await first

    await asyncio.sleep(0)
    assert len(session.calls) == 2
    session.handles[1].complete()
    await second

    assert session.max_active == 1


@pytest.mark.asyncio
async def test_clarity_mode_uses_deterministic_settings() -> None:
    session = FakeSession(auto_complete=True)
    tts = FakeTTS("en-US-natalie")
    streamer = HumanizedTTSStreamer(session=session, murf_tts=tts)

    await streamer.say("Okay.... this is clear!!!")
    await streamer.say("Okay.... this is clear!!!")

    assert tts.options_calls
    assert tts.options_calls[0] == {
        "style": "Conversational",
        "speed": -4,
        "pitch": 0,
    }
    assert len(tts.options_calls) == 1
    assert session.calls == ["Okay. this is clear!", "Okay. this is clear!"]
