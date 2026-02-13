param([int]$IntervalSec = 5, [switch]$Once = $false)

function Show-Dashboard {
    Clear-Host
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "   DCP UNIFIED CONTROL BOARD (U-CONSOL CLI) v0.1" -ForegroundColor Cyan
    Write-Host "   UpdateTime: $timestamp   Refresh: ${IntervalSec}s" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan
    
    # Static Configuration Check (Since Control Plane API is returning HTML)
    $systems = @(
        @{id="dcp-control-plane"; name="DCP Gateway"; port=18789},
        @{id="dcp-execution-plane"; name="DCP Controller"; port=17777},
        @{id="uconai-bridge"; name="AI Bridge"; port=18081},
        @{id="uconai-frontend"; name="Frontend"; port=5173},
        @{id="ollama-service"; name="Ollama (Local LLM)"; port=11434}
    )

    Write-Host ""
    Write-Host (" {0,-20} | {1,-25} | {2,-10}" -f "ID", "SYSTEM NAME", "STATUS")
    Write-Host ("-" * 60)

    foreach ($sys in $systems) {
        $isConnected = Test-NetConnection -ComputerName localhost -Port $sys.port -InformationLevel Quiet
        $statusStr = if ($isConnected) { "ONLINE" } else { "OFFLINE" }
        $color = if ($isConnected) { "Green" } else { "Red" }

        Write-Host (" {0,-20} | {1,-25} | " -f $sys.id, $sys.name) -NoNewline
        Write-Host ("{0,-10}" -f $statusStr) -ForegroundColor $color
    }

    Write-Host ""
    Write-Host ("-" * 60)
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "Press CTRL+C to Exit"
}

if ($Once) {
    Show-Dashboard
} else {
    while ($true) {
        Show-Dashboard
        Start-Sleep -Seconds $IntervalSec
    }
}
