# DCP Standard System Wrapper (DCPW) - Port Policy 18080 Aligned
param(
    [Parameter(Mandatory = $true)] [string]$SystemId,
    [Parameter(Mandatory = $true)] [ValidateSet("Start", "Stop", "Restart")] [string]$Action
)

$systems = @{
    "openclaw-gateway"    = @{ name = "OpenClaw Gateway"; start = "Start-Process cmd -ArgumentList '/c openclaw gateway run --port 18082' -WorkingDirectory 'C:\Users\user\.openclaw' -WindowStyle Hidden"; stop = "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*gateway run*' } | Stop-Process -Force -ErrorAction SilentlyContinue" }
    "openclaw-controller" = @{ name = "OpenClaw Controller"; start = "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File C:\UCONAI-LLM\scripts\controller\openclaw_controller.ps1 -Port 18080' -WorkingDirectory 'C:\UCONAI-LLM\scripts\controller' -WindowStyle Hidden"; stop = "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*openclaw_controller.ps1*' } | Stop-Process -Force -ErrorAction SilentlyContinue" }
    "uconai-bridge"       = @{ name = "UCONAI AI Bridge"; start = "Start-Process node -ArgumentList 'C:\OpenClaw\controller\ai-bridge.js' -WorkingDirectory 'C:\OpenClaw\controller' -WindowStyle Hidden"; stop = "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*ai-bridge.js*' } | Stop-Process -Force -ErrorAction SilentlyContinue" }
    "uconai-frontend"     = @{ name = "UCONAI Frontend"; start = "Start-Process cmd -ArgumentList '/c npm run dev' -WorkingDirectory 'C:\UCONAI-LLM\frontend' -WindowStyle Hidden"; stop = "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*vite*' } | Stop-Process -Force -ErrorAction SilentlyContinue" }
}

if (-not $systems.ContainsKey($SystemId)) {
    Write-Error "System $SystemId not found."
    exit 1
}

$sys = $systems[$SystemId]
Write-Host "Action: $Action on $($sys.name)"

if ($Action -eq "Restart") {
    Invoke-Expression $sys.stop
    Start-Sleep -Seconds 2
    Invoke-Expression $sys.start
} elseif ($Action -eq "Start") {
    Invoke-Expression $sys.start
} elseif ($Action -eq "Stop") {
    Invoke-Expression $sys.stop
}


