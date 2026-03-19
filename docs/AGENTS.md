# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

VOCA is a real-time voice receptionist built on LiveKit Agents. It layers a custom orchestration engine (intent routing, slot filling, policy, budget management) on top of the LiveKit voice pipeline (Deepgram STT → Gemini LLM → Murf TTS). The frontend is a Next.js 15 app that receives live session and metrics data from the backend over LiveKit data channels.

## Commands

### Backend (`backend/`)

Uses `uv` for all dependency management and execution. Always run from the `backend/` directory or use absolute paths.

```bash
# Install dependencies
uv sync

# Run the agent in dev mode
uv run python src/agent.py dev

# Run all tests
uv run pytest

# Run a single test file
uv run pytest tests/test_session_orchestrator.py

# Lint
uv run ruff check

# Format
uv run ruff format
```

Env file: copy `backend/.env.example` → `backend/.env.local` and fill in:
- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- `GOOGLE_API_KEY` (Gemini LLM)
- `MURF_API_KEY` (TTS)
- `DEEPGRAM_API_KEY` (STT)

### Frontend (`frontend/`)

Uses `pnpm` (preferred) or `npm`.

```bash
# Install
npm install   # or: pnpm install

# Dev server (Turbopack)
npm run dev

# Production build
npm run build

# Lint
npm run lint

# Format check / write
npm run format:check
npm run format
```

Env file: copy `frontend/.env.example` → `frontend/.env.local` with `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.

Frontend runs at `http://localhost:3000` (falls back to 3001 if busy).

## Architecture

### How the two pipelines interact

`backend/src/agent.py` runs two parallel pipelines:

1. **LiveKit voice pipeline** — `AgentSession` wires together Deepgram STT → Gemini LLM (via `VOCA_SYSTEM_PROMPT`) → Murf TTS, with Silero VAD and `MultilingualModel` turn detection. The LLM handles free-form conversation.

2. **Custom orchestration pipeline** — triggered on every `user_input_transcribed` event. `SessionOrchestrator.handle_turn()` runs synchronously in a thread (`asyncio.to_thread`) alongside a dead-air guard. It classifies the user's intent, extracts slots, applies policy, adapts tone and verbosity to budget mode, and returns a `TurnOutput` with `speech_text`. That text is spoken via `HumanizedTTSStreamer` rather than via the LLM TTS pipeline.

Because both pipelines share the same room, the custom orchestrator's responses effectively override or supplement the LLM output for structured intents.

### `SessionOrchestrator` call chain (`backend/src/voca/orchestration/`)

```
handle_turn(TurnInput)
  ├─ InMemorySessionStore.get_or_create()      # per-session state
  ├─ ContextMemory.update_summary()            # rolling conversation summary
  ├─ IntentRouter.route()                      # keyword/rule-based classification
  ├─ SlotFiller.extract() + missing_required() # required slot tracking
  ├─ PolicyEngine.decide()                     # RouteAction: RESOLVE / CLARIFY / ESCALATE
  ├─ ExperienceController.build_plan()         # tone, base message, memory reminder flag
  ├─ ResponseComposer.compose()                # budget-aware response shaping + multilingual segmentation
  └─ returns TurnOutput
```

### Key latency features in `agent.py`

- **Early response** (`TurnManager`): if a partial STT transcript arrives with confidence ≥ 0.72, the full orchestration pipeline starts immediately rather than waiting for the final transcript.
- **Dead-air guard**: `_dead_air_guard()` runs concurrently with the orchestrator call. If the orchestrator takes longer than `dead_air_threshold_ms` (800 ms default), a filler phrase is spoken while the real response is still being generated.
- **Barge-in**: `_on_user_state_changed` interrupts the current `SpeechHandle` and `HumanizedTTSStreamer` when the user speaks while the agent is speaking.

### `HumanizedTTSStreamer` (`backend/src/voca/services/humanized_tts.py`)

Wraps Murf TTS. Splits response text into voice-friendly chunks via `iter_response_chunks()`, inserts natural pauses between chunks, randomises pitch slightly per chunk, and optionally injects disfluency fillers (25% probability) for a more natural delivery.

### Budget management (`backend/src/voca/services/budget_manager.py`)

Tracks cumulative STT seconds, TTS seconds, and LLM characters across the session. Transitions mode: `normal` → `near_limit` (≥ 80%) → `hard_limit` (≥ 95%) → blocked. The `ResponseComposer` shortens responses as mode escalates.

### Data channels (backend → frontend)

| Topic | Content |
|---|---|
| `voca.session` | `phase`, `intent`, `queue_position`, `restored_after_disconnect` |
| `voca.metrics` | `avg_response_latency`, `intent_success_rate`, `budget_usage_percentage`, `budget_mode` |
| `voca.chat` | `role`, `message` (transcript display) |

Frontend hooks consume these: `useLiveMetrics` subscribes to `voca.metrics`; `useRoom` subscribes to `voca.session`; `useChatMessages` subscribes to `voca.chat`.

### Frontend structure

- `app/(app)/app/` — main voice session page
- `app/(app)/dashboard/` — metrics dashboard
- `app/(app)/demo/` — demo scenario mode
- `app/api/connection-details/` — server-side API route that mints LiveKit tokens
- `app-config.ts` — single `AppConfig` object; customize `companyName`, `startButtonText`, `agentName`, `sandboxId`, etc. here
- `components/app/session-view.tsx` — root voice UI: `VoiceOrb`, `VoiceControlBar`, `TranscriptView`, `LiveMetricsPanel`

### Configuration defaults (`backend/src/voca/config.py`)

All tuneable constants live in `AppConfig` (frozen dataclass). Change defaults there; `DEFAULT_CONFIG` is imported throughout.

| Constant | Default |
|---|---|
| `partial_stt_confidence_threshold` | `0.72` |
| `dead_air_threshold_ms` | `800` |
| `max_concurrent_sessions` | `2` |
| `ws_idle_timeout_seconds` | `180` |
| `near_limit` ratio | `0.80` |
| `hard_limit` ratio | `0.95` |

### LiveKit Agents documentation

LiveKit Agents evolves rapidly. Always consult the latest docs. An MCP server is available at `https://docs.livekit.io/mcp` for browsing docs directly. See `backend/AGENTS.md` for agent-specific guidance including TDD guidance for agent behavior changes and handoff/task workflow patterns.
