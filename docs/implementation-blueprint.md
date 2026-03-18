# Voca Implementation Blueprint (Production Upgrade)

This blueprint upgrades Voca from a good starter architecture into a production-grade, demo-reliable, hackathon-winning voice receptionist system.

## 0) Build Principles

- Keep backend entrypoint as backend/src/agent.py and wire new modules from there.
- Keep voice-first UX: no task should require typing in the happy path.
- Prefer deterministic/rule-first logic before LLM calls to save latency and quota.
- No dead-air: the system must always produce audible progress feedback.
- Every milestone ships with acceptance tests.
- Demo mode must be deterministic and reproducible.

## 1) Target Module Plan (Expanded)

### 1.1 Backend files to create

Create these files under backend/src/voca:

- backend/src/voca/__init__.py
- backend/src/voca/config.py
- backend/src/voca/domain/enums.py
- backend/src/voca/domain/models.py
- backend/src/voca/domain/events.py
- backend/src/voca/domain/state_store.py
- backend/src/voca/orchestration/context_memory.py
- backend/src/voca/orchestration/experience_controller.py
- backend/src/voca/orchestration/intent_router.py
- backend/src/voca/orchestration/slot_filler.py
- backend/src/voca/orchestration/policy_engine.py
- backend/src/voca/orchestration/response_composer.py
- backend/src/voca/orchestration/turn_manager.py
- backend/src/voca/orchestration/session_orchestrator.py
- backend/src/voca/services/budget_manager.py
- backend/src/voca/services/cache.py
- backend/src/voca/services/fallbacks.py
- backend/src/voca/services/telemetry.py
- backend/src/voca/demo/scenario_engine.py
- backend/src/voca/prompts/system_prompt.py
- backend/src/voca/prompts/intent_prompts.py
- backend/src/voca/api/contracts.py
- backend/src/voca/api/errors.py

Create these backend test files:

- backend/tests/test_context_memory.py
- backend/tests/test_experience_controller.py
- backend/tests/test_intent_router.py
- backend/tests/test_slot_filler.py
- backend/tests/test_policy_engine.py
- backend/tests/test_budget_manager.py
- backend/tests/test_response_composer.py
- backend/tests/test_session_orchestrator.py
- backend/tests/test_voice_interruptions.py
- backend/tests/test_multilingual_switching.py
- backend/tests/test_timeout_and_recovery.py
- backend/tests/test_scenario_engine.py
- backend/tests/test_queue_simulation.py
- backend/tests/test_partial_stt_early_response.py

### 1.2 Backend files to modify

- backend/src/agent.py
  - Replace generic assistant instruction with receptionist system prompt.
  - Instantiate SessionOrchestrator and ExperienceController.
  - Keep existing STT, Gemini LLM, Murf TTS plumbing.
  - Hook metrics into Telemetry and BudgetManager.
  - Enable early-response and interruption preemption events.

- backend/pyproject.toml
  - Keep current dependencies first.
  - Optional: add pydantic only if strict runtime validation is required.

### 1.3 Frontend files to create

Create these files under frontend:

- frontend/lib/contracts.ts
- frontend/lib/session-state.ts
- frontend/lib/telemetry.ts
- frontend/hooks/useVoiceSessionState.ts
- frontend/hooks/useConnectionHealth.ts
- frontend/hooks/useLiveMetrics.ts
- frontend/components/app/voice-status-pill.tsx
- frontend/components/app/latency-debug-panel.tsx
- frontend/components/app/budget-indicator.tsx
- frontend/components/app/interrupt-hint.tsx
- frontend/components/app/demo-scenario-panel.tsx
- frontend/components/app/live-metrics-panel.tsx

Create these frontend tests:

- frontend/components/app/__tests__/voice-status-pill.test.tsx
- frontend/components/app/__tests__/live-metrics-panel.test.tsx
- frontend/hooks/__tests__/useVoiceSessionState.test.ts
- frontend/hooks/__tests__/useConnectionHealth.test.ts
- frontend/hooks/__tests__/useLiveMetrics.test.ts

### 1.4 Frontend files to modify

- frontend/app-config.ts
  - Brand and copy for Voca receptionist.
  - Disable non-essential video features for voice-first demo.

- frontend/components/app/session-view.tsx
  - Add explicit listening/thinking/speaking states.
  - Add budget, queue, and live metrics indicators.
  - Add interruption hint and dead-air indicator.

- frontend/components/app/welcome-view.tsx
  - Replace generic copy with domain-specific receptionist framing.

- frontend/components/app/tile-layout.tsx
  - Prioritize voice status and transcript over camera tiles.

- frontend/hooks/useRoom.ts
  - Add health event wiring and reconnect-safe callbacks.
  - Surface queue position and restored-session state.

## 2) Mandatory Capability Upgrades Mapped to Modules

### 2.1 Context memory layer

- File: backend/src/voca/orchestration/context_memory.py
- Responsibilities:
  - Maintain rolling conversation summary.
  - Persist user_profile fields such as name, language, preference, visit_reason.
  - Generate contextual reminders for response composition.

### 2.2 Experience controller

- File: backend/src/voca/orchestration/experience_controller.py
- Responsibilities:
  - Decide response timing strategy.
  - Pick tone: calm, friendly, urgent.
  - Trigger dead-air fillers and recovery paths.
  - Coordinate interruption handling with high priority.

### 2.3 Early response mode with partial STT

- File to modify: backend/src/voca/orchestration/turn_manager.py
- Constants:
  - EARLY_RESPONSE_MODE = True
  - PARTIAL_STT_CONFIDENCE_THRESHOLD = 0.72
  - INTERRUPT_PRIORITY = "high"
- Behavior:
  - Start intent and response planning on partial transcripts when threshold is met.
  - Finalize once the final transcript arrives.

### 2.4 Dead-air protection

- File to modify: backend/src/voca/services/fallbacks.py
- Add:
  - FALLBACK_FILLERS = ["Just a moment...", "Let me check that for you...", "One second please..."]
- Behavior:
  - If response delay > 800ms, emit filler speech immediately while real response continues processing.

### 2.5 Concurrency simulation layer

- File to modify: backend/src/voca/orchestration/policy_engine.py
- SessionState addition:
  - queue_position: Optional[int]
- Behavior:
  - If active session count exceeds 2, assign queue position and output spoken queue update.

### 2.6 Scenario engine (deterministic demo control)

- File: backend/src/voca/demo/scenario_engine.py
- Scenarios:
  - normal_booking
  - user_interruption
  - multilingual_conversation
  - failure_recovery
- Behavior:
  - Override random choices and drive deterministic scripted flows in demo mode.

### 2.7 Intent router fast path

- File to modify: backend/src/voca/orchestration/intent_router.py
- Rule:
  - if confidence > 0.85: skip LLM.
- Outcome:
  - Lower latency and reduced Gemini usage.

### 2.8 Smart suggestion engine

- File to modify: backend/src/voca/orchestration/policy_engine.py
- Behavior:
  - If input is vague or user is silent, proactively suggest next best action in natural receptionist phrasing.

### 2.9 Emotional voice control

- File to modify: backend/src/voca/orchestration/response_composer.py
- Add tone model:
  - calm | friendly | urgent
- Behavior:
  - Change utterance length, structure, and wording by tone.
  - Pass pacing/style hints suitable for Murf Falcon expressive output.

### 2.10 Real-time metrics

- Files:
  - backend/src/voca/services/telemetry.py
  - frontend/hooks/useLiveMetrics.ts
  - frontend/components/app/live-metrics-panel.tsx
- Expose and render:
  - avg_response_latency
  - intent_success_rate
  - budget_usage_percentage

### 2.11 Budget-aware response modes

- Files to modify:
  - backend/src/voca/services/budget_manager.py
  - backend/src/voca/orchestration/response_composer.py
- Modes:
  - NORMAL
  - NEAR_LIMIT
  - HARD_LIMIT
- Behavior:
  - NEAR_LIMIT compresses responses.
  - HARD_LIMIT enforces minimal output only.

### 2.12 Interrupt handling

- File to modify: backend/src/voca/orchestration/turn_manager.py
- Behavior:
  - If user speaks while TTS is playing, immediately stop TTS and process new turn.

### 2.13 Multilingual mixed-segment handling

- File to modify: backend/src/voca/orchestration/response_composer.py
- Behavior:
  - Generate segmented language output while preserving entities.
  - Example format: [("Hello", "en"), ("kal 5 baje", "hi")].

### 2.14 WebSocket resilience

- File to modify: backend/src/voca/orchestration/session_orchestrator.py
- Behavior:
  - Track inactivity and emit keepalive prompt before 3-minute timeout.
  - Restore session state after disconnect/reconnect.

### 2.15 Demo reliability mode

- Config additions:
  - DEMO_MODE = True
- Behavior:
  - Deterministic responses and guaranteed scenario paths.

## 3) Interface Contracts (Upgraded)

Use TypedDict and dataclass contracts in Python to avoid extra dependency pressure.

### 3.1 Backend contract definitions

backend/src/voca/api/contracts.py:

    from dataclasses import dataclass, field
    from enum import Enum
    from typing import Dict, List, Literal, Optional, TypedDict

    class Intent(str, Enum):
        NEW_APPOINTMENT = "new_appointment"
        RESCHEDULE = "reschedule"
        CANCEL = "cancel"
        PRICING_INFO = "pricing_info"
        HOURS_LOCATION = "hours_location"
        URGENT_TRIAGE = "urgent_triage"
        HUMAN_HANDOFF = "human_handoff"
        UNKNOWN = "unknown"

    class RouteAction(str, Enum):
        RESOLVE = "resolve"
        CLARIFY = "clarify"
        ESCALATE = "escalate"

    class Tone(str, Enum):
        CALM = "calm"
        FRIENDLY = "friendly"
        URGENT = "urgent"

    class BudgetMode(str, Enum):
        NORMAL = "normal"
        NEAR_LIMIT = "near_limit"
        HARD_LIMIT = "hard_limit"

    class LanguageSegment(TypedDict):
        text: str
        lang: str

    class TurnInput(TypedDict):
        session_id: str
        user_text: str
        language_hint: Optional[str]
        partial: bool
        partial_confidence: Optional[float]
        timestamp_ms: int

    class SlotMap(TypedDict, total=False):
        date: str
        time: str
        person_name: str
        phone: str
        service_type: str
        urgency_level: str

    class TurnOutput(TypedDict):
        session_id: str
        intent: str
        intent_confidence: float
        route_action: str
        tone: str
        missing_slots: List[str]
        speech_text: str
        language_segments: List[LanguageSegment]
        escalation_required: bool
        queue_position: Optional[int]
        dead_air_filler_used: bool
        telemetry_tags: Dict[str, str]

    @dataclass
    class UsageBudget:
        stt_seconds_used: float = 0.0
        tts_seconds_used: float = 0.0
        char_used: int = 0
        active_sessions: int = 0
        mode: str = "normal"

    @dataclass
    class SessionState:
        session_id: str
        language: str = "en"
        current_intent: str = "unknown"
        intent_confidence: float = 0.0
        slots: Dict[str, str] = field(default_factory=dict)
        pending_questions: List[str] = field(default_factory=list)
        last_agent_message: str = ""
        conversation_summary: str = ""
        user_profile: Dict[str, str] = field(default_factory=dict)
        queue_position: Optional[int] = None
        turn_count: int = 0
        restored_after_disconnect: bool = False
        phase: Literal[
            "idle", "listening", "reasoning", "speaking",
            "awaiting_confirmation", "escalated", "ended"
        ] = "idle"

### 3.2 Frontend contract definitions

frontend/lib/contracts.ts:

    export type VoicePhase =
      | "idle"
      | "listening"
      | "reasoning"
      | "speaking"
      | "awaiting_confirmation"
      | "escalated"
      | "ended";

    export type BudgetMode = "normal" | "near_limit" | "hard_limit";

    export interface BudgetSnapshot {
      sttSecondsUsed: number;
      ttsSecondsUsed: number;
      charUsed: number;
      activeSessions: number;
      mode: BudgetMode;
      budgetUsagePercentage: number;
    }

    export interface LiveMetrics {
      avgResponseLatencyMs: number;
      intentSuccessRate: number;
      budgetUsagePercentage: number;
    }

    export interface SessionTelemetryEvent {
      type:
        | "turn_started"
        | "intent_decided"
        | "response_generated"
        | "response_spoken"
        | "filler_spoken"
        | "session_restored"
        | "session_closed"
        | "fallback_triggered";
      sessionId: string;
      timestampMs: number;
      payload?: Record<string, string | number | boolean>;
    }

## 4) State Schemas (Upgraded)

### 4.1 Session aggregate schema

Single source of truth for each room/session:

- session_id: string
- phase: enum idle/listening/reasoning/speaking/awaiting_confirmation/escalated/ended
- language: string
- conversation_summary: string
- user_profile: object map
- intent:
  - name: enum
  - confidence: float 0..1
- slots: object map
- missing_slots: string[]
- queue:
  - escalation_required: boolean
  - queue_position: number optional
- budget:
  - stt_seconds_used: number
  - tts_seconds_used: number
  - char_used: number
  - mode: normal | near_limit | hard_limit
- health:
  - last_activity_ms: number
  - ws_keepalive_sent_ms: number
  - reconnect_count: number
  - restored_after_disconnect: boolean

### 4.2 Event schema

Every significant action emits an event:

- event_id: string
- session_id: string
- type: turn_started | intent_decided | response_generated | response_spoken | filler_spoken | fallback_triggered | timeout_warning | keepalive_prompted | session_restored | session_closed
- ts_ms: number
- latency_ms: number optional
- tags: object

### 4.3 Intent schema

Per turn classifier output:

- intent: enum
- confidence: number
- skip_llm: boolean
- extracted_slots: object
- disambiguation_question: string optional
- policy_hint: resolve | clarify | escalate

## 5) Milestones with Acceptance Tests (Reworked)

## Milestone 1: Foundation, Contracts, and Memory

Deliverables:

- Create core domain models and typed contracts.
- Add SessionState fields: conversation_summary, user_profile, queue_position.
- Implement context_memory.py and wire into session_orchestrator.py.

Acceptance tests:

- backend/tests/test_context_memory.py
  - updates conversation_summary across turns
  - stores and retrieves user_profile values
  - response references prior conversation fact

- backend/tests/test_session_orchestrator.py
  - creates state on first turn
  - increments turn_count correctly
  - transitions idle -> listening -> reasoning -> speaking

Pass condition:

- Memory persists and is used in at least one contextual response path.

## Milestone 2: Experience Controller and Intent Efficiency

Deliverables:

- Implement experience_controller.py as decision layer above policy_engine.py.
- Upgrade intent_router.py with fast path and skip-LLM branch when confidence > 0.85.
- Keep slot_filler.py and policy_engine.py deterministic-first.

Acceptance tests:

- backend/tests/test_experience_controller.py
  - selects tone based on urgency/context
  - triggers fallback strategy for delayed responses

- backend/tests/test_intent_router.py
  - obvious intents use fast path without LLM
  - ambiguous input calls LLM fallback

- backend/tests/test_policy_engine.py
  - high confidence + complete slots => resolve
  - medium confidence => clarify
  - urgent triage or human handoff => escalate

Pass condition:

- Intent routing accuracy remains high with reduced LLM calls in deterministic cases.

## Milestone 3: Early Response, Interruptions, and Multilingual

Deliverables:

- Enable EARLY_RESPONSE_MODE in turn_manager.py with partial STT trigger.
- Add immediate interruption preemption with high priority.
- Upgrade response_composer.py for multilingual segmented output and tone-aware phrasing.

Acceptance tests:

- backend/tests/test_partial_stt_early_response.py
  - triggers plan generation on partial transcript above threshold
  - improves time-to-first-token path

- backend/tests/test_voice_interruptions.py
  - user speech during TTS stops playback immediately
  - new input is prioritized and processed

- backend/tests/test_multilingual_switching.py
  - mixed-language input produces segmented output
  - entities are preserved across language switches

Pass condition:

- System responds quickly, supports barge-in cleanly, and handles multilingual mixed turns.

## Milestone 4: No Dead-Air + Budget Modes + Queue Simulation

Deliverables:

- Add dead-air fillers in fallbacks.py and trigger when delay > 800ms.
- Add budget modes NORMAL/NEAR_LIMIT/HARD_LIMIT in budget_manager.py.
- Add queue simulation voice output in policy_engine.py for concurrency cap.
- Add smart suggestions when user is vague/silent.

Acceptance tests:

- backend/tests/test_timeout_and_recovery.py
  - delayed response emits filler then final response
  - STT/LLM/TTS failures use graceful fallback path

- backend/tests/test_budget_manager.py
  - near-limit mode activates at threshold
  - hard-limit mode enforces minimal response behavior

- backend/tests/test_queue_simulation.py
  - overload assigns queue_position
  - spoken output includes queue status

Pass condition:

- No silent failure and user always receives immediate audible feedback.

## Milestone 5: WebSocket Resilience + Metrics + Demo Scenario Engine

Deliverables:

- Add inactivity tracking and pre-timeout keepalive prompts in session_orchestrator.py.
- Restore session state after reconnect.
- Implement demo/scenario_engine.py and deterministic scenario playback.
- Extend telemetry and frontend live metrics panel.

Acceptance tests:

- backend/tests/test_timeout_and_recovery.py
  - keepalive prompt sent before timeout
  - state restored after reconnect event

- backend/tests/test_scenario_engine.py
  - each scenario follows deterministic scripted turn order
  - randomness disabled in demo mode

- frontend/hooks/__tests__/useLiveMetrics.test.ts
  - computes live rolling averages and intent success rate

Pass condition:

- Deterministic demo runs with visible metrics and reconnect resilience.

## Milestone 6: End-to-End Demo Reliability Mode

Deliverables:

- Add DEMO_MODE in config and enforce deterministic outputs globally.
- Final integration wiring in backend/src/agent.py and frontend session UI.
- Add operator checklist docs/demo-checklist.md.

Acceptance tests:

- backend/tests/test_session_orchestrator.py
  - end-to-end: intake -> classify -> clarify -> resolve with memory callback

- backend/tests/test_timeout_and_recovery.py
  - websocket idle warning then keepalive, reconnect, and successful continuation

- Manual demo checklist artifact in docs/demo-checklist.md
  - microphone permissions
  - API keys loaded
  - budget remaining
  - two-session concurrency behavior verified
  - deterministic scenario mode enabled

Pass condition:

- Two full demo runs complete without dead-air failures, broken transitions, or nondeterministic divergence.

## 6) Wiring Plan in Existing Entrypoints

backend/src/agent.py wiring target:

- Keep existing LiveKit plugin setup for STT/LLM/TTS.
- Instantiate SessionOrchestrator, ContextMemory, ExperienceController, BudgetManager, Telemetry.
- On transcript turn event:
  - build TurnInput
  - pass partial transcript to TurnManager for early planning
  - call orchestrator.handle_turn
  - stream speech_text through Murf TTS as soon as available
  - emit telemetry events
- On response delays > 800ms:
  - emit dead-air filler from fallbacks service while main response continues
- On metrics event:
  - update BudgetManager and Telemetry aggregates
- On inactivity:
  - trigger keepalive prompt before timeout
  - restore session state on reconnect

frontend integration target:

- SessionProvider remains root provider.
- useVoiceSessionState consumes room and telemetry events.
- useLiveMetrics subscribes to telemetry stream and updates panel.
- SessionView renders:
  - VoiceStatusPill
  - BudgetIndicator
  - LiveMetricsPanel
  - InterruptHint while speaking
  - queue position when overloaded
  - optional LatencyDebugPanel in development

## 7) Config and Runtime Flags

Hard limits represented in backend/src/voca/config.py:

- TTS_MAX_SECONDS = 600
- STT_MAX_SECONDS = 600
- API_CHAR_BUDGET = 100000
- MAX_CONCURRENT_SESSIONS = 2
- WS_IDLE_TIMEOUT_SECONDS = 180
- RATE_LIMIT_RPM = 1000

New runtime flags:

- EARLY_RESPONSE_MODE = True
- PARTIAL_STT_CONFIDENCE_THRESHOLD = 0.72
- DEAD_AIR_THRESHOLD_MS = 800
- INTERRUPT_PRIORITY = "high"
- DEMO_MODE = True

Enforcement points:

- BudgetManager checks before each LLM and TTS call.
- ResponseComposer switches strategy by budget mode.
- PolicyEngine manages queue simulation and proactive suggestions.
- ScenarioEngine enforces deterministic behavior in demo mode.

## 8) Definition of Done for Repo

- New modules and tests exist at listed paths.
- backend/src/agent.py uses orchestrator + context memory + experience controller.
- Frontend shows explicit voice phases, queue state, and live metrics.
- System has dead-air protection and interruption preemption.
- Tests pass:
  - backend: uv run pytest
  - frontend: project test command configured and passing
- Demo checklist exists and can be executed end-to-end.

## 9) Suggested Build Order in Branches

- branch 1: contracts-memory-state
- branch 2: experience-intent-policy
- branch 3: early-response-interrupt-multilingual
- branch 4: dead-air-budget-queue
- branch 5: websocket-resilience-metrics-demo-engine
- branch 6: demo-reliability-final-integration

Each branch merges only with green milestone tests.