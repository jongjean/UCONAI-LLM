# Watchdog Monitor 설치 스크립트
# Chapter 1-4: Watchdog Monitor 구성

param(
    [string]$TaskName = "OpenClaw Controller Watchdog",
    [int]$IntervalMin = 5
)

$watchdogPath = "C:\OpenClaw\controller\Watchdog-Controller.ps1"

if (-not (Test-Path $watchdogPath)) {
    Write-Host "Watchdog script not found at $watchdogPath" -ForegroundColor Red
    exit 1
}

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$watchdogPath`""
$trigger1 = New-ScheduledTaskTrigger -AtStartup
$trigger2 = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes $IntervalMin)
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger1, $trigger2 -Principal $principal -Settings $settings

Write-Host "Watchdog Task Registered Successfuly!" -ForegroundColor Green
Start-ScheduledTask -TaskName $TaskName
Write-Host "Watchdog Task Started!" -ForegroundColor Green
