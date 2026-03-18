# VOCA AI Voice Receptionist

Production-grade, voice-first AI receptionist built on LiveKit Agents with a custom orchestration layer for low-latency responses, interruption handling, multilingual segmentation, budget-aware generation, and reconnect resilience.

## What This Project Is

VOCA is a real-time receptionist agent that:

- Listens and replies in natural conversation flow
- Starts planning from partial STT for faster responses
- Handles user interruptions (barge-in) while speaking
- Adapts responses based on budget usage and latency
- Publishes live session and telemetry data to the UI
- Restores context after reconnect and prompts before idle timeout

## Current Status

- Milestones M1-M5 implemented and documented
- Core orchestration tests passing (see Testing section)
- Frontend and backend integrated through LiveKit + data channels

Reference docs in this repo:

- `SYSTEM_STATUS.md`
- `MILESTONE_3_COMPLETION.md`
- `MILESTONE_4_COMPLETION.md`
- `MILESTONE_5_COMPLETION.md`
- `PROGRESS.md`

## Repository Structure

```text
voca-ai-voice-receptionist/
|- backend/                 # Python LiveKit agent + orchestration engine
|  |- src/agent.py          # Runtime entrypoint for the voice agent
|  |- src/voca/             # Domain, orchestration, services, prompts
|  |- tests/                # Backend orchestration tests
|- frontend/                # Next.js voice UI + real-time metrics panels
|- docs/                    # Implementation blueprint and notes
|- start_app.sh             # Convenience startup script (Linux/macOS)
|- run-frontend.cmd         # Frontend helper script (Windows)
```

## Architecture Overview

### Backend

Core backend modules live under `backend/src/voca/`:

- `domain/`: enums, models, session state
- `orchestration/`: intent routing, policy, memory, turn handling, response composition
- `services/`: budget manager, fallbacks, telemetry
- `demo/`: deterministic scenario engine for demos
- `prompts/`: system + intent prompt building
- `api/`: internal contracts and error types

Entrypoint:

- `backend/src/agent.py`

### Frontend

Frontend modules live under `frontend/`:

- `app/`: route layouts and app pages
- `components/app/`: session UI, status, metrics, hints
- `hooks/`: room lifecycle, metrics ingestion, connection health
- `lib/`: contracts, session state helpers, telemetry utilities

## Key Features

- Early response mode from partial STT (`confidence >= 0.72`)
- Interruption preemption via speech handle interruption
- Multilingual segmented output support
- Dead-air filler prompts when response generation is delayed
- Budget modes: `normal`, `near_limit`, `hard_limit`
- Queue simulation and queue position publishing
- Keepalive prompts before idle timeout
- Session restoration after reconnect
- Deterministic scenario engine for demo reliability

## Prerequisites

### Required

- Python 3.9+
- Node.js 20+
- npm or pnpm
- LiveKit credentials

### Common API Keys

Configured in backend env:

- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `GOOGLE_API_KEY`
- `MURF_API_KEY`
- `DEEPGRAM_API_KEY`

Template file:

- `backend/.env.example`

## Setup

### 1. Backend setup

```bash
cd backend
uv sync
```

Create env file and fill credentials:

```bash
cp .env.example .env.local
```

### 2. Frontend setup

```bash
cd frontend
npm install
```

Create frontend env if missing and include LiveKit keys:

```env
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=...
```

## Running The Project

### Option A: Run services manually (recommended on Windows)

Terminal 1 (backend):

```bash
cd backend
uv run python src/agent.py dev
```

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

Open:

- `http://localhost:3000`
- If 3000 is busy, Next.js may start on 3001

### Option B: Startup script (Linux/macOS)

```bash
./start_app.sh
```

## Testing

Run backend tests:

```bash
cd backend
uv run pytest
```

Run frontend lint/build:

```bash
cd frontend
npm run lint
npm run build
```

## Runtime Data Channels

Published by backend and consumed by frontend:

- `voca.metrics`
	- average latency
	- intent success rate
	- budget usage
	- budget mode
- `voca.session`
	- phase
	- intent
	- queue position
	- restored-after-reconnect flag

## Important Config Defaults

Defined in `backend/src/voca/config.py`.

- Early response threshold: `0.72`
- Dead-air threshold: `800ms`
- Max concurrent sessions (queue simulation): `2`
- Near budget limit ratio: `0.80`
- Hard budget limit ratio: `0.95`
- Idle timeout window: `180s`

## Troubleshooting

### `LIVEKIT_URL is not defined` (frontend)

Ensure frontend env includes:

- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

### `pnpm` not found

Use npm instead:

```bash
npm run dev
```

### Port 3000 in use

Next.js auto-falls back to 3001. Open that URL.

### Backend starts but no voice session appears

Check:

- LiveKit credentials
- Internet access to LiveKit service
- STT/LLM/TTS API keys in `backend/.env.local`

## Development Notes

- Backend dependency management uses `uv`
- Frontend is Next.js App Router based
- The project includes multiple milestone docs with implementation details

## License

MIT. See `LICENSE`.