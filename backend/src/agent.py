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
from voca.prompts import get_dynamic_system_prompt
from voca.services.multilingual_tts import multilingual_tts_service
from voca.services.telemetry import Telemetry

logger = logging.getLogger("agent")

load_dotenv(".env.local")

# ── Language detection ────────────────────────────────────────────────────────

def _normalize_lang(code: Optional[str]) -> Optional[str]:
    """'hi-IN' → 'hi'"""
    if not code:
        return None
    return str(code).strip().split("-")[0].split("_")[0].lower() or None


def _script_detect(text: str) -> Optional[str]:
    """
    Unicode script analysis — most reliable for non-Latin languages.
    Threshold: >15% of non-space characters must belong to a script.
    """
    counts: dict[str, int] = {"hi": 0, "ta": 0, "ar": 0, "ko": 0, "ja": 0, "zh": 0}
    for ch in text:
        o = ord(ch)
        if   0x0900 <= o <= 0x097F: counts["hi"] += 1   # Devanagari → Hindi
        elif 0x0B80 <= o <= 0x0BFF: counts["ta"] += 1   # Tamil
        elif 0x0600 <= o <= 0x06FF: counts["ar"] += 1   # Arabic
        elif 0xAC00 <= o <= 0xD7AF: counts["ko"] += 1   # Hangul → Korean
        elif 0x3040 <= o <= 0x30FF: counts["ja"] += 1   # Hiragana/Katakana → Japanese
        elif 0x4E00 <= o <= 0x9FFF: counts["zh"] += 1   # CJK → Chinese
    total = max(len(text.replace(" ", "")), 1)
    for lang, cnt in counts.items():
        if cnt / total > 0.15:
            return lang
    return None


def _hinglish_detect(text: str) -> Optional[str]:
    """Detect Hindi written in Roman script (Hinglish)."""
    TOKENS = {
        "namaste", "namaskar", "kal", "aaj", "aaye", "baje", "kripya",
        "dhanyavad", "shukriya", "nahi", "haan", "theek", "accha", "kya",
        "hai", "hain", "mujhe", "aapko", "aapse", "bahut", "kuch", "kaisa",
        "kaisi", "tum", "aap", "mera", "meri", "tera", "teri", "yeh", "voh",
        "phir", "abhi", "jaldi", "thoda", "zyada", "matlab", "samajh",
        "boliye", "suniye", "dijiye", "chahiye", "batao", "bataiye",
        "shukriya", "alvida", "pyaar", "dost", "bhai", "didi",
    }
    words = set(text.lower().split())
    hits = words & TOKENS
    if len(hits) >= 2:
        return "hi"
    if len(hits) == 1 and len(words) <= 5:
        return "hi"
    return None


def _resolve_language(
    transcript: str,
    deepgram_lang: Optional[str],
    last_lang: Optional[str],
) -> str:
    """
    Priority:
    1. Unicode script  — unambiguous for Hindi/Tamil/Arabic/Japanese/Korean/Chinese
    2. Hinglish heuristic — Latin-script Hindi
    3. Deepgram language code (available only when NOT in streaming detect mode)
    4. Last session language
    5. English default
    """
    if (lang := _script_detect(transcript)):
        return lang
    if (lang := _hinglish_detect(transcript)):
        return lang
    if (lang := _normalize_lang(deepgram_lang)) and lang in SUPPORTED_LANGUAGES:
        return lang
    if last_lang and last_lang in SUPPORTED_LANGUAGES:
        return last_lang
    return "en"


# ── Agent class ───────────────────────────────────────────────────────────────

class Assistant(Agent):
    def __init__(self, agent_config: Optional[dict] = None) -> None:
        super().__init__(instructions=get_dynamic_system_prompt(agent_config))
        self._agent_config = agent_config or {}


def prewarm(proc: JobProcess) -> None:
    proc.userdata["vad"] = silero.VAD.load()


# ── Entry point ───────────────────────────────────────────────────────────────

async def entrypoint(ctx: JobContext) -> None:
    ctx.log_context_fields = {"room": ctx.room.name}

    print("🔌 Connecting to LiveKit...")
    await ctx.connect()
    print("✅ Connected")

    print("⏳ Waiting for participant...")
    participant = await ctx.wait_for_participant()
    print(f"👤 Participant: {participant.identity}")

    # Load config from participant metadata
    user_config: Optional[dict] = None
    if participant.metadata:
        try:
            user_config = json.loads(participant.metadata)
            logger.info(f"User config: {user_config}")
        except Exception as err:
            logger.warning(f"Metadata parse failed: {err}")

    final_config = resolve_final_config(user_config)
    print(f"🌐 Language: {get_language(final_config)} | Voice: {get_voice(final_config)}")

    murf_tts = multilingual_tts_service.create_tts_instance(final_config)

    # ── CRITICAL FIX ─────────────────────────────────────────────────────────
    # Deepgram streaming STT does NOT support detect_language=True simultaneously
    # with language="multi". They are mutually exclusive in streaming mode.
    # Solution: use language="multi" WITHOUT detect_language.
    # Language detection is handled by our script/heuristic layer instead,
    # which is more reliable for Hindi/Tamil anyway (Unicode script analysis).
    # ─────────────────────────────────────────────────────────────────────────
    session = AgentSession(
        stt=deepgram.STT(
            model="nova-3",
            language="multi",           # multilingual streaming
            detect_language=False,      # MUST be False with language="multi" in streaming
            interim_results=True,
            smart_format=True,
        ),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf_tts,
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    telemetry   = Telemetry()
    runtime_id  = f"{ctx.room.name}-{uuid4().hex[:8]}"
    current_cfg = final_config.copy()
    last_lang:  Optional[str] = get_language(final_config)
    last_active = int(time.time() * 1000)
    tasks: set[asyncio.Task] = set()

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _track(task: asyncio.Task, name: str) -> None:
        tasks.add(task)
        def _done(t: asyncio.Task) -> None:
            tasks.discard(t)
            # Suppress CancelledError — expected during shutdown
            if t.cancelled():
                return
            with suppress(Exception):
                if (exc := t.exception()):
                    logger.warning(f"Task '{name}': {exc}")
        task.add_done_callback(_done)

    async def _publish(topic: str, payload: dict) -> None:
        try:
            lp = getattr(ctx.room, "local_participant", None)
            if lp:
                await lp.publish_data(json.dumps(payload), topic=topic, reliable=True)
        except Exception as err:
            logger.debug(f"publish {topic}: {err}")

    def _pub(topic: str, payload: dict) -> None:
        _track(asyncio.create_task(_publish(topic, payload)), f"pub:{topic}")

    def _phase(phase: str, intent: Optional[str] = None) -> None:
        _pub("voca.session", {
            "session_id": runtime_id,
            "phase": phase,
            "intent": intent,
            "timestamp_ms": int(time.time() * 1000),
        })

    def _chat(role: str, message: str) -> None:
        if message:
            _pub("voca.chat", {
                "id": uuid4().hex,
                "role": role,
                "message": message,
                "timestamp_ms": int(time.time() * 1000),
            })

    # ── Metrics ───────────────────────────────────────────────────────────────

    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics(ev: MetricsCollectedEvent) -> None:
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)
        _pub("voca.metrics", telemetry.snapshot())

    # ── Phase publishing ──────────────────────────────────────────────────────

    @session.on("agent_state_changed")
    def _on_state(ev: AgentStateChangedEvent) -> None:
        _phase(
            {"listening": "listening", "thinking": "reasoning", "speaking": "speaking"}.get(
                str(ev.new_state), "idle"
            )
        )

    # ── Barge-in interruption ─────────────────────────────────────────────────

    latest_handle = None
    is_speaking   = False

    @session.on("speech_created")
    def _on_speech(ev: SpeechCreatedEvent) -> None:
        nonlocal latest_handle
        latest_handle = ev.speech_handle

    @session.on("agent_state_changed")
    def _track_speaking(ev: AgentStateChangedEvent) -> None:
        nonlocal is_speaking
        is_speaking = ev.new_state == "speaking"

    @session.on("user_state_changed")
    def _on_user_state(ev: UserStateChangedEvent) -> None:
        nonlocal is_speaking
        if ev.new_state == "speaking" and is_speaking and latest_handle:
            with suppress(Exception):
                latest_handle.interrupt(force=True)
            is_speaking = False
            _phase("listening", "interrupt")

    # ── Transcript → language detection + config switch ───────────────────────

    @session.on("user_input_transcribed")
    def _on_transcript(ev: UserInputTranscribedEvent) -> None:
        nonlocal last_lang, last_active, current_cfg

        text = (ev.transcript or "").strip()
        if not text:
            return

        last_active = int(time.time() * 1000)

        # Only act on final transcripts — ignore partials
        if not bool(getattr(ev, "is_final", True)):
            _phase("listening", "partial")
            return

        _chat("user", text)
        _phase("reasoning", "transcript")

        # Language resolution — script/heuristic takes priority over STT
        # (deepgram_lang will be None since detect_language=False)
        dg_lang  = getattr(ev, "language", None)
        resolved = _resolve_language(text, dg_lang, last_lang)

        logger.info(
            f"text='{text[:50]}' | script={_script_detect(text)} "
            f"| resolved={resolved} | prev={last_lang}"
        )

        if resolved != get_language(current_cfg) and resolved in SUPPORTED_LANGUAGES:
            logger.info(f"🌐 {get_language(current_cfg)} → {resolved}")
            last_lang   = resolved
            current_cfg = resolve_final_config(user_config, resolved)

            # Swap TTS voice for new language
            new_tts = multilingual_tts_service.update_tts_for_language(resolved, current_cfg)
            if new_tts:
                for attr in ("_tts", "tts"):
                    try:
                        object.__setattr__(session, attr, new_tts)
                        logger.info(f"🔊 TTS → {get_voice(current_cfg)}")
                        break
                    except Exception:
                        continue

            # Update LLM system instructions for new language
            with suppress(Exception):
                session.update_instructions(get_dynamic_system_prompt(current_cfg))
                logger.info(f"📝 Prompt → {resolved}")
        else:
            last_lang = resolved

    # ── Start ────────────────────────────────────────────────────────────────

    print("🚀 Starting AgentSession...")
    await session.start(
        agent=Assistant(final_config),
        room=ctx.room,
        room_input_options=RoomInputOptions(noise_cancellation=noise_cancellation.BVC()),
    )
    print("✅ Agent live — listening")
    _phase("listening", "connected")

    # ── Keepalive ─────────────────────────────────────────────────────────────

    KEEPALIVE = {
        "en": "Still there? I'm here whenever you're ready.",
        "hi": "क्या आप अभी भी यहाँ हैं? मैं यहाँ हूँ।",
        "ta": "நீங்கள் இன்னும் இங்கே இருக்கிறீர்களா? நான் இங்கே இருக்கிறேன்.",
        "es": "¿Sigues ahí? Aquí estoy cuando estés listo.",
        "fr": "Vous êtes toujours là ? Je suis disponible.",
        "de": "Sind Sie noch da? Ich bin hier.",
        "ja": "まだそこにいますか？",
        "ko": "아직 거기 계세요?",
        "zh": "您还在吗？",
        "ar": "هل لا تزال هناك؟",
    }

    async def _keepalive() -> None:
        try:
            while True:
                await asyncio.sleep(30)
                if int(time.time() * 1000) - last_active >= 60_000:
                    lang = get_language(current_cfg)
                    msg  = KEEPALIVE.get(lang, KEEPALIVE["en"])
                    logger.info(f"Sending keepalive ({lang})")
                    _phase("speaking", "keepalive")
                    with suppress(Exception):
                        await session.say(msg, allow_interruptions=True)
                    _phase("listening", "keepalive")
        except asyncio.CancelledError:
            pass  # expected on shutdown — suppress cleanly

    ka = asyncio.create_task(_keepalive())
    _track(ka, "keepalive")

    # ── Shutdown ──────────────────────────────────────────────────────────────

    async def _shutdown() -> None:
        ka.cancel()
        with suppress(asyncio.CancelledError, Exception):
            await ka
        pending = [t for t in list(tasks) if not t.done()]
        for t in pending:
            t.cancel()
        if pending:
            await asyncio.gather(*pending, return_exceptions=True)

    ctx.add_shutdown_callback(_shutdown)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
