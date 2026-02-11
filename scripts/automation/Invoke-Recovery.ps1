# DCP Automated Recovery Engine
# Chapter 3-2: Rule ?�진 구현
#
# ?�용�?
#   .\Invoke-Recovery.ps1 -SystemId "openclaw-gateway" -EventType "HEALTH_FAILURE"

param(
    [Parameter(Mandatory = $true)] [string]$SystemId,
    [Parameter(Mandatory = $true)] [string]$EventType,
    [int]$RetryCount = 0
)

$rulesPath = "C:\UCONAI-LLM\config\recovery_rules.yaml"

if (-not (Test-Path $rulesPath)) {
    Write-Error "Recovery rules not found: $rulesPath"
    exit 1
}

# YAML ?�싱 (?�순 ??처리�??�한 규칙 추출)
$lines = Get-Content $rulesPath
$rules = @()
$currentRule = $null

foreach ($line in $lines) {
    if ($line -match "^  - id: `"(.*?)`"") {
        if ($currentRule) { $rules += $currentRule }
        $currentRule = @{ id = $Matches[1] }
    }
    if ($currentRule) {
        if ($line -match "target_system: `"(.*?)`"") { $currentRule.target = $Matches[1] }
        if ($line -match "event_type: `"(.*?)`"") { $currentRule.event = $Matches[1] }
        if ($line -match "type: `"(.*?)`"") { $currentRule.actionType = $Matches[1] }
        if ($line -match "command: `"(.*?)`"") { $currentRule.command = $Matches[1] }
        if ($line -match "service_name: `"(.*?)`"") { $currentRule.service = $Matches[1] }
    }
}
if ($currentRule) { $rules += $currentRule }

Write-Host "--- DCP Recovery Engine ---" -ForegroundColor Cyan
Write-Host "Event: $EventType on $SystemId"

# 매칭?�는 규칙 찾기
$activeRule = $rules | Where-Object { 
    ($_.target -eq $SystemId -or $_.target -eq "any") -and $_.event -eq $EventType 
}

if ($activeRule) {
    Write-Host "Match Found: $($activeRule.id)" -ForegroundColor Yellow
    Write-Host "Action: $($activeRule.actionType) using $($activeRule.command)$($activeRule.service)"
    
    try {
        switch ($activeRule.actionType) {
            "RESTART" {
                Invoke-Expression $activeRule.command
            }
            "EXECUTE" {
                Invoke-Expression $activeRule.command
            }
            "SERVICE_START" {
                Start-Service -Name $activeRule.service
            }
            "ASK_AI" {
                Write-Host ">> Requesting AI Analysis..." -ForegroundColor Cyan
                $analysis = & "C:\UCONAI-LLM\scripts\automation\Invoke-OpenClaw-Analysis.ps1" -SystemId $SystemId -Logs "Recent error context..."
                Write-Host "AI Recommendation: $($analysis.recommendation)" -ForegroundColor Magenta
                # 권고?�에 ?�라 추�? 복구 로직 ?�행 가??
            }
        }
        Write-Host "??Recovery Action Executed Successfully." -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "??Failed to execute recovery action: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}
else {
    Write-Host "No matching recovery rule found for this event." -ForegroundColor DarkGray
    return $false
}
