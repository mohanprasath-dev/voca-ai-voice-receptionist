import asyncio
import json
import logging
import time
from contextlib import suppress
from typing import Optional
from uuid import uuid4

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    AgentStateChangedEvent,
    JobContext,
    JobProcess,
    MetricsCollectedEvent,
    RoomInputOptions,
    SpeechCreatedEvent,
    UserInputTranscribedEvent,
    UserStateChangedEvent,
    WorkerOptions,
    cli,
    metrics,
)
from livekit.plugins import deepgram, google, noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from voca.config.multilingual_config import (
    SUPPORTED_LANGUAGES,
    get_language,
    get_voice,
    resolve_final_config,
)
from voca.prompts.system_prompt import get_dynamic_system_prompt
from voca.services.multilingual_tts import multilingual_tts_service
from voca.services.telemetry import Telemetry

logger = logging.getLogger("agent")

load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(self, agent_config: Optional[dict] = None) -> None:
        system_prompt = get_dynamic_system_prompt(agent_config)
        super().__init__(instructions=system_prompt)
        self._agent_config = agent_config or {}


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


def _normalize_language(code: Optional[str]) -> Optional[str]:
    if not code:
        return None
    primary = str(code).strip().split("-")[0].split("_")[0].lower()
    return primary or None


def _script_counts(text: str) -> dict[str, int]:
    counts: dict[str, int] = {"devanagari": 0, "tamil": 0, "latin": 0}
    for ch in text:
        o = ord(ch)
        if 0x0900 <= o <= 0x097F:
            counts["devanagari"] += 1
        elif 0x0B80 <= o <= 0x0BFF:
            counts["tamil"] += 1
        elif ("A" <= ch <= "Z") or ("a" <= ch <= "z"):
            counts["latin"] += 1
    return counts


def _dominant_script(text: str) -> Optional[str]:
    """Detect language from Unicode script — most reliable for Hindi/Tamil."""
    counts = _script_counts(text)
    total = sum(counts.values())
    if total == 0:
        return None
    # If >20% of characters are Devanagari, it's Hindi
    if counts["devanagari"] / max(total, 1) > 0.20:
        return "hi"
    # If >20% of characters are Tamil script, it's Tamil
    if counts["tamil"] / max(total, 1) > 0.20:
        return "ta"
    # Hinglish heuristics
    lowered = text.lower()
    hinglish = (
        "namaste", "kal", "aaj", "baje", "kripya", "dhanyavad",
        "shukriya", "nahi", "haan", "theek", "accha", "kya", "hai",
        "mujhe", "aapko", "bahut", "kuch", "kaisa",
    )
    if any(w in lowered.split() for w in hinglish):
        return "hi"
    return None


def _resolve_language(transcript: str, detected: Optional[str], last: Optional[str]) -> str:
    """
    Resolve language with priority:
    1. Script-based detection (most reliable for Hindi/Tamil)
    2. Deepgram reported language
    3. Last known language
    4. English fallback
    """
    # Script detection is most reliable — check first
    script_lang = _dominant_script(transcript)
    if script_lang:
        return script_lang

    # Use Deepgram's reported language
    normalized = _normalize_language(detected)
    if normalized and normalized in SUPPORTED_LANGUAGES:
        return normalized

    # Keep last detected language
    if last:
        return last

    return "en"


async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}

    print("🔌 Connecting...")
    await ctx.connect()
    print("✅ Connected")

    print("⏳ Waiting for participant...")
    participant = await ctx.wait_for_participant()
    print(f"👤 Participant: {participant.identity}")

    # Load user config from participant metadata
    user_config = None
    if participant.metadata:
        try:
            user_config = json.loads(participant.metadata)
        except Exception:
            pass

    final_config = resolve_final_config(user_config)
    print(f"🌐 Language: {get_language(final_config)} | Voice: {get_voice(final_config)}")

    # Create TTS
    murf_tts = multilingual_tts_service.create_tts_instance(final_config)

    # Build AgentSession
    # NOTE: detect_language=True tells Deepgram to report per-utterance language codes
    # NOTE: language="multi" enables Deepgram multilingual streaming
    session = AgentSession(
        stt=deepgram.STT(
            model="nova-3",
            language="multi",
            detect_language=True,   # CRITICAL: must be True to get language codes back
            interim_results=True,
            smart_format=True,
        ),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf_tts,
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    telemetry = Telemetry()
    runtime_session_id = f"{ctx.room.name}-{uuid4().hex[:8]}"
    current_config = final_config.copy()
    last_detected_language: Optional[str] = None
    last_turn_activity_ms = int(time.time() * 1000)
    background_tasks: set[asyncio.Task] = set()

    def _track(task: asyncio.Task, name: str) -> None:
        background_tasks.add(task)
        def _done(t: asyncio.Task) -> None:
            background_tasks.discard(t)
            with suppress(Exception):
                if (exc := t.exception()):
                    logger.warning(f"Task '{name}' failed: {exc}")
        task.add_done_callback(_done)

    async def _pub(topic: str, payload: dict) -> None:
        try:
            lp = getattr(ctx.room, "local_participant", None)
            if lp:
                await lp.publish_data(json.dumps(payload), topic=topic, reliable=True)
        except Exception as e:
            logger.debug(f"pub failed: {e}")

    def _pub_bg(topic: str, payload: dict) -> None:
        _track(asyncio.create_task(_pub(topic, payload)), f"pub:{topic}")

    def _phase(phase: str, intent: Optional[str] = None) -> None:
        _pub_bg("voca.session", {
            "session_id": runtime_session_id,
            "phase": phase,
            "intent": intent,
            "timestamp_ms": int(time.time() * 1000),
        })

    def _chat(role: str, message: str) -> None:
        if not message:
            return
        _pub_bg("voca.chat", {
            "id": uuid4().hex,
            "role": role,
            "message": message,
            "timestamp_ms": int(time.time() * 1000),
        })

    # Metrics
    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)
        _pub_bg("voca.metrics", telemetry.snapshot())

    # Phase publishing
    @session.on("agent_state_changed")
    def _on_state(ev: AgentStateChangedEvent):
        phase_map = {"listening": "listening", "thinking": "reasoning", "speaking": "speaking"}
        _phase(phase_map.get(str(ev.new_state), "idle"))

    # Speech handle tracking
    latest_speech_handle = None
    is_agent_speaking = False

    @session.on("speech_created")
    def _on_speech(ev: SpeechCreatedEvent):
        nonlocal latest_speech_handle
        latest_speech_handle = ev.speech_handle

    @session.on("agent_state_changed")
    def _track_speaking(ev: AgentStateChangedEvent):
        nonlocal is_agent_speaking
        is_agent_speaking = ev.new_state == "speaking"

    @session.on("user_state_changed")
    def _on_user_state(ev: UserStateChangedEvent):
        nonlocal is_agent_speaking
        if ev.new_state == "speaking" and is_agent_speaking and latest_speech_handle:
            with suppress(Exception):
                latest_speech_handle.interrupt(force=True)
            is_agent_speaking = False
            _phase("listening", "interrupt")

    # Transcript → language detection + config update
    @session.on("user_input_transcribed")
    def _on_transcript(ev: UserInputTranscribedEvent):
        nonlocal last_detected_language, last_turn_activity_ms, current_config

        text = (ev.transcript or "").strip()
        if not text:
            return

        last_turn_activity_ms = int(time.time() * 1000)

        # Only act on final transcripts
        if not bool(getattr(ev, "is_final", True)):
            _phase("listening", "partial")
            return

        _chat("user", text)
        _phase("reasoning", "transcript")

        # Resolve language
        deepgram_lang = getattr(ev, "language", None)
        resolved = _resolve_language(text, deepgram_lang, last_detected_language)
        logger.info(f"Transcript: '{text}' | deepgram_lang={deepgram_lang} | resolved={resolved}")

        if resolved != last_detected_language:
            last_detected_language = resolved
            logger.info(f"Language updated → {resolved}")

        # Update agent config if language changed
        if resolved != get_language(current_config) and resolved in SUPPORTED_LANGUAGES:
            logger.info(f"🌐 Switching agent → language={resolved}")
            current_config = resolve_final_config(user_config, resolved)

            # Update TTS voice
            new_tts = multilingual_tts_service.update_tts_for_language(resolved, current_config)
            if new_tts:
                with suppress(Exception):
                    # Update session TTS engine
                    if hasattr(session, '_tts'):
                        session._tts = new_tts  # type: ignore[attr-defined]
                    elif hasattr(session, 'tts'):
                        session.tts = new_tts  # type: ignore[attr-defined]
                logger.info(f"🔊 TTS voice updated → {get_voice(current_config)}")

            # Update LLM system instructions
            with suppress(Exception):
                session.update_instructions(get_dynamic_system_prompt(current_config))
                logger.info(f"📝 Instructions updated for {resolved}")

    # Start agent
    print("🚀 Starting agent...")
    await session.start(
        agent=Assistant(final_config),
        room=ctx.room,
        room_input_options=RoomInputOptions(noise_cancellation=noise_cancellation.BVC()),
    )
    print("✅ Agent is live — listening for speech")
    _phase("listening", "connected")

    # Keepalive
    KEEPALIVE = {
        "en": "Still there? I'm here whenever you're ready.",
        "hi": "क्या आप अभी भी यहाँ हैं? मैं यहाँ हूँ।",
        "ta": "நீங்கள் இன்னும் இங்கே இருக்கிறீர்களா? நான் இங்கே இருக்கிறேன்.",
    }

    async def _keepalive():
        while True:
            await asyncio.sleep(30)
            if int(time.time() * 1000) - last_turn_activity_ms >= 60_000:
                lang = get_language(current_config)
                msg = KEEPALIVE.get(lang, KEEPALIVE["en"])
                _phase("speaking", "keepalive")
                with suppress(Exception):
                    await session.say(msg, allow_interruptions=True)
                _phase("listening", "keepalive")

    ka = asyncio.create_task(_keepalive())
    _track(ka, "keepalive")

    async def _shutdown():
        ka.cancel()
        pending = [t for t in list(background_tasks) if not t.done()]
        for t in pending:
            t.cancel()
        if pending:
            await asyncio.gather(*pending, return_exceptions=True)

    ctx.add_shutdown_callback(_shutdown)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
