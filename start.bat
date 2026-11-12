@echo off
title JobIntel AI Launcher
echo ====================================================
echo Starting JobIntel AI - Indian Tech Market Analytics
echo ====================================================

echo [1/2] Starting Flask Backend API on port 5000...
start "JobIntel Backend API (Port 5000)" cmd /k "cd /d %~dp0 && backend\.venv\Scripts\python.exe backend\run.py"

echo [2/2] Starting Vite Frontend on port 5173...
start "JobIntel Frontend UI (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ====================================================
echo Both servers have been launched in separate windows!
echo Access the application in your browser:
echo -- UI:  http://localhost:5173/
echo -- API: http://127.0.0.1:5000/api/health
echo ====================================================
pause

