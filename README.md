# Voca - AI Voice Receptionist

Voca is a real-time, multilingual AI voice receptionist designed for production use. It combines streaming speech, orchestration intelligence, and human-like interaction controls to deliver instant, natural conversations for customer-facing businesses.

## Why Voca

Businesses lose leads when calls are missed, delayed, or routed through rigid IVR systems. Voca solves this with a voice-native AI receptionist that answers immediately, understands intent, captures context, and responds with low-latency conversational speech.

## What Makes It Production-Grade

- Real-time streaming pipeline, not batch request/response
- Deterministic orchestration for policy, slot filling, and routing
- Partial STT early-response planning for lower perceived latency
- Barge-in interruption handling for natural turn-taking
- Budget-aware response shaping for cost and reliability control
- Reconnect resilience and keepalive behavior for long-running sessions
- Live metrics and session telemetry over data channels

## Core Stack

- LiveKit: real-time media transport and session runtime
- Deepgram: speech-to-text (STT)
- Gemini: reasoning and response generation
- Murf AI: text-to-speech (TTS)
- Next.js: frontend experience and monitoring dashboard
- Python + uv: backend orchestration and runtime

## High-Level Flow

1. Caller audio streams through LiveKit.
2. Deepgram transcribes speech incrementally.
3. Orchestration engine classifies intent and extracts slots.
4. Gemini generates context-aware response content.
5. Murf streams natural voice output in chunks.
6. Frontend receives live metrics, session state, and transcript updates.

## Architecture

### Backend

Main runtime entry:

- backend/src/agent.py

Core modules:

- backend/src/voca/orchestration: intent routing, policy decisions, slot filling, context memory, response composition
- backend/src/voca/services: budget management, fallback fillers, telemetry, TTS helpers
- backend/src/voca/domain: models, enums, and session contracts
- backend/src/voca/prompts: system and intent prompt templates
- backend/src/voca/demo: deterministic demo scenario logic

### Frontend

Main app:

- frontend/app

Core modules:

- frontend/components/app: voice session UI, control bar, transcript, live metrics panel
- frontend/hooks: room lifecycle, connection health, metrics ingestion, chat ingestion
- frontend/lib: contracts, state helpers, telemetry utilities

## Feature Highlights

- Real-time conversational voice with low latency
- Multilingual understanding and segmented response output
- Human-like interruption behavior during agent speech
- Early response mode from partial STT confidence signals
- Dead-air filler phrases for long-response safety
- Budget modes to compress output near usage limits
- Queue simulation behavior for high-concurrency scenarios
- Session restoration support after reconnect

## Milestone Status

- M3 complete: early response, interruption handling, multilingual segmentation, live data publishing
- M4 complete: dead-air fillers, budget compression modes, queue simulation, smart suggestions, frontend indicators
- M5 complete: websocket resilience, keepalive prompts, reconnect restoration paths

Detailed implementation notes are available in:

- SYSTEM_STATUS.md
- docs/implementation-blueprint.md
- docs/milestones/HANDOFF.md

## Repository Layout

```text
voca-ai-voice-receptionist/
|- backend/
|  |- src/agent.py
|  |- src/voca/
|  |- tests/
|- frontend/
|  |- app/
|  |- components/
|  |- hooks/
|  |- lib/
|- docs/
|- STARTUP.md
|- SYSTEM_STATUS.md
```

## Prerequisites

- Python 3.9+
- Node.js 20+
- npm or pnpm
- LiveKit project credentials
- API keys for Deepgram, Gemini, and Murf

## Environment Variables

### Backend

Copy backend/.env.example to backend/.env.local and set:

- LIVEKIT_URL
- LIVEKIT_API_KEY
- LIVEKIT_API_SECRET
- DEEPGRAM_API_KEY
- GOOGLE_API_KEY
- MURF_API_KEY

### Frontend

Create frontend/.env.local and set:

- LIVEKIT_URL
- LIVEKIT_API_KEY
- LIVEKIT_API_SECRET

## Local Setup

### 1) Backend

```bash
cd backend
uv sync
```

### 2) Frontend

```bash
cd frontend
npm install
```

## Run Locally

Run in two terminals.

Terminal A:

```bash
cd backend
uv run python src/agent.py dev
```

Terminal B:

```bash
cd frontend
npm run dev
```

Open http://localhost:3000 (or 3001 if 3000 is busy).

## Testing and Quality

### Backend tests

```bash
cd backend
uv run pytest
```

### Backend lint and format

```bash
cd backend
uv run ruff check
uv run ruff format
```

### Frontend lint and build

```bash
cd frontend
npm run lint
npm run build
```

## Runtime Telemetry Channels

Backend publishes data channels consumed by frontend:

- voca.metrics
	- avg_response_latency
	- intent_success_rate
	- budget_usage_percentage
	- budget_mode
- voca.session
	- phase
	- intent
	- queue_position
	- restored_after_disconnect
- voca.chat
	- role
	- message

## Key Runtime Defaults

Config source: backend/src/voca/config.py

- partial_stt_confidence_threshold: 0.72
- dead_air_threshold_ms: 800
- max_concurrent_sessions: 2
- ws_idle_timeout_seconds: 180
- near_limit ratio: 0.80
- hard_limit ratio: 0.95

## Troubleshooting

### Frontend cannot connect to LiveKit

- Confirm frontend/.env.local has LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET.
- Restart the frontend dev server after env changes.

### Backend runs but no speech response

- Verify DEEPGRAM_API_KEY, GOOGLE_API_KEY, and MURF_API_KEY in backend/.env.local.
- Check backend logs for provider auth or quota errors.

### Port conflicts

- Next.js typically switches from 3000 to 3001 automatically.

### uv command not found

- Install uv, then rerun backend setup commands.

## Product Positioning

Voca is not a demo bot. It is a scalable AI receptionist platform for real businesses that need instant, natural, and always-on voice interactions across languages and customer intents.

## Builder

Mohan Prasath P

AI systems builder focused on real-time conversational infrastructure, product reliability, and production deployment readiness.

## License

MIT License. See LICENSE.