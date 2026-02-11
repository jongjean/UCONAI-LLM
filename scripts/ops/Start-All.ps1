# DCP Start-All Orchestrator
# Chapter 2-7: 운영 스크립트 작성
# 
# 이 스크립트는 우선순위에 따라 모든 시스템을 기동합니다.

param(
    [switch]$IncludeOptional = $false,
    [int]$WaitSec = 2
)

$ErrorActionPreference = "Continue"

# 시스템 제어 맵 (ID, 우선순위, 기동 명령어)
$systemControls = @(
    @{ id = "openclaw-gateway"; priority = 10; name = "OpenClaw Gateway"; cmd = "Start-ScheduledTask -TaskName 'OpenClaw Gateway'" },
    @{ id = "openclaw-controller"; priority = 9; name = "OpenClaw Controller"; cmd = "Start-ScheduledTask -TaskName 'OpenClawLocalController'" },
    @{ id = "uconai-frontend"; priority = 9; name = "UCONAI Frontend"; cmd = "Start-ScheduledTask -TaskName 'UCONAI Frontend Server'" },
    @{ id = "infotech-monitor"; priority = 8; name = "Infotech Monitor"; cmd = "Start-Service -Name 'iftExWeb'" },
    @{ id = "iis-webserver"; priority = 3; name = "IIS Web Server"; cmd = "if (Get-Service -Name 'W3SVC' -ErrorAction SilentlyContinue) { Start-Service -Name 'W3SVC' }" },
    @{ id = "finger-scraper"; priority = 7; name = "Finger Scraper"; cmd = "Start-Process 'C:\Finger\FSWSS\fswss.exe' -WorkingDirectory 'C:\Finger\FSWSS'" },
    @{ id = "ked-findagent"; priority = 7; name = "KED FindAgent"; cmd = "Start-Process 'C:\KED\FindAgent\AgentVersion.exe' -WorkingDirectory 'C:\KED\FindAgent'" },
    @{ id = "stt-engine"; priority = 5; name = "STT Engine"; cmd = "Start-Process 'C:\stt\venv\Scripts\python.exe' -ArgumentList 'C:\stt\transcribe_raw.py' -WorkingDirectory 'C:\stt'" }
)

Write-Host "`n=== DCP Global Start Sequence Initiated ===" -ForegroundColor Cyan
Write-Host "Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# 우선순위 DESC 정렬 (높은 것부터 기동)
$sortedSystems = $systemControls | Sort-Object priority -Descending

foreach ($sys in $sortedSystems) {
    if (-not $IncludeOptional -and $sys.priority -lt 8) {
        Write-Host "Skipping Optional System: $($sys.name)" -ForegroundColor DarkGray
        continue
    }

    Write-Host "Starting [$($sys.name)] (Priority: $($sys.priority))..." -NoNewline
    try {
        Invoke-Expression $sys.cmd
        Write-Host " [DONE]" -ForegroundColor Green
    }
    catch {
        Write-Host " [FAILED]" -ForegroundColor Red
        Write-Host " Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    if ($WaitSec -gt 0) { Start-Sleep -Seconds $WaitSec }
}

Write-Host "`nAll priority systems have been signaled to start." -ForegroundColor Cyan
Write-Host "Run 'DCP: Health Check All' to verify status.`n"
