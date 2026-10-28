@echo off
title Push to GitHub
echo ===================================================
echo     Pushing Event Management App to GitHub
echo ===================================================
echo.
cd /d "%~dp0"
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ===================================================
    echo  SUCCESS: Code pushed to GitHub successfully!
    echo ===================================================
) else (
    echo ===================================================
    echo  PUSH FAILED or CANCELLED.
    echo ===================================================
)
echo.
pause
