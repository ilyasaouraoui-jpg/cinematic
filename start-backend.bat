@echo off
set MONGO_URI=memory
set TMDB_API_KEY=b11a77fd
set JWT_SECRET=cinematic_secret_2026
set PORT=5000
set CLIENT_URL=http://localhost:5173
cd /d %~dp0backend
node server.js
