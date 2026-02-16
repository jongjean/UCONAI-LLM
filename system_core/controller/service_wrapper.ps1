# OpenClaw Local Controller Service Wrapper
# ???ㅽ겕由쏀듃??Windows Service濡??ㅽ뻾?섎ŉ, ?ㅼ젣 Controller瑜??몄뒪?낇빀?덈떎.

$ErrorActionPreference = "Continue"
$Port = 17777

# 濡쒓렇 ?ㅼ젙
$logPath = "C:\OpenClaw\logs"
if (-not (Test-Path $logPath)) {
    New-Item -ItemType Directory -Path $logPath -Force | Out-Null
}
$logFile = "$logPath\controller_service_20260210.log"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Add-Content -Path $logFile -Value $logMessage
    Write-Host $logMessage
}

Write-Log "========================================="
Write-Log "OpenClaw Controller Service ?쒖옉"
Write-Log "?ы듃: $Port"
Write-Log "========================================="

try {
    # Controller ?ㅽ겕由쏀듃 ?ㅽ뻾
    $scriptPath = "C:\OpenClaw\controller\openclaw_controller.ps1"
    
    Write-Log "Controller ?ㅽ겕由쏀듃 濡쒕뱶: $scriptPath"
    
    # ?ㅽ겕由쏀듃瑜??꾩옱 ?몄뀡?먯꽌 ?ㅽ뻾 (臾댄븳 猷⑦봽)
    & $scriptPath -Port $Port
    
} catch {
    Write-Log "???ㅻ쪟 諛쒖깮: $($_.Exception.Message)"
    Write-Log "?ㅽ깮 異붿쟻: $($_.ScriptStackTrace)"
    throw
} finally {
    Write-Log "Controller Service 醫낅즺??
}
