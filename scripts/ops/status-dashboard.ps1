# DCP Integrated Status Dashboard (CLI)
# Chapter 1-6: CLI ?€?œë³´??êµ¬í˜„
#
# Version: 1.0

param(
    [int]$IntervalSec = 5,
    [switch]$Once = $false
)

$ErrorActionPreference = "Continue"

function Clear-Screen {
    if ($Host.Name -eq "ConsoleHost") {
        [Console]::Clear()
    }
    else {
        Clear-Host
    }
}

function Show-Dashboard {
    Clear-Screen
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "   DCP UNIFIED CONTROL BOARD (U-CONSOL CLI) v0.1" -ForegroundColor Cyan
    Write-Host "   UpdateTime: $timestamp   Refresh: ${IntervalSec}s" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host ""

    # Call health-all with JSON output
    $healthData = & "C:\UCONAI-LLM\scripts\health\health-all.ps1" -IncludeOptional -JsonOutput | ConvertFrom-Json
    
    # Header
    Write-Host (" {0,-5} | {1,-25} | {2,-10} | {3,-10} " -f "ID", "SYSTEM NAME", "STATUS", "LATENCY")
    Write-Host ("-" * 60)

    foreach ($sys in $healthData.systems) {
        $statusStr = if ($sys.result.ok) { "ONLINE" } else { "OFFLINE" }
        $color = if ($sys.result.ok) { "Green" } else { "Red" }
        $latency = if ($sys.result.latency_ms) { "$($sys.result.latency_ms)ms" } else { "-" }
        $id = if ($sys.critical) { "*$($sys.id)" } else { " $($sys.id)" }

        Write-Host (" {0,-20} | {1,-25} | " -f $id, $sys.name) -NoNewline
        Write-Host ("{0,-10}" -f $statusStr) -ForegroundColor $color -NoNewline
        Write-Host (" | {0,-10} " -f $latency)
        
        if (-not $sys.result.ok) {
            Write-Host "        ?”â? ERROR: $($sys.result.error)" -ForegroundColor Yellow
        }
    }

    Write-Host ""
    Write-Host ("-" * 60)
    Write-Host " SUMMARY: " -NoNewline
    $summaryColor = if ($healthData.ok) { "Green" } else { "Yellow" }
    Write-Host "$($healthData.healthy)/$($healthData.total) Systems Healthy" -ForegroundColor $summaryColor
    Write-Host " CRITICAL: " -NoNewline
    $criticalDown = $healthData.systems | Where-Object { $._critical -and -not $_.result.ok }
    if ($criticalDown) {
        Write-Host "WARNING! $($criticalDown.Count) CRITICAL SYSTEMS DOWN" -ForegroundColor Red
    }
    else {
        Write-Host "ALL CRITICAL SYSTEMS OPERATIONAL" -ForegroundColor Green
    }
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "Press CTRL+C to Exit"
}

if ($Once) {
    Show-Dashboard
}
else {
    while ($true) {
        Show-Dashboard
        Start-Sleep -Seconds $IntervalSec
    }
}
