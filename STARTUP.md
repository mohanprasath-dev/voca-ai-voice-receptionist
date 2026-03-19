## VOCA — STARTUP GUIDE (Deadline Run)

### 1. Start the Backend Agent

Open a terminal in:
  D:\Projects\voca-ai-voice-receptionist\backend

Run:
  cd D:\Projects\voca-ai-voice-receptionist\backend
  .venv\Scripts\activate
  python -m src.agent dev

OR if using uv:
  uv run python src/agent.py dev

You should see:
  ✅ Connected
  👤 Participant joined: voice_assistant_user_XXXX
  🚀 Starting AgentSession...
  ✅ AgentSession started — agent is live

### 2. Start the Frontend

Open a second terminal in:
  D:\Projects\voca-ai-voice-receptionist\frontend

Run:
  pnpm dev

Then open: http://localhost:3000/demo

### 3. Test the Demo

Click "Start Voice Receptionist"
Wait 2-3 seconds for connection
Speak: "Hello" → Agent should respond in English
Speak Hindi: "नमस्ते, आप कैसे हैं?" → Agent switches to Hindi
Speak Tamil: "வணக்கம், எப்படி இருக்கீங்க?" → Agent switches to Tamil

### 4. What was fixed

- CRITICAL FIX: session.say() was being called with an async generator instead of a string.
  LiveKit AgentSession.say() ONLY accepts a plain string. This was silently breaking all TTS.
  
- CRITICAL FIX: The old agent.py was running the session_orchestrator pipeline to generate
  responses (which returned hardcoded policy strings like "Done. I have handled that for you.")
  INSTEAD of letting Gemini/LLM generate the response. Now Gemini handles all responses.

- Language detection works via script analysis (Devanagari → Hindi, Tamil script → Tamil)
  PLUS Deepgram multi-language mode.

- TTS voice switches automatically when language changes.

- System prompt updates via session.update_instructions() on language switch.

### 5. If agent doesn't respond

Check backend terminal for errors.
Most common issues:
- MURF_API_KEY invalid → check backend/.env.local
- GOOGLE_API_KEY invalid → check backend/.env.local  
- LiveKit not reachable → check LIVEKIT_URL in both .env.local files
- voice ID not found on Murf → the VOICE_MAP uses standard Murf voice IDs

### 6. Voice IDs (Murf Falcon)
English: en-US-natalie
Hindi: hi-IN-aditi  
Tamil: ta-IN-kavitha
