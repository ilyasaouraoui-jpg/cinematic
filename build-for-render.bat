@echo off
echo ========================================
echo  Building Cinematic for Render Deploy
echo ========================================
echo.

REM Build frontend
echo [1/2] Building frontend...
cd /d "%~dp0"
call npx vite build
if errorlevel 1 (
    echo BUILD FAILED
    exit /b 1
)

REM Copy dist to backend/public
echo [2/2] Copying to backend/public...
if exist "backend\public" rmdir /s /q "backend\public"
xcopy /E /I /Q "dist" "backend\public"
echo.

echo ========================================
echo  Build complete!
echo  
echo  To deploy on Render:
echo  1. Push this repo to GitHub
echo  2. Go to https://dashboard.render.com/new
echo  3. Select "Web Service"
echo  4. Connect your GitHub repo
echo  5. Settings:
echo     - Root Directory: backend
echo     - Build Command:  npm install
echo     - Start Command:  node server.js
echo  6. Add Environment Variable:
echo     - TMDB_API_KEY = b506e6994b6370b0c67ca2a3aab45346
echo  7. Deploy!
echo ========================================
pause
