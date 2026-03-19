import asyncio
import random
from typing import Optional

from livekit.agents import AgentSession
from livekit.plugins import murf

from voca.services.speech_chunking import (
    humanize_chunk,
    iter_response_chunks,
    pause_after_chunk_ms,
)


class HumanizedTTSStreamer:
    """Streams speech in natural chunks with pauses, emphasis, and light disfluencies."""

    def __init__(
        self,
        session: AgentSession,
        murf_tts: murf.TTS,
        rng: Optional[random.Random] = None,
    ) -> None:
        self._session = session
        self._murf_tts = murf_tts
        self._rng = rng or random.Random()
        self._current_speech_handle = None
        self._tts_lock = asyncio.Lock()

        # Baseline conversational style.
        self._murf_tts.update_options(style="Conversational", speed=-4, pitch=0)

    async def say(
        self,
        text: str,
        *,
        allow_interruptions: bool = True,
        add_to_chat_ctx: bool = True,
    ):
        cleaned = (text or "").strip()
        if not cleaned:
            cleaned = "Just a moment..."

        async def chunk_stream():
            previous_chunk: Optional[str] = None
            # Capture a stable TTS reference for the whole utterance so that
            # mid-stream voice updates don't glitch playback.
            async with self._tts_lock:
                tts = self._murf_tts

            for raw_chunk in iter_response_chunks(cleaned):
                if previous_chunk is not None:
                    pause_ms = pause_after_chunk_ms(previous_chunk, self._rng)
                    await asyncio.sleep(pause_ms / 1000)

                # Add subtle per-chunk prosody variation.
                tts.update_options(
                    style="Conversational",
                    # Keep pace closer to natural speech, with light variation.
                    speed=self._rng.randint(-5, -2),
                    pitch=self._rng.randint(-1, 2),
                )

                spoken_chunk = humanize_chunk(raw_chunk, self._rng)
                previous_chunk = raw_chunk
                yield spoken_chunk

        self._current_speech_handle = await self._session.say(
            chunk_stream(),
            allow_interruptions=allow_interruptions,
            add_to_chat_ctx=add_to_chat_ctx,
        )
        return self._current_speech_handle

    def interrupt_current(self) -> None:
        if self._current_speech_handle is None:
            return

        try:
            self._current_speech_handle.interrupt(force=True)
        except Exception:
            # Interruption is best-effort; handle may already be completed.
            return
    
    def update_tts(self, new_murf_tts: murf.TTS) -> None:
        """
        Update the TTS instance for multilingual support.
        
        Args:
            new_murf_tts: New Murf TTS instance
        """
        async def _swap() -> None:
            async with self._tts_lock:
                self._murf_tts = new_murf_tts
                # Reapply conversational style baseline
                self._murf_tts.update_options(style="Conversational", speed=-4, pitch=0)

        # Swap safely without interrupting current stream.
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(_swap())
        except RuntimeError:
            # If called outside of an event loop, do a best-effort synchronous swap.
            self._murf_tts = new_murf_tts
            self._murf_tts.update_options(style="Conversational", speed=-4, pitch=0)
