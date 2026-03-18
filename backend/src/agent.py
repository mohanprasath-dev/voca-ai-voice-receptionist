import logging
import json
import time
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
    tokenize,
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
        tts=murf.TTS(
                voice="en-US-matthew", 
                style="Conversation",
                tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
                text_pacing=True
            ),
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
    budget_manager = BudgetManager()
    telemetry = Telemetry()
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

    def _publish_data(topic: str, payload: dict[str, Any]) -> None:
        try:
            participant = getattr(ctx.room, "local_participant", None)
            if participant is None:
                return
            participant.publish_data(payload=json.dumps(payload), topic=topic, reliable=True)
        except Exception as publish_error:
            logger.debug("Failed to publish data message", extra={"topic": topic, "error": str(publish_error)})

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
                (budget_manager.usage().stt_seconds_used / 600) * 100,
                (budget_manager.usage().tts_seconds_used / 600) * 100,
                (budget_manager.usage().char_used / 100000) * 100,
            )
        )
        _publish_data("voca.metrics", telemetry.snapshot())

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
                latest_speech_handle.interrupt(force=True)
                is_agent_speaking = False
                logger.info("Interrupted active speech due to user barge-in")
            except Exception as interruption_error:
                logger.debug("Speech interruption failed", extra={"error": str(interruption_error)})

    @session.on("user_input_transcribed")
    def _handle_transcript_event(ev: UserInputTranscribedEvent) -> None:
        nonlocal is_agent_speaking
        user_text = ev.transcript.strip()
        if not user_text:
            return

        is_partial = not ev.is_final
        partial_confidence = turn_manager._config.partial_stt_confidence_threshold if is_partial else None

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
        started = time.perf_counter()
        output = session_orchestrator.handle_turn(turn_input)
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        telemetry.record_response_latency(elapsed_ms)
        telemetry.record_intent_result(output["intent"] != "unknown")
        is_agent_speaking = True

        _publish_data(
            "voca.session",
            {
                "queue_position": output.get("queue_position"),
                "restored_after_disconnect": False,
                "phase": output["telemetry_tags"].get("phase"),
                "intent": output["intent"],
            },
        )

        logger.info(
            "Orchestrated turn",
            extra={
                "session_id": runtime_session_id,
                "intent": output["intent"],
                "route_action": output["route_action"],
                "tone": output["tone"],
            },
        )

    async def log_usage():
        summary = usage_collector.get_summary()
        logger.info(f"Usage: {summary}")
        logger.info(f"Realtime metrics: {telemetry.snapshot()}")

    ctx.add_shutdown_callback(log_usage)

    async def keepalive_probe() -> None:
        now_ms = int(time.time() * 1000)
        prompt = session_orchestrator.keepalive_prompt(runtime_session_id, now_ms)
        if prompt:
            logger.info("Keepalive prompt", extra={"session_id": runtime_session_id, "prompt": prompt})
            _publish_data(
                "voca.session",
                {
                    "queue_position": None,
                    "restored_after_disconnect": False,
                    "phase": "listening",
                    "intent": "keepalive",
                },
            )

    ctx.add_shutdown_callback(keepalive_probe)

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


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
