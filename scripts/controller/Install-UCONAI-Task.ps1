# UCONAI Frontend - Task Scheduler 등록 스크립트
# 이 스크립트는 UCONAI Frontend를 Windows Task Scheduler에 등록하여
# 시스템 시작 시 자동으로 백그라운드에서 실행되도록 합니다.

param(
    [switch]$Uninstall = $false
)

$TaskName = "UCONAI Frontend Server"
$WorkingDir = "C:\home\ucon\UCONAI_gpt-ISO\frontend"
$NpmPath = "C:\Program Files\nodejs\npm.cmd"

if ($Uninstall) {
    Write-Host "Uninstalling Task: $TaskName" -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Task uninstalled." -ForegroundColor Green
    exit 0
}

# 기존 태스크가 있으면 제거
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# Task Scheduler 액션 생성
$Action = New-ScheduledTaskAction `
    -Execute $NpmPath `
    -Argument "run dev" `
    -WorkingDirectory $WorkingDir

# 트리거: 로그온 시 시작
$Trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

# 설정: 백그라운드에서 실행, 항상 실행
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

# Principal: 현재 사용자로 실행
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive

# 태스크 등록
Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Principal $Principal `
    -Description "UCONAI Frontend Development Server (Vite)" `
    -Force

Write-Host "`n✅ Task '$TaskName' has been registered successfully!" -ForegroundColor Green
Write-Host "`nTo start the task now, run:" -ForegroundColor Cyan
Write-Host "  Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Yellow
Write-Host "`nTo view task status:" -ForegroundColor Cyan
Write-Host "  Get-ScheduledTask -TaskName '$TaskName' | Format-List" -ForegroundColor Yellow
Write-Host "`nTo uninstall:" -ForegroundColor Cyan
Write-Host "  .\Install-UCONAI-Task.ps1 -Uninstall`n" -ForegroundColor Yellow
