import logging
import json
import time
import asyncio
from typing import Any, Optional, Tuple
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
    WorkerOptions,
    cli,
    metrics,
    UserInputTranscribedEvent,
    SpeechCreatedEvent,
    UserStateChangedEvent,
    # function_tool,
    # RunContext
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from voca.api.contracts import TurnInput
from voca.orchestration.context_memory import ContextMemory
from voca.orchestration.experience_controller import ExperienceController
from voca.orchestration.session_orchestrator import SessionOrchestrator
from voca.orchestration.turn_manager import TurnManager
from voca.prompts.system_prompt import VOCA_SYSTEM_PROMPT
from voca.services.budget_manager import BudgetManager
from voca.services.telemetry import Telemetry
from voca.services.fallbacks import FallbackService
from voca.services.humanized_tts import HumanizedTTSStreamer
from voca.config import DEFAULT_CONFIG

logger = logging.getLogger("agent")

load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=VOCA_SYSTEM_PROMPT,
        )

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


def _extract_partial_confidence(*args: Any, **kwargs: Any) -> Tuple[bool, Optional[float]]:
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


async def entrypoint(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    murf_tts = murf.TTS(
        voice="en-US-matthew",
        style="Conversational",
        speed=-8,
        pitch=0,
        text_pacing=True,
    )

    # Set up a voice AI pipeline using OpenAI, Cartesia, AssemblyAI, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        # See all available models at https://docs.livekit.io/agents/models/stt/
        stt=deepgram.STT(model="nova-3"),
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
    fallback_service = FallbackService()
    session_orchestrator = SessionOrchestrator(
        memory=context_memory,
        experience=experience_controller,
        budget=budget_manager,
        turn_manager=turn_manager,
    )

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

    def _publish_data(topic: str, payload: dict[str, Any]) -> None:
        try:
            participant = getattr(ctx.room, "local_participant", None)
            if participant is None:
                return
            participant.publish_data(payload=json.dumps(payload), topic=topic, reliable=True)
        except Exception as publish_error:
            logger.debug("Failed to publish data message", extra={"topic": topic, "error": str(publish_error)})

    def _publish_phase(phase: str, intent: Optional[str] = None, **extra: Any) -> None:
        payload: dict[str, Any] = {
            "session_id": runtime_session_id,
            "phase": phase,
            "intent": intent,
            "timestamp_ms": int(time.time() * 1000),
        }
        payload.update({k: v for k, v in extra.items() if v is not None})
        _publish_data("voca.session", payload)

    def _publish_chat(role: str, message: str) -> None:
        if not message:
            return
        _publish_data(
            "voca.chat",
            {
                "id": uuid4().hex,
                "role": role,
                "message": message,
                "timestamp_ms": int(time.time() * 1000),
            },
        )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
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
        _publish_data("voca.metrics", telemetry.snapshot())
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

        user_text = (ev.transcript or "").strip()
        if not user_text:
            return

        last_turn_activity_ms = int(time.time() * 1000)

        is_partial = not bool(getattr(ev, "is_final", True))
        is_partial, extracted_confidence = _extract_partial_confidence(ev, partial=is_partial)
        partial_confidence = extracted_confidence

        if turn_manager.should_interrupt(is_agent_speaking):
            if latest_speech_handle is not None:
                try:
                    latest_speech_handle.interrupt(force=True)
                except Exception:
                    pass
            is_agent_speaking = False
            logger.info("User interruption detected; prioritizing new turn")

        turn_input: TurnInput = {
            "session_id": runtime_session_id,
            "user_text": user_text,
            "language_hint": ev.language,
            "partial": is_partial,
            "partial_confidence": partial_confidence,
            "timestamp_ms": int(time.time() * 1000),
        }
        logger.info(
            "Transcript received",
            extra={
                "session_id": runtime_session_id,
                "partial": is_partial,
                "confidence": partial_confidence,
                "text": user_text,
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
            nonlocal is_agent_speaking
            response_started = asyncio.Event()

            async def _dead_air_guard() -> None:
                try:
                    await asyncio.wait_for(
                        response_started.wait(),
                        timeout=DEFAULT_CONFIG.dead_air_threshold_ms / 1000,
                    )
                except asyncio.TimeoutError:
                    filler = fallback_service.next_filler() if fallback_service else "Just a moment..."
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
                logger.info("Orchestrator triggered", extra={"session_id": runtime_session_id})
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
                        "latency_ms": elapsed_ms,
                    },
                )

                _publish_data(
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
                    logger.error("No speech_text produced; emitting fallback", extra={"session_id": runtime_session_id})
                    speech_text = "Just a moment..."

                is_agent_speaking = True
                _publish_phase("speaking", intent=output["intent"])
                _publish_chat("agent", speech_text)
                logger.info("TTS started", extra={"session_id": runtime_session_id, "chars": len(speech_text)})
                await humanized_tts.say(speech_text, allow_interruptions=True)
                is_agent_speaking = False
                _publish_phase("listening", intent=output["intent"])
            except Exception as err:
                response_started.set()
                logger.exception("Turn pipeline failed", extra={"session_id": runtime_session_id, "error": str(err)})
                _publish_phase("speaking", intent="error")
                try:
                    _publish_chat("agent", "Sorry—something went wrong. Please try again.")
                    await humanized_tts.say("Sorry—something went wrong. Please try again.", allow_interruptions=True)
                except Exception:
                    pass
                _publish_phase("listening", intent="error")
            finally:
                guard_task.cancel()

        asyncio.create_task(_run_turn_pipeline())

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
            # Only emit keepalive if there has been no activity recently (avoid spamming while talking).
            if now_ms - last_turn_activity_ms < 30_000:
                continue
            logger.info("Keepalive prompt", extra={"session_id": runtime_session_id, "prompt": prompt})
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
        agent=Assistant(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            # For telephony applications, use `BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    # Join the room and connect to the user
    await ctx.connect()
    logger.info("Connected to room", extra={"room": ctx.room.name, "session_id": runtime_session_id})
    _publish_phase("listening", intent="connected")

    keepalive_task = asyncio.create_task(keepalive_loop())

    async def _cancel_keepalive() -> None:
        if keepalive_task:
            keepalive_task.cancel()

    ctx.add_shutdown_callback(_cancel_keepalive)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
