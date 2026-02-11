param(
    [switch]$IncludeOptional = $true,
    [switch]$JsonOutput = $false,
    [switch]$AutoHeal = $false,
    [switch]$Brief = $false
)

# $ErrorActionPreference = "SilentlyContinue"
$ScopeYaml = "C:\UCONAI-LLM\config\scope.yaml"

# 1. Fast Port Check (0.5s Timeout)
function Test-Port {
    param($UriStr)
    try {
        $uri = [Uri]$UriStr
        $tcp = New-Object Net.Sockets.TcpClient
        if ($tcp.ConnectAsync($uri.Host, $uri.Port).Wait(500)) {
            $tcp.Close()
            return $true
        }
    }
    catch {}
    return $false
}

# 2. Scope ?�싱
function Get-SystemScope {
    param([string]$SystemId)
    if (-not (Test-Path $ScopeYaml)) { return "observe" } # Default safe
    $content = Get-Content $ScopeYaml
    $currentScope = $null
    foreach ($line in $content) {
        if ($line -match '^\s+manage:') { $currentScope = 'manage' }
        elseif ($line -match '^\s+observe:') { $currentScope = 'observe' }
        elseif ($line -match '^\s+deny:') { $currentScope = 'deny' }
        elseif ($currentScope -and $line -match "- `"$SystemId`"") { return $currentScope }
    }
    return "observe"
}

# 3. Systems Definition
$systems = @(
    @{ id = "dcp-control-plane"; name = "DCP Gateway"; type = "http"; url = "http://localhost:18789/health" },
    @{ id = "dcp-execution-plane"; name = "DCP Controller"; type = "http"; url = "http://localhost:18088" },
    @{ id = "uconai-bridge"; name = "AI Bridge"; type = "http"; url = "http://localhost:18081/health" },
    @{ id = "uconai-frontend"; name = "Frontend"; type = "http"; url = "http://localhost:5173" },
    @{ id = "infotech-monitor"; name = "Infotech TS"; type = "process"; process = "iftExWeb" },
    @{ id = "finger-monitor"; name = "Finger TS"; type = "process"; process = "fswss" },
    @{ id = "ked-monitor"; name = "KED TS"; type = "process"; process = "FindAgent" },
    @{ id = "gdc-server"; name = "GDC Server"; type = "process"; process = "KSAC007" },
    @{ id = "tms-server"; name = "TMS Server"; type = "process"; process = "KSAF002" },
    @{ id = "pms-server"; name = "PMS Server"; type = "process"; process = "wpmsvc" },
    @{ id = "workstation-monitor"; name = "Workstation"; type = "process"; process = "winlogon" }
)

# 4. 결과 ?�집
$finalResults = @()

foreach ($sys in $systems) {
    $scope = Get-SystemScope -SystemId $sys.id
    $status = "FAIL"
    $message = "Offline"
    $uptime = "0s"
    $load = 0

    $systemPid = 0
    try {
        if ($sys.type -eq "http") {
            try {
                $check = Invoke-WebRequest -Uri $sys.url -Method Get -TimeoutSec 1 -ErrorAction Stop
                $status = "OK"; $message = "Running"; $uptime = "0s"
                # Find PID by port
                $uri = [Uri]$sys.url
                $port = $uri.Port
                $netstat = netstat -ano | Select-String ":$port\s+.*LISTENING"
                if ($netstat) {
                    $systemPid = [int]($netstat.ToString().Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)[-1])
                }
            }
            catch {
                $status = "FAIL"; $message = "Offline"; $uptime = "0s"
            }
        }
        elseif ($sys.type -eq "process") {
            $proc = Get-Process -Name $sys.process -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($proc) { 
                $status = "OK"; $message = "Running"
                $systemPid = $proc.Id
                $now = Get-Date
                $diff = $now - $proc.StartTime
                $uptime = "$([int]$diff.TotalSeconds)s"
            }
            else {
                $status = "FAIL"; $message = "Not found"; $uptime = "0s"; $systemPid = 0
            }
        }
    }
    catch {
        $status = "FAIL"; $message = $_.Exception.Message; $uptime = "0s"; $systemPid = 0
    }

    $finalResults += @{
        id     = $sys.id
        name   = $sys.name
        scope  = $scope
        result = @{
            ok = ($status -eq "OK"); status = $status
            message = $message
            uptime = $uptime
            cpu = $load
            pid = $systemPid
        }
    }
}

# 5. JSON 출력 (??번에!)
if ($JsonOutput) {
    $cpuLoad = [int](Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
    $os = Get-CimInstance Win32_OperatingSystem
    $memUsage = [int](100 - ($os.FreePhysicalMemory / $os.TotalVisibleMemorySize * 100))

    @{
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        cpu       = $cpuLoad
        memory    = $memUsage
        systems   = $finalResults
    } | ConvertTo-Json -Depth 4
}
else {
    foreach ($r in $finalResults) {
        $c = if ($r.result.status -eq "OK") { "Green" } else { "Red" }
        Write-Host "[$($r.scope)] $($r.name): $($r.result.status)" -ForegroundColor $c
    }
}


