@echo off
setlocal enabledelayedexpansion
title Push to GitHub
echo ===================================================
echo     Pushing Event Management App to GitHub
echo ===================================================
echo.
cd /d "%~dp0"
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] No GitHub remote 'origin' found.
    set /p REPO_URL="Enter your GitHub Repository URL (e.g., https://github.com/username/repo.git): "
    if "!REPO_URL!"=="" (
        echo Error: No URL provided. Aborting.
        pause
        exit /b 1
    )
    git remote add origin !REPO_URL!
)

echo Pushing latest code to GitHub...
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo Trying force push to synchronize repository...
    git push -u origin main --force
)
echo.
pause
