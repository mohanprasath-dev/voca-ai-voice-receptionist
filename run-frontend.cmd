@echo off
REM Clear problematic environment variables
set NODE_PATH=
set npm_config_node_path=
set npm_config_prefix=
REM Run frontend
cd /d "D:\Projects\Hackathons & Competitions\voca-ai-voice-receptionist\frontend"
node node_modules/.bin/next dev
