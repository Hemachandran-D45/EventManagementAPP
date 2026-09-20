@echo off
title Event Business Manager
echo ===================================================
echo     Starting Event Business Manager (V1)
echo ===================================================
echo.
echo Opening on http://127.0.0.1:8000 ...
echo Installable PWA: Open Safari/Chrome on iPhone or Android
echo.
cd /d "%~dp0backend"
python run.py
pause
