@echo off
title Event Business Manager (Development Mode)
echo ===================================================
echo   Starting Event Business Manager in Dev Mode
echo ===================================================
echo.
start "Backend API (Port 8000)" cmd /k "cd /d %~dp0backend && python run.py"
timeout /t 2 >nul
start "Frontend Dev (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"
echo Backend running on http://127.0.0.1:8000
echo Frontend running on http://localhost:5173
