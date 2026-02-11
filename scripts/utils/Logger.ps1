# DCP Unified Logging & Tracing Utility
# Chapter 3-3: correlationId 발급 �?로그 ?��???
# 
# ???�틸리티??모든 ?�업??고유 ID�?부?�하??분산??로그???��??�을 추적?�니??

$script:CurrentCorrelationId = $null

function Get-CorrelationId {
    if (-not $script:CurrentCorrelationId) {
        $script:CurrentCorrelationId = [Guid]::NewGuid().ToString().Substring(0, 8).ToUpper()
    }
    return $script:CurrentCorrelationId
}

function New-CorrelationId {
    $script:CurrentCorrelationId = [Guid]::NewGuid().ToString().Substring(0, 8).ToUpper()
    return $script:CurrentCorrelationId
}

function Write-DCPLog {
    param(
        [Parameter(Mandatory = $true)] [string]$Message,
        [Parameter(Mandatory = $false)] [string]$Level = "INFO",
        [Parameter(Mandatory = $false)] [string]$Component = "Unknown"
    )

    $id = Get-CorrelationId
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] [$id] [$Component] $Message"

    # 콘솔 출력 (?�상 처리)
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        "DEBUG" { "DarkGray" }
        default { "White" }
    }
    
    Write-Host $logEntry -ForegroundColor $color

    # ?�일 ?�??
    $logDir = "C:\UCONAI-LLM\logs"
    if (-not (Test-Path $logDir)) { New-Item -Path $logDir -ItemType Directory | Out-Null }
    $logFile = Join-Path $logDir "dcp_trace_$(Get-Date -Format 'yyyyMMdd').log"
    $logEntry | Out-File -FilePath $logFile -Append -Encoding UTF8
}

# ?�동 ?�록 (?�크립트 로드 ??
# . "C:\UCONAI-LLM\scripts\utils\Logger.ps1"
