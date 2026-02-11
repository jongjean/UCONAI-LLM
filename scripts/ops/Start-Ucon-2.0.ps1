<#
.SYNOPSIS
    UCONAI-LLM 2.0 ?„ì²´ ?œìŠ¤???œìž‘ ?¤í¬ë¦½íŠ¸
.DESCRIPTION
    Controller(18082), AI-Bridge(18081), Frontend(5173)ë¥??œì°¨?ìœ¼ë¡??œìž‘?©ë‹ˆ??
#>

Write-Host "?? Starting UCONAI-LLM 2.0..." -ForegroundColor Cyan

# 1. Cleanup
Write-Host "?§¹ Cleaning up existing processes..." -ForegroundColor Gray
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-WmiObject Win32_Process | Where-Object { $_.CommandLine -like "*openclaw_controller.ps1*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }

# 2. Start Controller (18082)
Write-Host "Starting Controller on port 18082..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-File C:\OpenClaw\controller\openclaw_controller.ps1 -Port 18082" -WindowStyle Hidden
Start-Sleep -Seconds 2

# 3. Start AI Bridge (18081)
Write-Host "Starting AI Bridge on port 18081..." -ForegroundColor Green
Start-Process node -ArgumentList "C:\OpenClaw\controller\ai-bridge.js" -WindowStyle Hidden
Start-Sleep -Seconds 2

# 4. Start Frontend (5173)
Write-Host "Starting Frontend..." -ForegroundColor Green
Set-Location "C:\UCONAI-LLM\frontend"
npm run dev
