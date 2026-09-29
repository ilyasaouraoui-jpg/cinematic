@echo off
REM Secrets load from backend\.env via dotenv — keep them out of this script.
set MONGO_URI=memory
set PORT=5000
set CLIENT_URL=http://localhost:5173
cd /d %~dp0backend
node server.js
