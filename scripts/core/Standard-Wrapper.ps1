# DCP Standard System Wrapper (DCPW)
param(
    [Parameter(Mandatory = $true)] [string]$SystemId,
    [Parameter(Mandatory = $true)] [string]$Action,
    [Parameter(Mandatory = $false)] [string]$ScriptPath
)

$systems = @{
    "dcp-control-plane"   = @{ name = "DCP Gateway"; start = "node C:\Users\user\AppData\Roaming\npm\node_modules\openclaw\openclaw.mjs gateway run --port 18789"; pattern = "*openclaw*gateway*" }
    "openclaw-gateway"    = @{ name = "DCP Gateway"; start = "node C:\Users\user\AppData\Roaming\npm\node_modules\openclaw\openclaw.mjs gateway run --port 18789"; pattern = "*openclaw*gateway*" }
    "dcp-execution-plane" = @{ name = "DCP Controller"; start = "powershell -NoProfile -ExecutionPolicy Bypass -File C:\OpenClaw\controller\openclaw_controller.ps1 -Port 17777"; pattern = "*openclaw_controller.ps1*" }
    "openclaw-controller" = @{ name = "DCP Controller"; start = "powershell -NoProfile -ExecutionPolicy Bypass -File C:\OpenClaw\controller\openclaw_controller.ps1 -Port 17777"; pattern = "*openclaw_controller.ps1*" }
    "uconai-bridge"       = @{ name = "UCONAI AI Bridge"; start = "node C:\OpenClaw\controller\ai-bridge.js"; pattern = "*ai-bridge.js*" }
    "uconai-frontend"     = @{ name = "UCONAI Frontend"; start = "node node_modules\vite\bin\vite.js --host 0.0.0.0 --port 5500"; pattern = "*vite*"; cwd = "C:\UCONAI-LLM\frontend" }
    "adobe-photoshop"     = @{ name = "Adobe Photoshop 2022"; start = "Start-Process 'C:\Program Files\Adobe\Adobe Photoshop 2022\Photoshop.exe'"; pattern = "Photoshop.exe" }
    "adobe-illustrator"   = @{ name = "Adobe Illustrator 2022"; start = "Start-Process 'C:\Program Files\Adobe\Adobe Illustrator 2022\Support Files\Contents\Windows\Illustrator.exe'"; pattern = "Illustrator.exe" }
    "ms-word"             = @{ name = "Microsoft Word"; start = "Start-Process 'winword.exe'"; pattern = "WINWORD.EXE" }
    "ms-excel"            = @{ name = "Microsoft Excel"; start = "Start-Process 'excel.exe'"; pattern = "EXCEL.EXE" }
    "ms-powerpoint"       = @{ name = "Microsoft PowerPoint"; start = "Start-Process 'powerpnt.exe'"; pattern = "POWERPNT.EXE" }
    "hancom-office"       = @{ name = "한글 (Hancom Office)"; start = "Start-Process 'C:\Program Files (x86)\HNC\Office NEO\HOffice96\Bin\Hwp.exe' -ErrorAction Stop"; pattern = "Hwp.exe" }
    "infotech-monitor"    = @{ name = "Infotech TS"; start = "Start-Process 'C:\infotech\iftNxService\iftExWeb.exe' -WorkingDirectory 'C:\infotech\iftNxService' -WindowStyle Hidden"; pattern = "iftExWeb*" }
    "finger-monitor"      = @{ name = "Finger TS"; start = "Start-Process 'C:\Finger\FSWSS\fswss.exe' -WorkingDirectory 'C:\Finger\FSWSS' -WindowStyle Hidden"; pattern = "fswss*" }
    "ked-monitor"         = @{ name = "KED TS"; start = "Start-Process 'C:\KED\FindAgent\FindAgent.exe' -WorkingDirectory 'C:\KED\FindAgent' -WindowStyle Hidden"; pattern = "FindAgent*" }
    "tms-server"          = @{ name = "TMS Server"; start = "Start-Process 'C:\KWIC\KISS\KSAF002.exe' -WorkingDirectory 'C:\KWIC\KISS'"; pattern = "KSAF002*" }
    "pms-server"          = @{ name = "PMS Server"; start = "Start-Process 'wpmsvc.exe' -WindowStyle Hidden"; pattern = "wpmsvc*" }
    "workstation-monitor" = @{ name = "Workstation Monitor"; start = "Write-Host 'Refreshed'"; pattern = "winlogon" }
    "antigravity-agent"   = @{ name = "Antigravity Agent"; start = "DETACHED:C:\Users\user\AppData\Local\Programs\Antigravity\Antigravity.exe"; pattern = "Antigravity.exe" }
}

function Stop-System($pattern) {
    Get-CimInstance Win32_Process | Where-Object { ($_.CommandLine -like $pattern) -or ($_.Name -like $pattern) } | Where-Object { $_.ProcessId -ne $PID } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

$sys = $systems[$SystemId]
if (-not $sys) {
    $registryPath = "C:\OpenClaw\controller\system-registry.json"
    if (Test-Path $registryPath) {
        $registry = Get-Content $registryPath -Raw | ConvertFrom-Json
        $found = $registry.apps | Where-Object { $_.id -eq $SystemId -or $_.name -like "*$SystemId*" } | Select-Object -First 1
        if ($found) {
            $sys = @{
                name    = $found.name
                start   = "Start-Process '$($found.exec)'"
                pattern = "*$($found.name)*"
            }
        }
    }
}

if (-not $sys) {
    Write-Error "SystemId $SystemId not found in static list or registry."
    exit 1
}

if ($Action -eq "Restart" -or $Action -eq "Stop") {
    Write-Host "Stopping $($sys.name)..."
    Stop-System $sys.pattern
    Start-Sleep -Seconds 1
}

if ($Action -eq "Restart" -or $Action -eq "Start") {
    Write-Host "Starting $($sys.name)..."
    if ($sys.start -like "DETACHED:*") {
        $path = $sys.start.Replace("DETACHED:", "")
        $dir = Split-Path $path -Parent
        $WshShell = New-Object -ComObject WScript.Shell
        # start command requires a title string "" before the path if path is quoted
        $WshShell.Run("cmd /c start `"`" /d `"$dir`" `"$path`"", 0, $false)
    }
    elseif ($sys.start -match "Start-Process") {
        Invoke-Expression $sys.start
    }
    else {
        $startParams = @{
            FilePath     = "powershell"
            ArgumentList = "-NoProfile -Command `"$($sys.start)`""
            WindowStyle  = "Hidden"
        }
        if ($sys.cwd) { $startParams.WorkingDirectory = $sys.cwd }
        Start-Process @startParams
    }
}

if ($Action -eq "Script") {
    if (Test-Path $ScriptPath) {
        if ($SystemId -like "*photoshop*") {
            Write-Host "Executing Photoshop Script: $ScriptPath"
            Start-Process "C:\Program Files\Adobe\Adobe Photoshop 2022\Photoshop.exe" -ArgumentList "`"$ScriptPath`""
        }
        elseif ($SystemId -like "*illustrator*") {
            Write-Host "Executing Illustrator Script: $ScriptPath"
            Start-Process "C:\Program Files\Adobe\Adobe Illustrator 2022\Support Files\Contents\Windows\Illustrator.exe" -ArgumentList "`"$ScriptPath`""
        }
    }
    else {
        Write-Error "Script path $ScriptPath not found."
        exit 1
    }
}
exit 0
