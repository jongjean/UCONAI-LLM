# DCP Stop-All Orchestrator
# Chapter 2-7: 운영 스크립트 작성
# 
# 이 스크립트는 우선순위에 따라 모든 시스템을 정지합니다.

param(
    [switch]$IncludeOptional = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Continue"

# 시스템 제어 맵 (ID, 우선순위, 정지 명령어)
$systemControls = @(
    @{ id = "openclaw-gateway"; priority = 10; name = "OpenClaw Gateway"; cmd = "Stop-ScheduledTask -TaskName 'OpenClaw Gateway' -ErrorAction SilentlyContinue" },
    @{ id = "openclaw-controller"; priority = 9; name = "OpenClaw Controller"; cmd = "Stop-ScheduledTask -TaskName 'OpenClawLocalController' -ErrorAction SilentlyContinue" },
    @{ id = "uconai-frontend"; priority = 9; name = "UCONAI Frontend"; cmd = "Stop-ScheduledTask -TaskName 'UCONAI Frontend Server' -ErrorAction SilentlyContinue" },
    @{ id = "infotech-monitor"; priority = 8; name = "Infotech Monitor"; cmd = "Stop-Service -Name 'iftExWeb' -Force -ErrorAction SilentlyContinue" },
    @{ id = "iis-webserver"; priority = 3; name = "IIS Web Server"; cmd = "if (Get-Service -Name 'W3SVC' -ErrorAction SilentlyContinue) { Stop-Service -Name 'W3SVC' -Force }" },
    @{ id = "finger-scraper"; priority = 7; name = "Finger Scraper"; cmd = "Stop-Process -Name 'fswss' -ErrorAction SilentlyContinue" },
    @{ id = "ked-findagent"; priority = 7; name = "KED FindAgent"; cmd = "Stop-Process -Name 'AgentVersion' -ErrorAction SilentlyContinue" },
    @{ id = "stt-engine"; priority = 5; name = "STT Engine"; cmd = "Stop-Process -Name 'python' -ErrorAction SilentlyContinue" }
)

Write-Host "`n=== DCP Global Stop Sequence Initiated ===" -ForegroundColor Yellow
Write-Host "Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# 우선순위 ASC 정렬 (낮은 것부터 정지, 핵심 시스템은 마지막에 정지)
$sortedSystems = $systemControls | Sort-Object priority

foreach ($sys in $sortedSystems) {
    # 기동되어 있을 만한 것은 일단 다 끈다는 전략
    Write-Host "Stopping [$($sys.name)] (Priority: $($sys.priority))..." -NoNewline
    try {
        Invoke-Expression $sys.cmd
        Write-Host " [DONE]" -ForegroundColor Green
    }
    catch {
        Write-Host " [SKIPPED/FAILED]" -ForegroundColor DarkYellow
    }
}

Write-Host "`nAll targeted systems have been signaled to stop." -ForegroundColor Yellow
Write-Host "Verify with 'DCP: Status Dashboard (CLI)'.`n"
