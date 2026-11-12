# JobIntel AI PowerShell Launcher
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " Starting JobIntel AI - Indian Tech Market Analytics " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$projectRoot = $PSScriptRoot

# 1. Start Backend API
Write-Host "[1/2] Starting Flask Backend (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; & '.\backend\.venv\Scripts\python.exe' backend\run.py"

# 2. Start Frontend UI
Write-Host "[2/2] Starting Vite Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host " Both servers are running!" -ForegroundColor Green
Write-Host " Application URL: http://localhost:5173/" -ForegroundColor White
Write-Host " Backend API:     http://127.0.0.1:5000/api/health" -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Green

