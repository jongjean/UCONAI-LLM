# DCP Watchdog Monitor
# Chapter 1-4: Watchdog Monitor
# 
# Î™©Ï†Å: Controller Î∞??µÏã¨ ?úÏä§?úÏùò ?ùÏ°¥ Í∞êÏãú Î∞??êÎèô Î≥µÍµ¨
# Ï£ºÍ∏∞: 5Î∂ÑÎßà??Health Check
# Î≥µÍµ¨: ?§Ìå® ???êÎèô ?¨Ïãú??(Scope Í≤ÄÏ¶??µÍ≥º ??

param(
    [switch]$Once = $false,
    [int]$IntervalMinutes = 5,
    [switch]$Install = $false,
    [switch]$Uninstall = $false
)

$ErrorActionPreference = "Continue"

# Í≤ΩÎ°ú ?§Ï†ï
$LogPath = "C:\UCONAI-LLM\logs"
$LogFile = "$LogPath\watchdog_$(Get-Date -Format 'yyyyMMdd').log"
$ScopeYaml = "C:\UCONAI-LLM\config\scope.yaml"

if (-not (Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
}

# Î°úÍ∑∏ ?®Ïàò
function Write-WatchdogLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $logMessage
    
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "Gray" }
    }
    Write-Host $logMessage -ForegroundColor $color
}

# Scope Í≤ÄÏ¶??®Ïàò
function Test-SystemInManageScope {
    param([string]$SystemId)
    
    if (-not (Test-Path $ScopeYaml)) {
        Write-WatchdogLog "Scope file not found: $ScopeYaml" "WARN"
        return $false
    }
    
    $content = Get-Content $ScopeYaml
    $inManage = $false
    $foundSystem = $false
    
    foreach ($line in $content) {
        if ($line -match '^\s+manage:') {
            $inManage = $true
        }
        elseif ($line -match '^\s+(observe|deny):') {
            $inManage = $false
        }
        elseif ($inManage -and $line -match "- `"$SystemId`"") {
            $foundSystem = $true
            break
        }
    }
    
    return $foundSystem
}

# Í∞êÏãú ?Ä???úÏä§???ïÏùò
$WatchTargets = @(
    @{
        id       = "openclaw-controller"
        name     = "OpenClaw Controller"
        type     = "http"
        endpoint = "http://127.0.0.1:18082/health"
        timeout  = 3
        critical = $true
        recovery = "Start-ScheduledTask -TaskName 'OpenClawLocalController'"
    },
    @{
        id       = "openclaw-gateway"
        name     = "OpenClaw Gateway"
        type     = "http"
        endpoint = "http://127.0.0.1:18789/health"
        timeout  = 3
        critical = $true
        recovery = "Start-ScheduledTask -TaskName 'OpenClaw Gateway'"
    },
    @{
        id       = "uconai-bridge"
        name     = "UCONAI AI Bridge"
        type     = "http"
        endpoint = "http://127.0.0.1:18081/health"
        timeout  = 3
        critical = $true
        recovery = "Start-ScheduledTask -TaskName 'UCONAI AI Bridge'"
    }
)

# Health Check ?®Ïàò
function Test-SystemHealth {
    param($Target)
    
    try {
        if ($Target.type -eq "http") {
            $response = Invoke-WebRequest -Uri $Target.endpoint -Method GET -TimeoutSec $Target.timeout -UseBasicParsing -ErrorAction Stop
            return ($response.StatusCode -eq 200)
        }
        elseif ($Target.type -eq "port") {
            $test = Test-NetConnection -ComputerName 127.0.0.1 -Port $Target.port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
            return $test.TcpTestSucceeded
        }
    }
    catch {
        return $false
    }
    
    return $false
}

# ?êÎèô Î≥µÍµ¨ ?®Ïàò
function Invoke-SystemRecovery {
    param($Target)
    
    # Scope Í≤ÄÏ¶?
    $inManageScope = Test-SystemInManageScope -SystemId $Target.id
    if (-not $inManageScope) {
        Write-WatchdogLog "$($Target.name) is not in 'manage' scope. Recovery skipped." "WARN"
        return $false
    }
    
    Write-WatchdogLog "Attempting recovery for $($Target.name)..." "WARN"
    
    try {
        # Î≥µÍµ¨ Î™ÖÎ†π ?§Ìñâ
        Invoke-Expression $Target.recovery -ErrorAction Stop
        Start-Sleep -Seconds 5
        
        # Î≥µÍµ¨ ?ïÏù∏
        $recovered = Test-SystemHealth -Target $Target
        if ($recovered) {
            Write-WatchdogLog "$($Target.name) recovered successfully!" "SUCCESS"
            return $true
        }
        else {
            Write-WatchdogLog "$($Target.name) recovery failed - still unhealthy" "ERROR"
            return $false
        }
    }
    catch {
        Write-WatchdogLog "$($Target.name) recovery error: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Watchdog Î©îÏù∏ Î£®ÌîÑ
function Start-WatchdogLoop {
    Write-WatchdogLog "========================================" "INFO"
    Write-WatchdogLog "DCP Watchdog Monitor Started" "INFO"
    Write-WatchdogLog "Interval: $IntervalMinutes minutes" "INFO"
    Write-WatchdogLog "Targets: $($WatchTargets.Count) systems" "INFO"
    Write-WatchdogLog "========================================" "INFO"
    
    $iteration = 0
    
    while ($true) {
        $iteration++
        Write-WatchdogLog "--- Check Iteration #$iteration ---" "INFO"
        
        $failedSystems = @()
        $recoveredSystems = @()
        
        foreach ($target in $WatchTargets) {
            $healthy = Test-SystemHealth -Target $target
            
            if ($healthy) {
                Write-WatchdogLog "$($target.name): OK" "INFO"
            }
            else {
                Write-WatchdogLog "$($target.name): FAIL" "ERROR"
                $failedSystems += $target
                
                # ?êÎèô Î≥µÍµ¨ ?úÎèÑ
                if ($target.critical) {
                    $recovered = Invoke-SystemRecovery -Target $target
                    if ($recovered) {
                        $recoveredSystems += $target
                    }
                }
            }
        }
        
        # ?îÏïΩ
        if ($failedSystems.Count -eq 0) {
            Write-WatchdogLog "All systems healthy." "SUCCESS"
        }
        else {
            Write-WatchdogLog "Failed: $($failedSystems.Count), Recovered: $($recoveredSystems.Count)" "WARN"
        }
        
        # Once Î™®ÎìúÎ©?1?åÎßå ?§Ìñâ ??Ï¢ÖÎ£å
        if ($Once) {
            Write-WatchdogLog "Watchdog check completed (Once mode)" "INFO"
            break
        }
        
        # ?ÄÍ∏?
        Write-WatchdogLog "Next check in $IntervalMinutes minutes..." "INFO"
        Start-Sleep -Seconds ($IntervalMinutes * 60)
    }
}

# Task Scheduler ?§Ïπò
if ($Install) {
    Write-Host "`n=== Installing Watchdog as Scheduled Task ===" -ForegroundColor Cyan
    
    $TaskName = "DCP Watchdog Monitor"
    $ScriptPath = $PSCommandPath
    
    # Í∏∞Ï°¥ Task ?úÍ±∞
    $oldTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($oldTask) {
        Write-Host "Removing old task..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }
    
    # Task ?ùÏÑ±
    $Action = New-ScheduledTaskAction `
        -Execute "PowerShell.exe" `
        -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ScriptPath`""
    
    $Trigger = New-ScheduledTaskTrigger -AtStartup
    
    $Principal = New-ScheduledTaskPrincipal `
        -UserId $env:USERNAME `
        -LogonType Interactive
    
    $Settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RestartCount 3 `
        -RestartInterval (New-TimeSpan -Minutes 1)
    
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $Action `
        -Trigger $Trigger `
        -Principal $Principal `
        -Settings $Settings `
        -Description "DCP Watchdog - Controller ?ùÏ°¥ Í∞êÏãú Î∞??êÎèô Î≥µÍµ¨ (5Î∂?Ï£ºÍ∏∞)" `
        -Force | Out-Null
    
    Write-Host "Task registered successfully!" -ForegroundColor Green
    Write-Host "`nStarting Watchdog..." -ForegroundColor Green
    Start-ScheduledTask -TaskName $TaskName
    
    Write-Host "`nManagement Commands:" -ForegroundColor Cyan
    Write-Host "  Start:  Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
    Write-Host "  Stop:   Stop-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
    Write-Host "  Status: Get-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
    Write-Host "  Remove: .\Watchdog-Monitor.ps1 -Uninstall`n" -ForegroundColor Gray
    
    exit 0
}

# Task Scheduler ?úÍ±∞
if ($Uninstall) {
    Write-Host "`n=== Uninstalling Watchdog ===" -ForegroundColor Yellow
    
    $TaskName = "DCP Watchdog Monitor"
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    
    if ($task) {
        Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "Watchdog uninstalled." -ForegroundColor Green
    }
    else {
        Write-Host "No task found." -ForegroundColor Gray
    }
    
    exit 0
}

# Î©îÏù∏ ?§Ìñâ
Start-WatchdogLoop
