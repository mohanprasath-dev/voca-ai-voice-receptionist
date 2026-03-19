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
    # function_tool,
    # RunContext
    WorkerOptions,
    cli,
    metrics,
)
from livekit.agents.llm import ChatContext
from livekit.plugins import deepgram, google, noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from voca.api.contracts import TurnInput
from voca.app_config import DEFAULT_CONFIG
from voca.config.multilingual_config import (
    SUPPORTED_LANGUAGES,
    get_language,
    get_role,
    get_voice,
    resolve_final_config,
)
from voca.orchestration.context_memory import ContextMemory
from voca.orchestration.experience_controller import ExperienceController
from voca.orchestration.session_orchestrator import SessionOrchestrator
from voca.orchestration.turn_manager import TurnManager
from voca.prompts.system_prompt import get_dynamic_system_prompt
from voca.services.budget_manager import BudgetManager
from voca.services.enhanced_fallbacks import enhanced_fallback_service
from voca.services.humanized_tts import HumanizedTTSStreamer
from voca.services.multilingual_tts import multilingual_tts_service
from voca.services.telemetry import Telemetry

logger = logging.getLogger("agent")

load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(self, agent_config: Optional[dict] = None) -> None:
        # Use dynamic system prompt based on configuration
        system_prompt = get_dynamic_system_prompt(agent_config)
        super().__init__(
            instructions=system_prompt,
        )
        self._agent_config = agent_config or {}

    # To add tools, use the @function_tool decorator.
    # Here's an example that adds a simple weather tool.
    # You also have to add `from livekit.agents import function_tool, RunContext` to the top of this file
    # @function_tool
    # async def lookup_weather(self, context: RunContext, location: str):
    #     """Use this tool to look up current weather information in the given location.
    #
    #     If the location is not supported by the weather service, the tool will indicate this. You must tell the user the location's weather is unavailable.
    #
    #     Args:
    #         location: The location to look up weather information for (e.g. city name)
    #     """
    #
    #     logger.info(f"Looking up weather for {location}")
    #
    #     return "sunny with a temperature of 70 degrees."


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


def _usage_value(source: Any, candidates: list[str]) -> float:
    for key in candidates:
        if isinstance(source, dict) and key in source:
            try:
                return float(source[key])
            except (TypeError, ValueError):
                continue
        value = getattr(source, key, None)
        if value is not None:
            try:
                return float(value)
            except (TypeError, ValueError):
                continue
    return 0.0


def _extract_transcript_text(*args: Any, **kwargs: Any) -> str:
    candidate_keys = [
        "text",
        "transcript",
        "user_text",
        "message",
        "content",
    ]

    for key in candidate_keys:
        value = kwargs.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()

    for arg in args:
        if isinstance(arg, str) and arg.strip():
            return arg.strip()
        for key in candidate_keys:
            value = getattr(arg, key, None)
            if isinstance(value, str) and value.strip():
                return value.strip()
    return ""


def _extract_partial_confidence(*args: Any, **kwargs: Any) -> tuple[bool, Optional[float]]:
    is_partial = bool(kwargs.get("partial", False))
    confidence = kwargs.get("confidence") or kwargs.get("partial_confidence")

    for arg in args:
        partial_value = getattr(arg, "partial", None)
        if isinstance(partial_value, bool):
            is_partial = partial_value
        for key in ("confidence", "partial_confidence"):
            value = getattr(arg, key, None)
            if isinstance(value, (int, float)):
                confidence = float(value)

    if isinstance(confidence, (int, float)):
        return is_partial, float(confidence)
    return is_partial, None


def _normalize_language(code: Optional[str]) -> Optional[str]:
    if not code:
        return None
    cleaned = str(code).strip()
    if not cleaned:
        return None
    primary = cleaned.split("-")[0].split("_")[0].lower()
    return primary or None


def extract_language(result: Any) -> str:
    """
    Extract detected language from LiveKit transcript events or raw Deepgram results.

    Handles:
    1) result.channel.alternatives[0].languages[0]
    2) result.metadata["language"]
    3) event.language (LiveKit UserInputTranscribedEvent)
    """
    try:
        lang = result.channel.alternatives[0].languages[0]
        normalized = _normalize_language(lang)
        if normalized:
            return normalized
    except Exception:
        pass

    try:
        md = getattr(result, "metadata", None)
        if isinstance(md, dict):
            normalized = _normalize_language(md.get("language"))
            if normalized:
                return normalized
    except Exception:
        pass

    try:
        normalized = _normalize_language(getattr(result, "language", None))
        if normalized:
            return normalized
    except Exception:
        pass

    return "en"


def _script_counts(text: str) -> dict[str, int]:
    counts: dict[str, int] = {"devanagari": 0, "tamil": 0, "arabic": 0, "latin": 0, "other": 0}
    for ch in text:
        o = ord(ch)
        if 0x0900 <= o <= 0x097F:
            counts["devanagari"] += 1
        elif 0x0B80 <= o <= 0x0BFF:
            counts["tamil"] += 1
        elif 0x0600 <= o <= 0x06FF or 0x0750 <= o <= 0x077F or 0x08A0 <= o <= 0x08FF:
            counts["arabic"] += 1
        elif ("A" <= ch <= "Z") or ("a" <= ch <= "z"):
            counts["latin"] += 1
        elif ch.isalpha():
            counts["other"] += 1
    return counts


def _dominant_language_from_text(text: str) -> Optional[str]:
    counts = _script_counts(text)
    lowered = text.lower()
    # Lightweight Hinglish heuristic (Latin script Hindi tokens).
    if any(token in lowered.split() for token in ("namaste", "kal", "aaj", "baje", "kripya", "dhanyavad", "shukriya")):
        return "hi"
    if counts["tamil"] > 0 and counts["tamil"] >= max(counts["devanagari"], counts["arabic"]):
        return "ta"
    if counts["devanagari"] > 0 and counts["devanagari"] >= max(counts["tamil"], counts["arabic"]):
        return "hi"
    if counts["arabic"] > 0 and counts["arabic"] >= max(counts["tamil"], counts["devanagari"]):
        return "ar"
    return None


def _resolve_detected_language(
    transcript: str,
    detected: Optional[str],
    *,
    last_detected_language: Optional[str],
) -> str:
    normalized = _normalize_language(detected) if detected else None

    # If language detection is missing, try to infer from script.
    if not normalized:
        inferred = _dominant_language_from_text(transcript)
        return inferred or (last_detected_language or "en")

    # If Deepgram reports English but we clearly see non-Latin scripts, treat it as a wrong detection.
    inferred = _dominant_language_from_text(transcript)
    if normalized == "en" and inferred and inferred != "en":
        return last_detected_language or inferred

    return normalized


async def entrypoint(ctx: JobContext):
    # Logging setup
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    max_connect_attempts = 3
    base_retry_delay_seconds = 1.0

    # Connect first to ensure room operations are safe.
    for attempt in range(1, max_connect_attempts + 1):
        print("🔌 Connecting to room...")
        logger.info(
            "Connecting to room",
            extra={
                "room_name": ctx.room.name,
                "attempt": attempt,
                "max_attempts": max_connect_attempts,
            },
        )
        try:
            await ctx.connect()
            print("✅ Connected")
            logger.info(
                "Connected to room",
                extra={"room_name": ctx.room.name, "attempt": attempt},
            )
            break
        except Exception as connect_error:
            print(f"❌ Failed to connect: {connect_error}")
            logger.exception(
                "Failed to connect to room",
                extra={
                    "room_name": ctx.room.name,
                    "attempt": attempt,
                    "max_attempts": max_connect_attempts,
                    "error": str(connect_error),
                },
            )
            if attempt == max_connect_attempts:
                raise
            await asyncio.sleep(base_retry_delay_seconds * attempt)

    print("⏳ Waiting for participant...")
    participant = await ctx.wait_for_participant()
    print(f"👤 Participant joined: {participant.identity}")
    logger.info(
        "Participant joined",
        extra={"room_name": ctx.room.name, "participant_identity": participant.identity},
    )

    user_config = None
    if participant.metadata:
        try:
            user_config = json.loads(participant.metadata)
            logger.info(f"Loaded user config from metadata: {user_config}")
        except Exception as e:
            logger.warning(f"Failed to parse participant metadata: {e}")

    # Resolve final configuration with multilingual support
    final_config = resolve_final_config(user_config)

    # Create initial TTS with resolved configuration
    murf_tts = multilingual_tts_service.create_tts_instance(final_config)

    # Set up a voice AI pipeline using OpenAI, Cartesia, AssemblyAI, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) - starting with English, will handle language detection in transcript events
        stt=deepgram.STT(
            model="nova-3",
            # LiveKit's Deepgram streaming wrapper doesn't support server-side language
            # detection. Use Deepgram's multilingual streaming mode instead and resolve
            # per-utterance language in the transcript handler.
            language="multi",
            detect_language=False,
            interim_results=True,
            smart_format=True,
        ),
        # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
        # See all available models at https://docs.livekit.io/agents/models/llm/
        llm=google.LLM(
                model="gemini-2.5-flash",
            ),
        # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts=murf_tts,
        # VAD and turn detection are used to determine when the user is speaking and when the agent should respond
        # See more at https://docs.livekit.io/agents/build/turns
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        # allow the LLM to generate a response while waiting for the end of turn
        # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
        preemptive_generation=True,
    )

    context_memory = ContextMemory()
    experience_controller = ExperienceController()
    turn_manager = TurnManager()
    budget_manager = BudgetManager(DEFAULT_CONFIG)
    telemetry = Telemetry()
    session_orchestrator = SessionOrchestrator(
        memory=context_memory,
        experience=experience_controller,
        budget=budget_manager,
        turn_manager=turn_manager,
    )

    # Store configuration in session orchestrator
    if hasattr(session_orchestrator, 'set_agent_config'):
        session_orchestrator.set_agent_config(final_config)

    # Persist orchestration objects on the process for observability and future extensions.
    ctx.proc.userdata["context_memory"] = context_memory
    ctx.proc.userdata["experience_controller"] = experience_controller
    ctx.proc.userdata["turn_manager"] = turn_manager
    ctx.proc.userdata["budget_manager"] = budget_manager
    ctx.proc.userdata["telemetry"] = telemetry
    ctx.proc.userdata["session_orchestrator"] = session_orchestrator

    runtime_session_id = f"{ctx.room.name}-{uuid4().hex[:8]}"
    is_agent_speaking = False
    latest_speech_handle = None
    keepalive_task: Optional[asyncio.Task[None]] = None
    last_turn_activity_ms = int(time.time() * 1000)
    humanized_tts = HumanizedTTSStreamer(session=session, murf_tts=murf_tts)

    # Multilingual session state
    current_config = final_config.copy()
    detected_language = None
    last_detected_language: Optional[str] = None
    background_tasks: set[asyncio.Task[None]] = set()

    def _track_task(task: asyncio.Task[None], *, name: str) -> None:
        logger.debug("Task created", extra={"task_name": name})
        background_tasks.add(task)

        def _on_done(done_task: asyncio.Task[None]) -> None:
            background_tasks.discard(done_task)
            if done_task.cancelled():
                logger.debug("Task cancelled", extra={"task_name": name})
                return
            with suppress(Exception):
                exc = done_task.exception()
                if exc:
                    logger.warning("Task failed", extra={"task_name": name, "error": str(exc)})

        task.add_done_callback(_on_done)

    async def _cleanup_all_tasks() -> None:
        if background_tasks:
            logger.info("Cleaning up background tasks", extra={"task_count": len(background_tasks)})

        pending = [task for task in list(background_tasks) if not task.done()]
        for task in pending:
            task.cancel()

        if pending:
            await asyncio.gather(*pending, return_exceptions=True)

        background_tasks.clear()
        logger.info("Background task cleanup complete")

        close_coro = getattr(humanized_tts, "aclose", None)
        if callable(close_coro):
            try:
                logger.info("Closing TTS stream")
                await close_coro()
                logger.info("TTS stream closed")
            except Exception as close_err:
                logger.warning("TTS stream close failed", extra={"error": str(close_err)})

    async def _llm_detect_language(transcript: str, *, fallback: str) -> str:
        """
        Best-effort language identification for cases where streaming STT doesn't provide
        per-utterance language (e.g., Latin-script languages like es/fr/de/it/pt).
        Returns an ISO-639-1 primary code that is supported by our config layer.
        """
        cleaned = (transcript or "").strip()
        if not cleaned:
            return fallback

        # If script heuristics already clearly identify a language, keep it.
        inferred = _dominant_language_from_text(cleaned)
        if inferred:
            return inferred

        try:
            chat_ctx = ChatContext.empty()
            chat_ctx.add_message(
                role="system",
                content=(
                    "You are a language identifier.\n"
                    "Return ONLY a single ISO-639-1 language code (examples: en, es, fr, de, it, pt, ru, ja, ko, zh, hi, ta, ar).\n"
                    "No punctuation. No extra text."
                ),
            )
            chat_ctx.add_message(role="user", content=cleaned)

            stream = session.llm.chat(chat_ctx=chat_ctx)
            parts: list[str] = []
            async for chunk in stream:
                delta = getattr(chunk, "delta", None)
                content = getattr(delta, "content", None) if delta else None
                if isinstance(content, str) and content:
                    parts.append(content)
            code = _normalize_language("".join(parts).strip())
            if code and code in SUPPORTED_LANGUAGES:
                logger.info("Language detection succeeded", extra={"detected_language": code})
                return code
            logger.debug("Language detection fallback applied", extra={"raw_code": code, "fallback": fallback})
        except Exception as err:
            logger.warning("LLM language detection failed", extra={"error": str(err), "fallback": fallback})

        return fallback

    async def _rewrite_for_language(
        draft_text: str,
        *,
        transcript: str,
        language: str,
        config: dict,
    ) -> str:
        cleaned = (draft_text or "").strip()
        if not cleaned:
            return cleaned
        if language == "en":
            return cleaned

        system_prompt = get_dynamic_system_prompt(config)
        try:
            chat_ctx = ChatContext.empty()
            chat_ctx.add_message(role="system", content=system_prompt)
            lang_instruction = {
                "hi": (
                    "Rewrite as natural SPOKEN Hindi (Devanagari script). "
                    "Use simple, warm, conversational Hindi. "
                    "Use 'आप' for the user. "
                    "Maximum 2-3 short sentences. "
                    "No English words unless they are proper nouns or technical terms the user used."
                ),
                "ta": (
                    "Rewrite as natural SPOKEN Tamil (Tamil script). "
                    "Use simple, warm, conversational Tamil. "
                    "Maximum 2-3 short sentences. "
                    "No English words unless they are proper nouns or technical terms the user used."
                ),
            }.get(language, (
                f"Rewrite as natural SPOKEN {language}. "
                "Short sentences. Warm and conversational. Maximum 2-3 sentences."
            ))
            chat_ctx.add_message(
                role="user",
                content=(
                    f"{lang_instruction}\n\n"
                    f"User said: {transcript}\n"
                    f"Assistant draft: {cleaned}\n\n"
                    "Output ONLY the rewritten response. No explanation. No quotes."
                ),
            )

            stream = session.llm.chat(chat_ctx=chat_ctx)
            parts: list[str] = []
            async for chunk in stream:
                delta = getattr(chunk, "delta", None)
                content = getattr(delta, "content", None) if delta else None
                if isinstance(content, str) and content:
                    parts.append(content)
            rewritten = "".join(parts).strip()
            return rewritten or cleaned
        except Exception as llm_err:
            logger.warning("LLM rewrite failed; using draft", extra={"error": str(llm_err), "language": language})
            return cleaned

    async def _publish_data(topic: str, payload: dict[str, Any]) -> None:
        try:
            participant = getattr(ctx.room, "local_participant", None)
            if participant is None:
                return
            await participant.publish_data(payload=json.dumps(payload), topic=topic, reliable=True)
        except Exception as publish_error:
            logger.debug("Failed to publish data message", extra={"topic": topic, "error": str(publish_error)})

    def _publish_data_bg(topic: str, payload: dict[str, Any]) -> None:
        task = asyncio.create_task(_publish_data(topic, payload))
        _track_task(task, name=f"publish:{topic}")

    def _publish_phase(phase: str, intent: Optional[str] = None, **extra: Any) -> None:
        payload: dict[str, Any] = {
            "session_id": runtime_session_id,
            "phase": phase,
            "intent": intent,
            "timestamp_ms": int(time.time() * 1000),
        }
        payload.update({k: v for k, v in extra.items() if v is not None})
        _publish_data_bg("voca.session", payload)

    def _get_keepalive_message(language: str) -> str:
        KEEPALIVE_MESSAGES = {
            "en": "Still with me? I'm here whenever you're ready.",
            "hi": "क्या आप अभी भी यहाँ हैं? मैं यहाँ हूँ जब आप तैयार हों।",
            "ta": "நீங்கள் இன்னும் இங்கே இருக்கிறீர்களா? நீங்கள் தயாரானால் நான் இங்கே இருக்கிறேன்.",
            "es": "¿Sigues ahí? Aquí estoy cuando estés listo.",
            "fr": "Vous êtes toujours là? Je suis là quand vous êtes prêt.",
        }
        return KEEPALIVE_MESSAGES.get(language, KEEPALIVE_MESSAGES["en"])

    def _publish_chat(role: str, message: str) -> None:
        if not message:
            return
        _publish_data_bg(
            "voca.chat",
            {
                "id": uuid4().hex,
                "role": role,
                "message": message,
                "timestamp_ms": int(time.time() * 1000),
            },
        )
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    # session = AgentSession(
    #     llm=openai.realtime.RealtimeModel(voice="marin")
    # )

    # Metrics collection, to measure pipeline performance
    # For more information, see https://docs.livekit.io/agents/build/metrics/
    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)
        summary = usage_collector.get_summary()

        stt_seconds = _usage_value(summary, ["stt_audio_duration", "stt_seconds", "stt_duration"])
        tts_seconds = _usage_value(summary, ["tts_audio_duration", "tts_seconds", "tts_duration"])
        llm_chars = _usage_value(summary, ["llm_characters", "llm_chars", "llm_text_characters"])

        budget_manager.record_stt_seconds(stt_seconds)
        budget_manager.record_tts_seconds(tts_seconds)
        budget_manager.record_characters(int(llm_chars))
        telemetry.set_budget_usage_percentage(
            max(
                (budget_manager.usage().stt_seconds_used / DEFAULT_CONFIG.stt_max_seconds) * 100,
                (budget_manager.usage().tts_seconds_used / DEFAULT_CONFIG.tts_max_seconds) * 100,
                (budget_manager.usage().char_used / DEFAULT_CONFIG.api_char_budget) * 100,
            )
        )
        telemetry.set_budget_mode(budget_manager.current_mode())
        _publish_data_bg("voca.metrics", telemetry.snapshot())
        logger.debug(
            "Metrics updated",
            extra={
                "stt_seconds": stt_seconds,
                "tts_seconds": tts_seconds,
                "llm_chars": llm_chars,
                "budget_mode": budget_manager.current_mode(),
            },
        )

    @session.on("speech_created")
    def _on_speech_created(ev: SpeechCreatedEvent) -> None:
        nonlocal latest_speech_handle
        latest_speech_handle = ev.speech_handle

    @session.on("agent_state_changed")
    def _on_agent_state_changed(ev: AgentStateChangedEvent) -> None:
        nonlocal is_agent_speaking
        is_agent_speaking = ev.new_state == "speaking"

    @session.on("user_state_changed")
    def _on_user_state_changed(ev: UserStateChangedEvent) -> None:
        nonlocal is_agent_speaking
        if ev.new_state == "speaking" and is_agent_speaking and latest_speech_handle is not None:
            try:
                humanized_tts.interrupt_current()
                latest_speech_handle.interrupt(force=True)
                is_agent_speaking = False
                logger.info("Interrupted active speech due to user barge-in")
                _publish_phase("listening", intent="interrupt")
            except Exception as interruption_error:
                logger.debug("Speech interruption failed", extra={"error": str(interruption_error)})

    @session.on("user_input_transcribed")
    def _handle_transcript_event(ev: UserInputTranscribedEvent) -> None:
        nonlocal is_agent_speaking
        nonlocal last_turn_activity_ms
        nonlocal last_detected_language

        user_text = (ev.transcript or "").strip()
        if not user_text:
            return

        last_turn_activity_ms = int(time.time() * 1000)

        is_partial = not bool(getattr(ev, "is_final", True))
        is_partial, extracted_confidence = _extract_partial_confidence(ev, partial=is_partial)
        partial_confidence = extracted_confidence

        detected = extract_language(ev)
        resolved_language = _resolve_detected_language(
            user_text,
            detected,
            last_detected_language=last_detected_language,
        )

        if turn_manager.should_interrupt(is_agent_speaking):
            if latest_speech_handle is not None:
                with suppress(Exception):
                    latest_speech_handle.interrupt(force=True)
            is_agent_speaking = False
            logger.info("User interruption detected; prioritizing new turn")

        # For FINAL transcripts only, run a fast best-effort language ID to support
        # Latin-script languages where streaming STT doesn't emit language.
        if not is_partial:
            # We don't block the event loop here; instead, the per-turn pipeline will
            # prefer `last_detected_language` if the detection finishes first.
            async def _update_lang() -> None:
                nonlocal last_detected_language
                last_detected_language = await _llm_detect_language(user_text, fallback=resolved_language)

            task = asyncio.create_task(_update_lang())
            _track_task(task, name="language-detection")
        else:
            last_detected_language = resolved_language

        turn_input: TurnInput = {
            "session_id": runtime_session_id,
            "user_text": user_text,
            "language_hint": ev.language,
            "partial": is_partial,
            "partial_confidence": partial_confidence,
            "timestamp_ms": int(time.time() * 1000),
            "detected_language": resolved_language,
            "language": resolved_language,
        }
        logger.info("Transcript: %s", user_text)
        logger.info("Detected language (pre-turn): %s", resolved_language)
        logger.info(
            "Transcript received",
            extra={
                "room_name": ctx.room.name,
                "session_id": runtime_session_id,
                "partial": is_partial,
                "confidence": partial_confidence,
                "text": user_text,
            },
        )
        logger.info(
            "Budget decision",
            extra={
                "session_id": runtime_session_id,
                "budget_mode": budget_manager.current_mode(),
            },
        )

        if is_partial:
            # Allow the turn manager to observe partials for early planning.
            record_partial = getattr(turn_manager, "record_partial", None)
            if callable(record_partial):
                try:
                    record_partial(turn_input)
                except Exception as err:
                    logger.debug("TurnManager.record_partial failed", extra={"error": str(err)})

            # Only start the full pipeline on partials when early response is warranted.
            if not turn_manager.should_start_early_response(True, partial_confidence):
                _publish_phase("listening", intent="partial")
                return

        _publish_phase("thinking", intent="transcript")

        async def _run_turn_pipeline() -> None:
            nonlocal is_agent_speaking, current_config, detected_language
            response_started = asyncio.Event()

            async def _dead_air_guard() -> None:
                try:
                    await asyncio.wait_for(
                        response_started.wait(),
                        timeout=DEFAULT_CONFIG.dead_air_threshold_ms / 1000,
                    )
                except asyncio.TimeoutError:
                    filler = enhanced_fallback_service.get_filler_message(get_language(current_config))
                    logger.info(
                        "Dead-air filler emitted",
                        extra={"session_id": runtime_session_id, "threshold_ms": DEFAULT_CONFIG.dead_air_threshold_ms},
                    )
                    _publish_phase("speaking", intent="filler")
                    _publish_chat("agent", filler)
                    try:
                        await humanized_tts.say(filler, allow_interruptions=True)
                    except Exception as err:
                        logger.debug("Filler TTS failed", extra={"error": str(err)})

            guard_task = asyncio.create_task(_dead_air_guard())
            started = time.perf_counter()

            try:
                # Extract detected language from transcript event (normalized ISO-639 primary code).
                # Use the latest stable language for this session when possible.
                event_detected_lang = last_detected_language or resolved_language

                # Update configuration if language changed and is supported
                if event_detected_lang and event_detected_lang in SUPPORTED_LANGUAGES:
                    current_lang = get_language(current_config)
                    if event_detected_lang != current_lang:
                        logger.info(f"Language switched from {current_lang} to {event_detected_lang}")
                        detected_language = event_detected_lang

                        # Update configuration
                        updated_config = resolve_final_config(user_config, event_detected_lang)
                        current_config = updated_config

                        # Update TTS if needed
                        new_tts = multilingual_tts_service.update_tts_for_language(event_detected_lang, current_config)
                        if new_tts:
                            await humanized_tts.update_tts(new_tts)

                        # Update agent instructions
                        new_prompt = get_dynamic_system_prompt(current_config)
                        session.update_instructions(new_prompt)
                else:
                    # Log detected language even if not supported
                    if event_detected_lang:
                        logger.debug(f"Detected unsupported language: {event_detected_lang}")
                        # Unsupported language -> fallback to English safely.
                        current_config = resolve_final_config(user_config, "en")
                        session.update_instructions(get_dynamic_system_prompt(current_config))
                        event_detected_lang = "en"
                        detected_language = "en"

                logger.info("LLM language: %s", get_language(current_config))
                logger.info("TTS voice: %s", get_voice(current_config))
                logger.info("Role: %s", get_role(current_config))
                logger.info("Orchestrator triggered", extra={"room_name": ctx.room.name, "session_id": runtime_session_id, "language": get_language(current_config)})
                output = await asyncio.to_thread(session_orchestrator.handle_turn, turn_input)
                elapsed_ms = int((time.perf_counter() - started) * 1000)
                telemetry.record_response_latency(elapsed_ms)
                telemetry.record_intent_result(output["intent"] != "unknown")

                response_started.set()
                logger.info(
                    "Response generated",
                    extra={
                        "session_id": runtime_session_id,
                        "intent": output["intent"],
                        "route_action": output["route_action"],
                        "tone": output["tone"],
                        "language": get_language(current_config),
                        "voice": get_voice(current_config),
                        "latency_ms": elapsed_ms,
                    },
                )

                _publish_data_bg(
                    "voca.session",
                    {
                        "session_id": runtime_session_id,
                        "queue_position": output.get("queue_position"),
                        "restored_after_disconnect": False,
                        "phase": output["telemetry_tags"].get("phase"),
                        "intent": output["intent"],
                        "dead_air_filler_used": output.get("dead_air_filler_used"),
                        "early_response_started": output["telemetry_tags"].get("early_response_started"),
                    },
                )

                speech_text = (output.get("speech_text") or "").strip()
                if not speech_text:
                    logger.error("No speech_text produced; emitting fallback", extra={"room_name": ctx.room.name, "session_id": runtime_session_id})
                    speech_text = enhanced_fallback_service.handle_missing_config(get_language(current_config))

                if budget_manager.current_mode() == "hard_limit":
                    hard_limit_message = {
                        "en": "Sorry, I'm near my limit. Let me quickly help you.",
                        "hi": "माफ़ कीजिए, मैं अपनी सीमा के करीब हूँ। मैं जल्दी से आपकी मदद करती हूँ।",
                        "ta": "மன்னிக்கவும், நான் வரம்பை நெருங்கி உள்ளேன். நான் விரைவாக உதவுகிறேன்.",
                    }
                    target_lang = get_language(current_config)
                    speech_text = hard_limit_message.get(target_lang, hard_limit_message["en"])
                    logger.info(
                        "Hard-limit response fallback applied",
                        extra={"session_id": runtime_session_id},
                    )

                # Ensure the final spoken response matches the detected language
                target_language = get_language(current_config)
                if target_language != "en":
                    rewritten = await _rewrite_for_language(
                        speech_text,
                        transcript=user_text,
                        language=target_language,
                        config=current_config,
                    )
                    speech_text = rewritten or speech_text

                is_agent_speaking = True
                _publish_phase("speaking", intent=output["intent"])
                _publish_chat("agent", speech_text)
                logger.info("TTS started", extra={"room_name": ctx.room.name, "session_id": runtime_session_id, "chars": len(speech_text)})
                try:
                    await humanized_tts.say(speech_text, allow_interruptions=True)
                except Exception as tts_err:
                    logger.warning(
                        "Primary TTS failed; retrying with fallback voice",
                        extra={"error": str(tts_err), "language": get_language(current_config)},
                    )
                    try:
                        fallback_voice = multilingual_tts_service.get_fallback_voice(get_language(current_config))
                        if multilingual_tts_service.validate_voice_id(fallback_voice):
                            retry_tts = murf.TTS(
                                voice=fallback_voice,
                                style="Conversational",
                                speed=-4,
                                pitch=0,
                                text_pacing=True,
                            )
                            await humanized_tts.update_tts(retry_tts)
                        retry_text = enhanced_fallback_service.handle_tts_failure(get_language(current_config))
                        await humanized_tts.say(retry_text, allow_interruptions=True)
                    except Exception:
                        pass
                is_agent_speaking = False
                _publish_phase("listening", intent=output["intent"])
            except Exception as err:
                response_started.set()
                logger.exception("Turn pipeline failed", extra={"room_name": ctx.room.name, "session_id": runtime_session_id, "error": str(err)})
                _publish_phase("speaking", intent="error")
                try:
                    fallback_msg = enhanced_fallback_service.handle_general_error(get_language(current_config))
                    _publish_chat("agent", fallback_msg)
                    await humanized_tts.say(fallback_msg, allow_interruptions=True)
                except Exception:
                    pass
                _publish_phase("listening", intent="error")
            finally:
                guard_task.cancel()
                with suppress(Exception):
                    await guard_task

        task = asyncio.create_task(_run_turn_pipeline())
        _track_task(task, name="turn-pipeline")

    async def log_usage():
        summary = usage_collector.get_summary()
        logger.info(f"Usage: {summary}")
        logger.info(f"Realtime metrics: {telemetry.snapshot()}")

    ctx.add_shutdown_callback(log_usage)

    async def keepalive_loop() -> None:
        while True:
            await asyncio.sleep(10)
            now_ms = int(time.time() * 1000)
            prompt = session_orchestrator.keepalive_prompt(runtime_session_id, now_ms)
            if not prompt:
                continue
            # Use language-aware message
            prompt = _get_keepalive_message(get_language(current_config))
            # Only emit keepalive if there has been no activity recently (avoid spamming while talking).
            if now_ms - last_turn_activity_ms < 30_000:
                continue
            logger.info("Keepalive prompt", extra={"room_name": ctx.room.name, "session_id": runtime_session_id, "prompt": prompt})
            _publish_phase("speaking", intent="keepalive")
            try:
                await humanized_tts.say(prompt, allow_interruptions=True)
            except Exception as err:
                logger.debug("Keepalive TTS failed", extra={"error": str(err)})
            _publish_phase("listening", intent="keepalive")

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(final_config),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            # For telephony applications, use `BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    # Connection has already been established before participant wait.
    _publish_phase("listening", intent="connected")

    keepalive_task = asyncio.create_task(keepalive_loop())
    _track_task(keepalive_task, name="keepalive-loop")

    async def _shutdown_cleanup() -> None:
        try:
            if keepalive_task:
                keepalive_task.cancel()
        finally:
            await _cleanup_all_tasks()

    ctx.add_shutdown_callback(_shutdown_cleanup)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
