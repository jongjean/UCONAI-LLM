# OpenClaw Local Controller - Windows Service 설치 스크립트
# Phase 1-3: Local Controller 서비스화
# 
# 사용법:
#   관리자 권한 PowerShell에서 실행:
#   .\Install-Controller-Service.ps1

param(
    [string]$ServiceName = "OpenClawController",
    [string]$DisplayName = "OpenClaw Local Controller",
    [string]$Description = "DCP 통합관제 시스템 - 로컬 제어 API 서버",
    [int]$Port = 17777
)

# 관리자 권한 확인
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ 오류: 관리자 권한이 필요합니다." -ForegroundColor Red
    Write-Host "PowerShell을 관리자 권한으로 다시 실행하세요." -ForegroundColor Yellow
    exit 1
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "OpenClaw Controller 서비스 설치" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 경로 설정
$controllerPath = "C:\OpenClaw\controller"
$scriptPath = "$controllerPath\openclaw_controller.ps1"
$wrapperPath = "$controllerPath\service_wrapper.ps1"

# 스크립트 존재 확인
if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ 오류: Controller 스크립트를 찾을 수 없습니다: $scriptPath" -ForegroundColor Red
    exit 1
}

# 기존 서비스 확인 및 중지
$existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "⚠️  기존 서비스 발견: $ServiceName" -ForegroundColor Yellow
    
    if ($existingService.Status -eq 'Running') {
        Write-Host "   서비스 중지 중..." -ForegroundColor Yellow
        Stop-Service -Name $ServiceName -Force
        Start-Sleep -Seconds 2
    }
    
    Write-Host "   기존 서비스 제거 중..." -ForegroundColor Yellow
    & sc.exe delete $ServiceName
    Start-Sleep -Seconds 2
}

# Service Wrapper 생성
Write-Host "📝 Service Wrapper 생성 중..." -ForegroundColor Green

$wrapperContent = @"
# OpenClaw Local Controller Service Wrapper
# 이 스크립트는 Windows Service로 실행되며, 실제 Controller를 호스팅합니다.

`$ErrorActionPreference = "Continue"
`$Port = $Port

# 로그 설정
`$logPath = "C:\OpenClaw\logs"
if (-not (Test-Path `$logPath)) {
    New-Item -ItemType Directory -Path `$logPath -Force | Out-Null
}
`$logFile = "`$logPath\controller_service_$(Get-Date -Format 'yyyyMMdd').log"

function Write-Log {
    param([string]`$Message)
    `$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    `$logMessage = "[`$timestamp] `$Message"
    Add-Content -Path `$logFile -Value `$logMessage
    Write-Host `$logMessage
}

Write-Log "========================================="
Write-Log "OpenClaw Controller Service 시작"
Write-Log "포트: `$Port"
Write-Log "========================================="

try {
    # Controller 스크립트 실행
    `$scriptPath = "C:\OpenClaw\controller\openclaw_controller.ps1"
    
    Write-Log "Controller 스크립트 로드: `$scriptPath"
    
    # 스크립트를 현재 세션에서 실행 (무한 루프)
    & `$scriptPath -Port `$Port
    
} catch {
    Write-Log "❌ 오류 발생: `$(`$_.Exception.Message)"
    Write-Log "스택 추적: `$(`$_.ScriptStackTrace)"
    throw
} finally {
    Write-Log "Controller Service 종료됨"
}
"@

Set-Content -Path $wrapperPath -Value $wrapperContent -Encoding UTF8
Write-Host "   ✅ Wrapper 생성 완료: $wrapperPath" -ForegroundColor Green

# NSSM 다운로드 및 사용 (가장 안정적인 방법)
Write-Host ""
Write-Host "🔧 Windows Service 등록 준비 중..." -ForegroundColor Green

# NSSM 사용 여부 확인
$nssmPath = "$controllerPath\nssm.exe"
$nssmExists = Test-Path $nssmPath

if (-not $nssmExists) {
    Write-Host ""
    Write-Host "⚠️  NSSM (Non-Sucking Service Manager)이 필요합니다." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "옵션 1: Task Scheduler 사용 (간단, 권장)" -ForegroundColor Cyan
    Write-Host "  - 부팅 시 자동 시작" -ForegroundColor Gray
    Write-Host "  - Watchdog 모니터링" -ForegroundColor Gray
    Write-Host ""
    Write-Host "옵션 2: NSSM 다운로드 및 설치 (Windows Service)" -ForegroundColor Cyan
    Write-Host "  - https://nssm.cc/download" -ForegroundColor Gray
    Write-Host "  - nssm.exe를 $controllerPath에 복사" -ForegroundColor Gray
    Write-Host ""
    
    $choice = Read-Host "옵션 선택 (1 또는 2)"
    
    if ($choice -eq "1") {
        # Task Scheduler 사용
        Write-Host ""
        Write-Host "📅 Task Scheduler로 등록 중..." -ForegroundColor Green
        
        $taskName = "OpenClaw Controller"
        $taskExists = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
        
        if ($taskExists) {
            Write-Host "   기존 Task 제거 중..." -ForegroundColor Yellow
            Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        }
        
        # Task Scheduler XML 생성
        $taskAction = New-ScheduledTaskAction -Execute "PowerShell.exe" `
            -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$wrapperPath`""
        
        $taskTrigger = New-ScheduledTaskTrigger -AtStartup
        
        $taskPrincipal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
        
        $taskSettings = New-ScheduledTaskSettingsSet `
            -AllowStartIfOnBatteries `
            -DontStopIfGoingOnBatteries `
            -StartWhenAvailable `
            -RestartCount 3 `
            -RestartInterval (New-TimeSpan -Minutes 1)
        
        Register-ScheduledTask -TaskName $taskName `
            -Action $taskAction `
            -Trigger $taskTrigger `
            -Principal $taskPrincipal `
            -Settings $taskSettings `
            -Description $Description | Out-Null
        
        Write-Host "   ✅ Task Scheduler 등록 완료" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Controller 시작 중..." -ForegroundColor Green
        Start-ScheduledTask -TaskName $taskName
        Start-Sleep -Seconds 3
        
        # 포트 확인
        $portTest = Test-NetConnection -ComputerName 127.0.0.1 -Port $Port -WarningAction SilentlyContinue
        if ($portTest.TcpTestSucceeded) {
            Write-Host "   ✅ Controller가 포트 $Port 에서 실행 중입니다!" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  포트 확인 실패. 로그를 확인하세요: $logFile" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "================================" -ForegroundColor Cyan
        Write-Host "✅ 설치 완료!" -ForegroundColor Green
        Write-Host "================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "제어 명령어:" -ForegroundColor Cyan
        Write-Host "  시작: Start-ScheduledTask -TaskName '$taskName'" -ForegroundColor Gray
        Write-Host "  중지: Get-ScheduledTask '$taskName' | Stop-ScheduledTask" -ForegroundColor Gray
        Write-Host "  상태: Get-ScheduledTask '$taskName'" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Health Check:" -ForegroundColor Cyan
        Write-Host "  Invoke-RestMethod http://127.0.0.1:$Port/health" -ForegroundColor Gray
        Write-Host "  Invoke-RestMethod http://127.0.0.1:$Port/self-health" -ForegroundColor Gray
        Write-Host ""
        Write-Host "로그 위치: $logFile" -ForegroundColor Cyan
        
    } else {
        Write-Host ""
        Write-Host "ℹ️  NSSM을 다운로드한 후 다시 실행하세요." -ForegroundColor Cyan
        Write-Host "   다운로드: https://nssm.cc/download" -ForegroundColor Gray
        Write-Host "   위치: $nssmPath" -ForegroundColor Gray
        exit 0
    }
    
} else {
    # NSSM 사용
    Write-Host "   ✅ NSSM 발견: $nssmPath" -ForegroundColor Green
    
    # NSSM으로 서비스 설치
    & $nssmPath install $ServiceName "PowerShell.exe" "-NoProfile -ExecutionPolicy Bypass -File `"$wrapperPath`""
    & $nssmPath set $ServiceName DisplayName $DisplayName
    & $nssmPath set $ServiceName Description $Description
    & $nssmPath set $ServiceName Start SERVICE_AUTO_START
    & $nssmPath set $ServiceName AppStdout "$controllerPath\logs\stdout.log"
    & $nssmPath set $ServiceName AppStderr "$controllerPath\logs\stderr.log"
    
    Write-Host "   ✅ NSSM 서비스 등록 완료" -ForegroundColor Green
    
    # 서비스 시작
    Write-Host ""
    Write-Host "🚀 서비스 시작 중..." -ForegroundColor Green
    Start-Service -Name $ServiceName
    Start-Sleep -Seconds 3
    
    $service = Get-Service -Name $ServiceName
    if ($service.Status -eq 'Running') {
        Write-Host "   ✅ 서비스가 실행 중입니다!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  서비스 시작 실패. 상태: $($service.Status)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "✅ 설치 완료!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "제어 명령어:" -ForegroundColor Cyan
    Write-Host "  시작: Start-Service $ServiceName" -ForegroundColor Gray
    Write-Host "  중지: Stop-Service $ServiceName" -ForegroundColor Gray
    Write-Host "  재시작: Restart-Service $ServiceName" -ForegroundColor Gray
    Write-Host "  상태: Get-Service $ServiceName" -ForegroundColor Gray
}
