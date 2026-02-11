# UCONAI-LLM 1.1 ONE-CLICK RECOVERY SCRIPT
Write-Host "!!! WARNING: RECOVERING SYSTEM TO v1.1 STABLE STATE !!!" -ForegroundColor Yellow
 = 'C:\UCONAI-LLM\backups\FINAL_STABLE_v1.1_20260211'

# [1] 프로세스 강제 종료
Get-Process powershell, node, cmd -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "UCONAI|openclaw" } | Stop-Process -Force -ErrorAction SilentlyContinue

# [2] 현재 작업 폴더 정리 및 복원
Write-Host "[1/4] Restoring Frontend..."
Remove-Item -Path "C:\UCONAI-LLM\frontend" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$backup\frontend" -Destination "C:\UCONAI-LLM\frontend" -Recurse -Force

Write-Host "[2/4] Restoring Scripts & Configs..."
Remove-Item -Path "C:\UCONAI-LLM\scripts" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$backup\scripts" -Destination "C:\UCONAI-LLM\scripts" -Recurse -Force
Copy-Item -Path "C:\UCONAI-LLM\config" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$backup\config" -Destination "C:\UCONAI-LLM\config" -Recurse -Force

Write-Host "[3/4] Restoring AI Bridge..."
Copy-Item -Path "$backup\OpenClaw_controller\*" -Destination "C:\OpenClaw\controller\" -Recurse -Force

Write-Host "[4/4] Finalizing Documentation..."
Copy-Item -Path "$backup\docs\*" -Destination "C:\UCONAI-LLM\docs\" -Recurse -Force

Write-Host "--- RECOVERY COMPLETE. SYSTEM IS NOW v1.1 STABLE ---" -ForegroundColor Green
Write-Host "Please refresh your browser (5173)."
