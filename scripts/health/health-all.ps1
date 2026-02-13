$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'SilentlyContinue'

$systems = @(
    @{ id = "dcp-control-plane"; name = "DCP Gateway"; pattern = "*openclaw*gateway*" }
    @{ id = "dcp-execution-plane"; name = "DCP Controller"; pattern = "*openclaw_controller.ps1*" }
    @{ id = "uconai-bridge"; name = "AI Bridge"; pattern = "*ai-bridge.js*" }
    @{ id = "uconai-frontend"; name = "Frontend"; pattern = "*vite*" }
    @{ id = "adobe-photoshop"; name = "Photoshop 2022"; pattern = "Photoshop.exe" }
    @{ id = "adobe-illustrator"; name = "Illustrator 2022"; pattern = "Illustrator.exe" }
    @{ id = "ms-word"; name = "MS Word"; pattern = "WINWORD.EXE" }
    @{ id = "ms-excel"; name = "MS Excel"; pattern = "EXCEL.EXE" }
    @{ id = "ms-powerpoint"; name = "MS PowerPoint"; pattern = "POWERPNT.EXE" }
    @{ id = "hancom-office"; name = "Hancom Office"; pattern = "Hwp.exe" }
    @{ id = "infotech-monitor"; name = "Infotech TS"; pattern = "iftExWeb*" }
    @{ id = "finger-monitor"; name = "Finger TS"; pattern = "fswss*" }
    @{ id = "ked-monitor"; name = "KED TS"; pattern = "FindAgent*" }
    @{ id = "tms-server"; name = "TMS Server"; pattern = "KSAF*" }
    @{ id = "pms-server"; name = "PMS Server"; pattern = "wpmsvc*" }
    @{ id = "workstation-monitor"; name = "Workstation"; pattern = "winlogon" }
    @{ id = "antigravity-agent"; name = "Antigravity"; pattern = "Antigravity.exe" }
)

$procs = Get-CimInstance Win32_Process | Select-Object ProcessId, CommandLine, Name, CreationDate
$final = @()

foreach ($sys in $systems) {
    $match = $procs | Where-Object { 
        ($_.Name -like $sys.pattern) -or 
        ($_.CommandLine -like $sys.pattern) -or 
        ($_.Name -eq "$($sys.pattern).exe")
    } | Where-Object { $_.ProcessId -ne $PID } | Select-Object -First 1
    
    $status = "FAIL"; $targetPid = 0; $up = "0s"; $ok = $false
    
    if ($match) {
        $status = "OK"; $targetPid = $match.ProcessId; $ok = $true
        if ($match.CreationDate) {
            try {
                $st = [Management.ManagementDateTimeConverter]::ToDateTime($match.CreationDate)
                $diff = [DateTime]::Now - $st
                $up = "$([int]$diff.TotalSeconds)s"
            }
            catch { $up = "0s" }
        }
    }
    
    $final += @{ id = $sys.id; name = $sys.name; result = @{ ok = $ok; status = $status; uptime = $up; pid = $targetPid } }
}

$report = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    cpu       = [int](Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
    memory    = [int](Get-CimInstance Win32_OperatingSystem | % { 100 - ($_.FreePhysicalMemory / $_.TotalVisibleMemorySize * 100) })
    systems   = $final
}

$report | ConvertTo-Json -Depth 4
