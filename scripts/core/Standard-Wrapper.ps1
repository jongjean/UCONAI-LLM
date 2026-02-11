# DCP Standard System Wrapper (DCPW)
param(
    [Parameter(Mandatory = $true)] [string]$SystemId,
    [Parameter(Mandatory = $true)] [string]$Action
)

$systems = @{
    "openclaw-gateway"    = @{ name = "OpenClaw Gateway"; start = "node C:\Users\user\AppData\Roaming\npm\node_modules\openclaw\openclaw.mjs gateway run --port 18789"; pattern = "*openclaw*gateway*" }
    "openclaw-controller" = @{ name = "OpenClaw Controller"; start = "powershell -NoProfile -ExecutionPolicy Bypass -File C:\OpenClaw\controller\openclaw_controller.ps1 -Port 18088"; pattern = "*openclaw_controller.ps1*" }
    "uconai-bridge"       = @{ name = "UCONAI AI Bridge"; start = "node C:\OpenClaw\controller\ai-bridge.js"; pattern = "*ai-bridge.js*" }
    "uconai-frontend"     = @{ name = "UCONAI Frontend"; start = "cmd /c npm run dev"; pattern = "*vite*" }
    "infotech-monitor"    = @{ name = "Infotech TS"; start = "Start-Process 'C:\infotech\iftNxService\iftExWeb.exe' -WorkingDirectory 'C:\infotech\iftNxService' -WindowStyle Hidden"; pattern = "iftExWeb*" }
    "finger-monitor"      = @{ name = "Finger TS"; start = "Start-Process 'C:\Finger\FSWSS\fswss.exe' -WorkingDirectory 'C:\Finger\FSWSS' -WindowStyle Hidden"; pattern = "fswss*" }
    "ked-monitor"         = @{ name = "KED TS"; start = "Start-Process 'C:\KED\FindAgent\FindAgent.exe' -WorkingDirectory 'C:\KED\FindAgent' -WindowStyle Hidden"; pattern = "FindAgent*" }
    "tms-server"          = @{ name = "TMS Server"; start = "Start-Process 'C:\KWIC\KISS\KSAF002.exe' -WorkingDirectory 'C:\KWIC\KISS' -WindowStyle Hidden"; pattern = "KSAF002*" }
    "pms-server"          = @{ name = "PMS Server"; start = "Start-Process 'wpmsvc.exe' -WindowStyle Hidden"; pattern = "wpmsvc*" }
    "workstation-monitor" = @{ name = "Workstation Monitor"; start = "Write-Host 'Refreshed'"; pattern = "winlogon" }
}

function Stop-System($pattern) {
    Get-CimInstance Win32_Process | Where-Object { ($_.CommandLine -like $pattern) -or ($_.Name -like $pattern) } | Where-Object { $_.ProcessId -ne $PID } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

$sys = $systems[$SystemId]
if (-not $sys) {
    Write-Error "SystemId $SystemId not found."
    exit 1
}

if ($Action -eq "Restart" -or $Action -eq "Stop") {
    Write-Host "Stopping $($sys.name)..."
    Stop-System $sys.pattern
    Start-Sleep -Seconds 1
}

if ($Action -eq "Restart" -or $Action -eq "Start") {
    Write-Host "Starting $($sys.name)..."
    if ($sys.start -match "Start-Process") {
        Invoke-Expression $sys.start
    } else {
        Start-Process powershell -ArgumentList "-NoProfile -Command `"$($sys.start)`"" -WindowStyle Hidden
    }
}
exit 0
