"""
HumanizedTTSStreamer — wraps session.say() with prosody variation.
Semaphore enforces Murf's 2-concurrent-request limit.
"""

import asyncio
import logging
import random
from typing import Optional

from livekit.agents import AgentSession
from livekit.plugins import murf

logger = logging.getLogger("agent")

# Created lazily inside the event loop to avoid "no running loop" errors
_semaphore: Optional[asyncio.Semaphore] = None

def _get_semaphore() -> asyncio.Semaphore:
    global _semaphore
    if _semaphore is None:
        _semaphore = asyncio.Semaphore(2)
    return _semaphore


class HumanizedTTSStreamer:
    """
    Sends speech via session.say() with light prosody variation per turn.
    Does NOT pass async generators — session.say() only accepts plain strings.
    """

    def __init__(self, session: AgentSession, murf_tts: murf.TTS, rng: Optional[random.Random] = None) -> None:
        self._session = session
        self._murf_tts = murf_tts
        self._rng = rng or random.Random()
        self._language = "en"
        self._current_speech_handle = None
        self._tts_lock = asyncio.Lock()
        self._apply_baseline()

    def _apply_baseline(self) -> None:
        speed = -8 if self._language in ("hi", "ta") else -4
        try:
            self._murf_tts.update_options(style="Conversational", speed=speed, pitch=0)
        except Exception as e:
            logger.debug(f"baseline TTS options failed (non-fatal): {e}")

    async def say(self, text: str, *, allow_interruptions: bool = True, add_to_chat_ctx: bool = True):
        cleaned = (text or "").strip()
        if not cleaned:
            cleaned = {"hi": "एक क्षण...", "ta": "ஒரு கணம்..."}.get(self._language, "Just a moment...")

        # Light per-turn prosody variation
        try:
            async with self._tts_lock:
                if self._language in ("hi", "ta"):
                    speed = self._rng.randint(-10, -7)
                    pitch = self._rng.randint(-1, 1)
                else:
                    speed = self._rng.randint(-6, -2)
                    pitch = self._rng.randint(-1, 2)
                self._murf_tts.update_options(style="Conversational", speed=speed, pitch=pitch)
        except Exception as e:
            logger.debug(f"prosody update failed (non-fatal): {e}")

        async with _get_semaphore():
            try:
                self._current_speech_handle = await self._session.say(
                    cleaned,
                    allow_interruptions=allow_interruptions,
                    add_to_chat_ctx=add_to_chat_ctx,
                )
            except Exception as e:
                logger.error(f"session.say() failed: {e}")
                raise

        return self._current_speech_handle

    def interrupt_current(self) -> None:
        if self._current_speech_handle is None:
            return
        try:
            self._current_speech_handle.interrupt(force=True)
        except Exception:
            pass

    async def update_tts(self, new_tts: murf.TTS) -> None:
        async with self._tts_lock:
            self._murf_tts = new_tts
            # Detect language from voice name
            voice = (
                getattr(new_tts, "_voice", None)
                or getattr(new_tts, "voice", None)
                or ""
            )
            voice_str = str(voice)
            if "hi-IN" in voice_str:
                self._language = "hi"
            elif "ta-IN" in voice_str:
                self._language = "ta"
            else:
                self._language = "en"
        self._apply_baseline()

    async def aclose(self) -> None:
        async with self._tts_lock:
            self.interrupt_current()
            close_fn = getattr(self._murf_tts, "aclose", None)
            if callable(close_fn):
                try:
                    await close_fn()
                except Exception as e:
                    logger.debug(f"TTS close failed: {e}")
