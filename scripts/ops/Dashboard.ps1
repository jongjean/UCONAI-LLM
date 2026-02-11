# DCP CLI Dashboard
# Chapter 1-6: CLI Dashboard

param(
    [int]$RefreshSeconds = 5,
    [switch]$Once = $false
)

$ErrorActionPreference = "Continue"

$ScopeYaml = "C:\UCONAI-LLM\config\scope.yaml"

function Clear-DashBoard {
    Clear-Host
    $host.UI.RawUI.WindowTitle = "DCP Dashboard"
}

function Get-SystemScope {
    param([string]$SystemId)
    if (-not (Test-Path $ScopeYaml)) { return "unknown" }
    $content = Get-Content $ScopeYaml
    $currentScope = $null
    foreach ($line in $content) {
        if ($line -match '^\s+manage:') { $currentScope = 'manage' }
        elseif ($line -match '^\s+observe:') { $currentScope = 'observe' }
        elseif ($line -match '^\s+deny:') { $currentScope = 'deny' }
        elseif ($currentScope -and $line -match "- `"$SystemId`"") {
            return $currentScope
        }
    }
    return "unknown"
}

$systems = @(
    @{ id = "openclaw-gateway"; name = "OpenClaw Gateway"; type = "http"; url = "http://localhost:18789/health"; critical = $true },
    @{ id = "openclaw-controller"; name = "OpenClaw Controller"; type = "http"; url = "http://localhost:18082/health"; critical = $true },
    @{ id = "uconai-bridge"; name = "UCONAI AI Bridge"; type = "http"; url = "http://localhost:18081/health"; critical = $true },
    @{ id = "uconai-frontend"; name = "UCONAI Frontend"; type = "http"; url = "http://localhost:5173"; critical = $false },
    @{ id = "infotech-monitor"; name = "Infotech Monitor"; type = "service"; service = "iftExWeb"; critical = $true },
    @{ id = "watchdog"; name = "Watchdog Monitor"; type = "task"; task = "DCP Watchdog Monitor"; critical = $false }
)

function Test-SystemHealth {
    param($System)
    try {
        if ($System.type -eq "http") {
            $response = Invoke-WebRequest -Uri $System.url -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            return @{ status = "OK"; detail = "HTTP $($response.StatusCode)" }
        }
        elseif ($System.type -eq "service") {
            $service = Get-Service -Name $System.service -ErrorAction SilentlyContinue
            if ($service -and $service.Status -eq 'Running') {
                return @{ status = "OK"; detail = "Running" }
            }
            return @{ status = "FAIL"; detail = "Stopped" }
        }
        elseif ($System.type -eq "task") {
            $task = Get-ScheduledTask -TaskName $System.task -ErrorAction SilentlyContinue
            if ($task -and $task.State -eq 'Running') {
                return @{ status = "OK"; detail = "Running" }
            }
            return @{ status = "WARN"; detail = "Ready" }
        }
    }
    catch {
        return @{ status = "FAIL"; detail = "Error" }
    }
    return @{ status = "UNKNOWN"; detail = "N/A" }
}

function Show-Dashboard {
    Clear-DashBoard
    
    $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  DCP Unified Control - Dashboard" -ForegroundColor Cyan
    Write-Host "  Time: $now" -ForegroundColor Gray
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    Write-Host "System Name              Status    Scope      Details" -ForegroundColor White
    Write-Host "-------------------------------------------------------------" -ForegroundColor White
    
    $healthyCount = 0
    $totalCount = 0
    $criticalFails = 0
    
    foreach ($sys in $systems) {
        $totalCount++
        $health = Test-SystemHealth -System $sys
        $scope = Get-SystemScope -SystemId $sys.id
        
        $statusColor = switch ($health.status) {
            "OK" { "Green"; $healthyCount++ }
            "WARN" { "Yellow" }
            "FAIL" { if ($sys.critical) { $criticalFails++; "Red" } else { "Red" } }
            default { "Gray" }
        }
        
        $scopeColor = switch ($scope) {
            "manage" { "Green" }
            "observe" { "Yellow" }
            "deny" { "Red" }
            default { "Gray" }
        }
        
        $marker = if ($sys.critical) { "[!]" } else { "[ ]" }
        Write-Host "$marker " -NoNewline -ForegroundColor $(if ($sys.critical) { "Red" } else { "Gray" })
        Write-Host $sys.name.PadRight(23) -NoNewline -ForegroundColor White
        Write-Host $health.status.PadRight(10) -NoNewline -ForegroundColor $statusColor
        Write-Host $scope.PadRight(11) -NoNewline -ForegroundColor $scopeColor
        Write-Host $health.detail -ForegroundColor Gray
    }
    
    Write-Host "`n========================================" -ForegroundColor White
    
    $healthPercentage = if ($totalCount -gt 0) { [math]::Round(($healthyCount / $totalCount) * 100, 1) } else { 0 }
    $summaryColor = if ($healthPercentage -ge 80) { "Green" } elseif ($healthPercentage -ge 50) { "Yellow" } else { "Red" }
    
    Write-Host "Health: " -NoNewline -ForegroundColor White
    Write-Host "$healthyCount / $totalCount ($healthPercentage%)" -ForegroundColor $summaryColor
    
    if ($criticalFails -gt 0) {
        Write-Host "Critical Failures: " -NoNewline -ForegroundColor White
        Write-Host "$criticalFails" -ForegroundColor Red
    }
    
    Write-Host "`nLegend: [!] Critical  [ ] Optional  |  " -NoNewline -ForegroundColor Gray
    Write-Host "manage " -NoNewline -ForegroundColor Green
    Write-Host "observe " -NoNewline -ForegroundColor Yellow
    Write-Host "deny" -ForegroundColor Red
    
    if (-not $Once) {
        Write-Host "`nRefreshing in $RefreshSeconds seconds... (Ctrl+C to exit)" -ForegroundColor DarkGray
    }
}

if ($Once) {
    Show-Dashboard
}
else {
    while ($true) {
        Show-Dashboard
        Start-Sleep -Seconds $RefreshSeconds
    }
}
