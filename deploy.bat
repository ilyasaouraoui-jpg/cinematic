@echo off
echo ========================================
echo  Cinematic Platform - Deploy All
echo ========================================
echo.

REM Step 1: Build frontend
echo [1/3] Building frontend...
cd /d "%~dp0"
call npx vite build
if errorlevel 1 (
    echo BUILD FAILED
    exit /b 1
)

echo.
echo [2/3] Deploying backend to Render...
echo     Go to https://dashboard.render.com/new
echo     Select "Web Service", connect your GitHub repo
echo     Root Directory: backend
echo     Build Command: npm install
echo     Start Command: node server.js
echo     Add env vars: TMDB_API_KEY=b506e6994b6370b0c67ca2a3aab45346
echo.
echo [3/3] Deploying frontend to Vercel...
echo     Run: npx vercel --prod
echo     Set env var VITE_API_URL to your Render backend URL
echo.
echo ========================================
echo  DONE - Start both servers locally:
echo    Backend:  cd backend ^&^& npm start
echo    Frontend: npm run dev
echo ========================================
pause
