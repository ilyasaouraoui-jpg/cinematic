@echo off
echo ============================================
echo   Cinematic Streaming Platform - Starting
echo ============================================
echo.
echo Starting Backend on port 5000...
start "Backend" cmd /c "%~dp0start-backend.bat"
timeout /t 15 /nobreak >nul
echo.
echo Starting Frontend on port 5173...
start "Frontend" cmd /c "%~dp0start-frontend.bat"
timeout /t 5 /nobreak >nul
echo.
echo ============================================
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo ============================================
echo.
start http://localhost:5173
pause
