"""
HumanizedTTSStreamer — wraps session.say() with prosody variation.
Strict reliability mode: deterministic settings, single in-flight speak,
safe interruption handling, and TTS retry/fallback.
"""

import asyncio
import logging
import re
import time
from typing import Optional

from livekit.agents import AgentSession
from livekit.plugins import murf

logger = logging.getLogger("agent")

# Created lazily inside the event loop to avoid "no running loop" errors
_semaphore: Optional[asyncio.Semaphore] = None

def _get_semaphore() -> asyncio.Semaphore:
    global _semaphore
    if _semaphore is None:
        _semaphore = asyncio.Semaphore(1)
    return _semaphore


LANG_SPEED = {
    "en": -4,
    "hi": -8,
    "ta": -8,
}


def _sanitize_tts_text(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", (text or "").strip())
    if not cleaned:
        return ""
    cleaned = re.sub(r"([!?.,;:])\1+", r"\1", cleaned)
    cleaned = re.sub(r"\b(uh+|um+|hmm+)\b[,.!? ]*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


class HumanizedTTSStreamer:
    """
    Sends speech via session.say() using deterministic settings.
    Does NOT pass async generators — session.say() only accepts plain strings.
    """

    def __init__(
        self,
        session: AgentSession,
        murf_tts: murf.TTS,
        fallback_tts: Optional[murf.TTS] = None,
    ) -> None:
        self._session = session
        self._murf_tts = murf_tts
        self._fallback_tts = fallback_tts or murf_tts
        self._language = "en"
        self._current_speech_handle = None
        self._tts_lock = asyncio.Lock()
        self._speak_lock = asyncio.Lock()
        self._pending_tts: Optional[murf.TTS] = None
        self._apply_baseline()

    def _log(self, event: str, **fields: object) -> None:
        payload = {"event": event, "ts_ms": int(time.time() * 1000)}
        payload.update(fields)
        logger.info("speech_pipeline %s", payload)

    def _apply_baseline(self) -> None:
        speed = LANG_SPEED.get(self._language, -4)
        try:
            self._murf_tts.update_options(style="Conversational", speed=speed, pitch=0)
        except Exception as e:
            logger.debug(f"baseline TTS options failed (non-fatal): {e}")

    async def say(self, text: str, *, allow_interruptions: bool = True, add_to_chat_ctx: bool = True):
        cleaned = _sanitize_tts_text(text)
        if not cleaned:
            cleaned = {"hi": "कृपया दोहराएं।", "ta": "மீண்டும் சொல்லுங்கள்.", "en": "Please repeat that."}.get(
                self._language,
                "Please repeat that.",
            )

        async with _get_semaphore():
            async with self._speak_lock:
                self._log("speech_start_requested", language=self._language, text_len=len(cleaned))
                try:
                    self._current_speech_handle = await self._try_say(
                        cleaned,
                        allow_interruptions=allow_interruptions,
                        add_to_chat_ctx=add_to_chat_ctx,
                    )
                    self._log("speech_started", language=self._language)
                    await self._wait_until_done(self._current_speech_handle)
                    self._log("speech_finished", language=self._language)
                    return self._current_speech_handle
                finally:
                    await self._apply_pending_tts_if_any()

    async def _try_say(self, text: str, *, allow_interruptions: bool, add_to_chat_ctx: bool):
        try:
            return await self._session.say(
                text,
                allow_interruptions=allow_interruptions,
                add_to_chat_ctx=add_to_chat_ctx,
            )
        except Exception as first_error:
            self._log("tts_failure", attempt=1, error=str(first_error))
            try:
                handle = await self._session.say(
                    text,
                    allow_interruptions=allow_interruptions,
                    add_to_chat_ctx=add_to_chat_ctx,
                )
                self._log("tts_retry_success", attempt=2)
                return handle
            except Exception as second_error:
                self._log("tts_failure", attempt=2, error=str(second_error))
                await self._apply_fallback_voice()
                fallback_text = _sanitize_tts_text(
                    {"hi": "कृपया दोबारा बोलें।", "ta": "தயவுசெய்து மீண்டும் சொல்லுங்கள்.", "en": "Please say that again."}.get(
                        self._language,
                        "Please say that again.",
                    )
                )
                self._log("tts_fallback", language=self._language)
                return await self._session.say(
                    fallback_text,
                    allow_interruptions=allow_interruptions,
                    add_to_chat_ctx=add_to_chat_ctx,
                )

    async def _wait_until_done(self, handle) -> None:
        for method_name in ("wait_for_playout", "wait", "join"):
            waiter = getattr(handle, method_name, None)
            if callable(waiter):
                result = waiter()
                if asyncio.iscoroutine(result):
                    await result
                return

    async def _apply_fallback_voice(self) -> None:
        async with self._tts_lock:
            self._murf_tts = self._fallback_tts
            self._apply_baseline()

    def interrupt_current(self) -> None:
        if self._current_speech_handle is None:
            return
        try:
            self._current_speech_handle.interrupt(force=True)
            self._log("speech_interrupted")
        except Exception:
            pass

    async def update_tts(self, new_tts: murf.TTS) -> None:
        if self._speak_lock.locked():
            self._pending_tts = new_tts
            self._log("language_switch_deferred")
            return

        await self._apply_tts(new_tts)

    async def _apply_tts(self, new_tts: murf.TTS) -> None:
        async with self._tts_lock:
            self._murf_tts = new_tts
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
            self._log("language_switch_applied", language=self._language)

    async def _apply_pending_tts_if_any(self) -> None:
        if self._pending_tts is None:
            return
        pending = self._pending_tts
        self._pending_tts = None
        await self._apply_tts(pending)

    async def aclose(self) -> None:
        async with self._tts_lock:
            self.interrupt_current()
            close_fn = getattr(self._murf_tts, "aclose", None)
            if callable(close_fn):
                try:
                    await close_fn()
                except Exception as e:
                    logger.debug(f"TTS close failed: {e}")
