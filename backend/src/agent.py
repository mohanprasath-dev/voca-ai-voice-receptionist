import asyncio
import json
import logging
import time
from contextlib import suppress
from typing import Any, Optional
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
from livekit.agents.llm import ChatContext
from livekit.plugins import deepgram, google, noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from voca.app_config import DEFAULT_CONFIG
from voca.config.multilingual_config import (
    SUPPORTED_LANGUAGES,
    get_language,
    get_voice,
    resolve_final_config,
)
from voca.prompts.system_prompt import get_dynamic_system_prompt
from voca.services.budget_manager import BudgetManager
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
    cleaned = str(code).strip()
    if not cleaned:
        return None
    primary = cleaned.split("-")[0].split("_")[0].lower()
    return primary or None


def _script_counts(text: str) -> dict[str, int]:
    counts: dict[str, int] = {"devanagari": 0, "tamil": 0, "arabic": 0, "latin": 0}
    for ch in text:
        o = ord(ch)
        if 0x0900 <= o <= 0x097F:
            counts["devanagari"] += 1
        elif 0x0B80 <= o <= 0x0BFF:
            counts["tamil"] += 1
        elif 0x0600 <= o <= 0x06FF:
            counts["arabic"] += 1
        elif ("A" <= ch <= "Z") or ("a" <= ch <= "z"):
            counts["latin"] += 1
    return counts


def _dominant_language_from_text(text: str) -> Optional[str]:
    counts = _script_counts(text)
    lowered = text.lower()
    if any(
        token in lowered.split()
        for token in ("namaste", "kal", "aaj", "baje", "kripya", "dhanyavad", "shukriya", "nahi", "haan")
    ):
        return "hi"
    if counts["tamil"] > 0 and counts["tamil"] >= max(counts["devanagari"], counts["arabic"]):
        return "ta"
    if counts["devanagari"] > 0 and counts["devanagari"] >= max(counts["tamil"], counts["arabic"]):
        return "hi"
    return None


def _resolve_detected_language(
    transcript: str,
    detected: Optional[str],
    *,
    last_detected_language: Optional[str],
) -> str:
    normalized = _normalize_language(detected) if detected else None
    inferred = _dominant_language_from_text(transcript)

    if not normalized:
        return inferred or last_detected_language or "en"

    # If Deepgram says English but we see non-Latin script, trust the script
    if normalized == "en" and inferred and inferred != "en":
        return last_detected_language or inferred

    return normalized


async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}

    # Connect to LiveKit room
    print("🔌 Connecting to room...")
    await ctx.connect()
    print("✅ Connected")

    # Wait for participant
    print("⏳ Waiting for participant...")
    participant = await ctx.wait_for_participant()
    print(f"👤 Participant joined: {participant.identity}")

    # Load user config from participant metadata
    user_config = None
    if participant.metadata:
        try:
            user_config = json.loads(participant.metadata)
            logger.info(f"User config loaded: {user_config}")
        except Exception as e:
            logger.warning(f"Could not parse metadata: {e}")

    # Resolve configuration
    final_config = resolve_final_config(user_config)
    logger.info(
        f"Final config — language: {get_language(final_config)}, voice: {get_voice(final_config)}"
    )

    # Create TTS
    murf_tts = multilingual_tts_service.create_tts_instance(final_config)

    # Build AgentSession — Gemini LLM handles ALL responses
    session = AgentSession(
        stt=deepgram.STT(
            model="nova-3",
            language="multi",
            detect_language=False,
            interim_results=True,
            smart_format=True,
        ),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf_tts,
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    # Telemetry + budget
    budget_manager = BudgetManager(DEFAULT_CONFIG)
    telemetry = Telemetry()
    runtime_session_id = f"{ctx.room.name}-{uuid4().hex[:8]}"

    # Session state
    current_config = final_config.copy()
    last_detected_language: Optional[str] = None
    last_turn_activity_ms = int(time.time() * 1000)
    background_tasks: set[asyncio.Task] = set()

    def _track_task(task: asyncio.Task, *, name: str) -> None:
        background_tasks.add(task)

        def _on_done(t: asyncio.Task) -> None:
            background_tasks.discard(t)
            with suppress(Exception):
                exc = t.exception()
                if exc:
                    logger.warning(f"Background task '{name}' failed: {exc}")

        task.add_done_callback(_on_done)

    async def _publish_data(topic: str, payload: dict) -> None:
        try:
            lp = getattr(ctx.room, "local_participant", None)
            if lp:
                await lp.publish_data(
                    payload=json.dumps(payload), topic=topic, reliable=True
                )
        except Exception as e:
            logger.debug(f"publish_data failed ({topic}): {e}")

    def _publish_bg(topic: str, payload: dict) -> None:
        t = asyncio.create_task(_publish_data(topic, payload))
        _track_task(t, name=f"publish:{topic}")

    def _publish_phase(phase: str, intent: Optional[str] = None) -> None:
        _publish_bg(
            "voca.session",
            {
                "session_id": runtime_session_id,
                "phase": phase,
                "intent": intent,
                "timestamp_ms": int(time.time() * 1000),
            },
        )

    def _publish_chat(role: str, message: str) -> None:
        if not message:
            return
        _publish_bg(
            "voca.chat",
            {
                "id": uuid4().hex,
                "role": role,
                "message": message,
                "timestamp_ms": int(time.time() * 1000),
            },
        )

    # ── Metrics ──────────────────────────────────────────────────────────────
    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)
        summary = usage_collector.get_summary()

        def _val(src: Any, keys: list[str]) -> float:
            for k in keys:
                v = (src.get(k) if isinstance(src, dict) else getattr(src, k, None))
                if v is not None:
                    try:
                        return float(v)
                    except (TypeError, ValueError):
                        pass
            return 0.0

        budget_manager.record_stt_seconds(_val(summary, ["stt_audio_duration", "stt_seconds"]))
        budget_manager.record_tts_seconds(_val(summary, ["tts_audio_duration", "tts_seconds"]))
        budget_manager.record_characters(int(_val(summary, ["llm_characters", "llm_chars"])))

        telemetry.set_budget_usage_percentage(
            max(
                budget_manager.usage().stt_seconds_used / DEFAULT_CONFIG.stt_max_seconds * 100,
                budget_manager.usage().tts_seconds_used / DEFAULT_CONFIG.tts_max_seconds * 100,
                budget_manager.usage().char_used / DEFAULT_CONFIG.api_char_budget * 100,
            )
        )
        telemetry.set_budget_mode(budget_manager.current_mode())
        _publish_bg("voca.metrics", telemetry.snapshot())

    # ── Agent state → phase publishing ───────────────────────────────────────
    @session.on("agent_state_changed")
    def _on_agent_state(ev: AgentStateChangedEvent):
        phase_map = {
            "listening": "listening",
            "thinking": "reasoning",
            "speaking": "speaking",
        }
        phase = phase_map.get(str(ev.new_state), "idle")
        _publish_phase(phase)

    # ── Speech created → track handle ────────────────────────────────────────
    latest_speech_handle = None

    @session.on("speech_created")
    def _on_speech_created(ev: SpeechCreatedEvent):
        nonlocal latest_speech_handle
        latest_speech_handle = ev.speech_handle

    # ── User barge-in interrupt ───────────────────────────────────────────────
    is_agent_speaking = False

    @session.on("agent_state_changed")
    def _track_speaking(ev: AgentStateChangedEvent):
        nonlocal is_agent_speaking
        is_agent_speaking = ev.new_state == "speaking"

    @session.on("user_state_changed")
    def _on_user_state(ev: UserStateChangedEvent):
        nonlocal is_agent_speaking
        if ev.new_state == "speaking" and is_agent_speaking and latest_speech_handle is not None:
            try:
                latest_speech_handle.interrupt(force=True)
                is_agent_speaking = False
                _publish_phase("listening", intent="interrupt")
            except Exception as e:
                logger.debug(f"Interrupt failed: {e}")

    # ── Transcript → language detection + phase publish ──────────────────────
    @session.on("user_input_transcribed")
    def _on_transcript(ev: UserInputTranscribedEvent):
        nonlocal last_detected_language, last_turn_activity_ms, current_config

        user_text = (ev.transcript or "").strip()
        if not user_text:
            return

        last_turn_activity_ms = int(time.time() * 1000)
        is_final = bool(getattr(ev, "is_final", True))

        if not is_final:
            _publish_phase("listening", intent="partial")
            return

        # Publish chat message from user
        _publish_chat("user", user_text)
        _publish_phase("reasoning", intent="transcript")

        # Detect language
        detected_raw = getattr(ev, "language", None)
        resolved_lang = _resolve_detected_language(
            user_text, detected_raw, last_detected_language=last_detected_language
        )
        last_detected_language = resolved_lang

        logger.info(f"User: '{user_text}' | Language: {resolved_lang}")

        # Switch language/voice/prompt if changed
        if resolved_lang != get_language(current_config) and resolved_lang in SUPPORTED_LANGUAGES:
            logger.info(f"Language switch: {get_language(current_config)} → {resolved_lang}")
            new_config = resolve_final_config(user_config, resolved_lang)
            current_config = new_config

            # Update TTS voice
            new_tts = multilingual_tts_service.update_tts_for_language(resolved_lang, current_config)
            if new_tts:
                # Update session TTS — apply to AgentSession directly
                try:
                    session._tts = new_tts  # type: ignore[attr-defined]
                except Exception:
                    pass

            # Update LLM instructions
            new_prompt = get_dynamic_system_prompt(current_config)
            try:
                session.update_instructions(new_prompt)
            except Exception as e:
                logger.warning(f"update_instructions failed: {e}")

    # ── Start the session ─────────────────────────────────────────────────────
    print("🚀 Starting AgentSession...")
    await session.start(
        agent=Assistant(final_config),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )
    print("✅ AgentSession started — agent is live")

    _publish_phase("listening", intent="connected")

    # ── Keepalive loop ────────────────────────────────────────────────────────
    async def _keepalive_loop():
        KEEPALIVE = {
            "en": "Still with me? I'm here whenever you're ready.",
            "hi": "क्या आप अभी भी यहाँ हैं? मैं यहाँ हूँ।",
            "ta": "நீங்கள் இன்னும் இங்கே இருக்கிறீர்களா? நான் இங்கே இருக்கிறேன்.",
        }
        while True:
            await asyncio.sleep(30)
            now_ms = int(time.time() * 1000)
            if now_ms - last_turn_activity_ms >= 60_000:
                lang = get_language(current_config)
                msg = KEEPALIVE.get(lang, KEEPALIVE["en"])
                logger.info(f"Sending keepalive ({lang})")
                _publish_phase("speaking", intent="keepalive")
                try:
                    await session.say(msg, allow_interruptions=True)
                except Exception as e:
                    logger.debug(f"Keepalive TTS failed: {e}")
                _publish_phase("listening", intent="keepalive")

    ka_task = asyncio.create_task(_keepalive_loop())
    _track_task(ka_task, name="keepalive")

    # ── Shutdown ──────────────────────────────────────────────────────────────
    async def _shutdown():
        ka_task.cancel()
        pending = [t for t in list(background_tasks) if not t.done()]
        for t in pending:
            t.cancel()
        if pending:
            await asyncio.gather(*pending, return_exceptions=True)

    ctx.add_shutdown_callback(_shutdown)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
