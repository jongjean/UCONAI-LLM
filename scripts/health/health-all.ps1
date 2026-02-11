param(
    [switch]$IncludeOptional = $true,
    [switch]$JsonOutput = $false,
    [switch]$AutoHeal = $false,
    [switch]$Brief = $false
)

$ErrorActionPreference = "SilentlyContinue"
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

# 2. Scope ?뚯떛
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

# 3. ?쒖뒪???뺤쓽 (11媛?
$systems = @(
    @{ id = "dcp-control-plane"; name = "DCP Gateway"; type = "http"; url = "http://localhost:18789/health" },
    @{ id = "dcp-execution-plane"; name = "DCP Controller"; type = "http"; url = "http://localhost:18082" }, # /health-report ???猷⑦듃 ??
    @{ id = "uconai-bridge"; name = "AI Bridge"; type = "http"; url = "http://localhost:18081/health" },
    @{ id = "uconai-frontend"; name = "Frontend"; type = "http"; url = "http://localhost:5173" },
    @{ id = "infotech-monitor"; name = "Infotech TS"; type = "service"; service = "iftExWeb" },
    @{ id = "finger-monitor"; name = "Finger TS"; type = "service"; service = "FingerService" },
    @{ id = "ked-monitor"; name = "KED TS"; type = "service"; service = "KedWeb" },
    @{ id = "gdc-server"; name = "GDC Server"; type = "service"; service = "GDCService" },
    @{ id = "tms-server"; name = "TMS Server"; type = "service"; service = "TMSService" },
    @{ id = "pms-server"; name = "PMS Server"; type = "service"; service = "PMSService" },
    @{ id = "workstation-monitor"; name = "Workstation"; type = "process"; process = "winlogon" }
)

# 4. 寃곌낵 ?섏쭛
$finalResults = @()

foreach ($sys in $systems) {
    $scope = Get-SystemScope -SystemId $sys.id
    $status = "FAIL"
    $message = "Offline"
    $uptime = "0s"
    $load = 0

    try {
        if ($sys.type -eq "http") {
            # 1. Fast TCP Check first
            if (Test-Port $sys.url) {
                $status = "OK"; $message = "Running"; $uptime = "Active"
                # ?곸꽭 泥댄겕???앸왂 (?띾룄 ?꾪빐) - TCP ?곌껐?섎㈃ ??寃껋쑝濡?媛꾩＜
            }
            else {
                $message = "Connection Refused"
            }
        }
        elseif ($sys.type -eq "service") {
            $svc = Get-Service -Name $sys.service -ErrorAction SilentlyContinue
            if ($svc.Status -eq 'Running') { 
                $status = "OK"; $message = "Running"; $uptime = "Active" 
            }
            else {
                $message = "Service Stopped"
            }
        }
        elseif ($sys.type -eq "process") {
            if (Get-Process -Name $sys.process -ErrorAction SilentlyContinue) { 
                $status = "OK"; $message = "Running"; $uptime = "Active" 
            }
        }
    }
    catch {
        $message = $_.Exception.Message
    }

    # ?곕え??Fake Data (?ㅼ젣 ?쒕퉬???놁쓣 ?뚮룄 ?붾㈃ 蹂댁뿬二쇨린 ?꾪븿?) 
    # ?꾨땲?? ?ㅼ젣 ?곹깭瑜?蹂댁뿬二쇰뒗 寃?留욎쓬.

    $finalResults += @{
        id     = $sys.id
        name   = $sys.name
        scope  = $scope
        result = @{
            ok = ($status -eq "OK"); status = $status
            message = $message
            uptime  = $uptime
            cpu     = $load
        }
    }
}

# 5. JSON 異쒕젰 (??踰덉뿉!)
if ($JsonOutput) {
    @{
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        systems   = $finalResults
    } | ConvertTo-Json -Depth 4
}
else {
    foreach ($r in $finalResults) {
        $c = if ($r.result.status -eq "OK") { "Green" } else { "Red" }
        Write-Host "[$($r.scope)] $($r.name): $($r.result.status)" -ForegroundColor $c
    }
}


