import asyncio
import logging
import random
from typing import Optional

from livekit.agents import AgentSession
from livekit.plugins import murf

from voca.services.speech_chunking import (
    humanize_chunk,
    iter_response_chunks,
    pause_after_chunk_ms,
)

logger = logging.getLogger("agent")

# Murf API allows max 2 concurrent TTS requests
_MURF_CONCURRENCY_SEMAPHORE = asyncio.Semaphore(2)


class HumanizedTTSStreamer:
    """Streams speech with natural prosody variation using session.say(text)."""

    def __init__(
        self,
        session: AgentSession,
        murf_tts: murf.TTS,
        rng: Optional[random.Random] = None,
    ) -> None:
        self._session = session
        self._murf_tts = murf_tts
        self._rng = rng or random.Random()
        self._language = "en"
        self._current_speech_handle = None
        self._tts_lock = asyncio.Lock()

        # Baseline conversational style
        try:
            self._murf_tts.update_options(style="Conversational", speed=-4, pitch=0)
        except Exception as e:
            logger.debug(f"Could not set initial TTS options: {e}")

    async def say(
        self,
        text: str,
        *,
        allow_interruptions: bool = True,
        add_to_chat_ctx: bool = True,
    ):
        """Say text using session.say() with a plain string — the only supported API."""
        cleaned = (text or "").strip()
        if not cleaned:
            cleaned = {
                "hi": "एक क्षण...",
                "ta": "ஒரு கணம்...",
            }.get(self._language, "Just a moment...")

        # Apply light prosody variation before speaking
        try:
            if self._language in ("hi", "ta"):
                speed = self._rng.randint(-10, -7)
                pitch = self._rng.randint(-1, 1)
            else:
                speed = self._rng.randint(-5, -2)
                pitch = self._rng.randint(-1, 2)

            async with self._tts_lock:
                self._murf_tts.update_options(
                    style="Conversational",
                    speed=speed,
                    pitch=pitch,
                )
        except Exception as e:
            logger.debug(f"TTS option update failed (non-fatal): {e}")

        # session.say() only accepts a plain string — pass the full text directly
        async with _MURF_CONCURRENCY_SEMAPHORE:
            try:
                self._current_speech_handle = await self._session.say(
                    cleaned,
                    allow_interruptions=allow_interruptions,
                    add_to_chat_ctx=add_to_chat_ctx,
                )
            except Exception as say_err:
                logger.error(f"session.say() failed: {say_err}")
                raise

        return self._current_speech_handle

    def interrupt_current(self) -> None:
        if self._current_speech_handle is None:
            return
        try:
            self._current_speech_handle.interrupt(force=True)
        except Exception:
            pass

    async def update_tts(self, new_murf_tts: murf.TTS) -> None:
        """Update the TTS instance for multilingual support."""
        async with self._tts_lock:
            self._murf_tts = new_murf_tts
            # Detect language from voice name
            voice_attr = (
                getattr(new_murf_tts, "_voice", None)
                or getattr(new_murf_tts, "voice", None)
                or ""
            )
            if "hi-IN" in str(voice_attr):
                self._language = "hi"
            elif "ta-IN" in str(voice_attr):
                self._language = "ta"
            else:
                self._language = "en"

            base_speed = -8 if self._language in ("hi", "ta") else -4
            try:
                self._murf_tts.update_options(
                    style="Conversational", speed=base_speed, pitch=0
                )
            except Exception as e:
                logger.debug(f"Could not update TTS options on language change: {e}")

    async def aclose(self) -> None:
        """Best-effort cleanup."""
        async with self._tts_lock:
            self.interrupt_current()
            close_fn = getattr(self._murf_tts, "aclose", None)
            if callable(close_fn):
                try:
                    await close_fn()
                except Exception as close_err:
                    logger.debug(f"Murf TTS close failed: {close_err}")
