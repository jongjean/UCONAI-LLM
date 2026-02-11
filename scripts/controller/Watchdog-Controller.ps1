# OpenClaw Controller Watchdog Monitor
# Chapter 1-4: Watchdog Monitor 구성

param(
    [string]$ControllerUrl = "http://127.0.0.1:17777",
    [int]$TimeoutSec = 5
)

$logPath = "C:\OpenClaw\logs"
if (-not (Test-Path $logPath)) {
    New-Item -ItemType Directory -Path $logPath -Force | Out-Null
}

$logFile = Join-Path $logPath "watchdog_$(Get-Date -Format 'yyyyMMdd').log"

function Write-WatchdogLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] [$Level] $Message"
    Add-Content -Path $logFile -Value $line
    Write-Host $line
}

Write-WatchdogLog "===================" "INFO"
Write-WatchdogLog "Watchdog 시작" "INFO"

try {
    $healthUrl = "$ControllerUrl/health"
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec $TimeoutSec -ErrorAction Stop
    
    if ($response.ok -eq $true) {
        Write-WatchdogLog "Controller 정상" "SUCCESS"
        Write-WatchdogLog "===================" "INFO"
        exit 0
    }
}
catch {
    Write-WatchdogLog "Health Check 실패: $($_.Exception.Message)" "ERROR"
    Write-WatchdogLog "재시작 시도..." "WARN"
}

$process = Get-Process -Name "powershell" -ErrorAction SilentlyContinue |
Where-Object {
    try {
        $conn = Get-NetTCPConnection -LocalPort 17777 -ErrorAction SilentlyContinue
        if ($conn) { return $conn.OwningProcess -contains $_.Id }
        return $false
    }
    catch { return $false }
} | Select-Object -First 1

if ($process) {
    Write-WatchdogLog "프로세스 종료: PID $($process.Id)" "WARN"
    Stop-Process -Id $process.Id -Force
    Start-Sleep -Seconds 2
}

Write-WatchdogLog "Controller 재시작..." "INFO"

$task = Get-ScheduledTask -TaskName "OpenClaw Controller" -ErrorAction SilentlyContinue
if ($task) {
    Start-ScheduledTask -TaskName "OpenClaw Controller"
}
else {
    $scriptPath = "C:\OpenClaw\controller\openclaw_controller.ps1"
    if (Test-Path $scriptPath) {
        Start-Process PowerShell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -Port 17777" -WindowStyle Hidden
    }
    else {
        Write-WatchdogLog "스크립트 없음" "ERROR"
        exit 1
    }
}

Start-Sleep -Seconds 8

try {
    $response = Invoke-RestMethod -Uri "$ControllerUrl/health" -Method Get -TimeoutSec $TimeoutSec -ErrorAction Stop
    if ($response.ok -eq $true) {
        Write-WatchdogLog "재시작 성공" "SUCCESS"
        exit 0
    }
}
catch {
    Write-WatchdogLog "재시작 실패" "ERROR"
    exit 1
}
