# UCONAI Self-Healing Engine - Phase 6.1
# Monitors system health and automatically applies recovery rules.

$LOG_PATH = "C:\UCONAI-LLM\logs\self-healing.log"
$RECOVERY_SCRIPT = "C:\UCONAI-LLM\RECOVERY_v1.1.ps1"

function Write-HealLog {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LOG_PATH -Value $LogEntry -ErrorAction SilentlyContinue
}

function Invoke-ImperialHealing {
    Write-HealLog "Starting system health audit..."
    
    $Services = @(
        @{ Name = "Controller"; Port = 18080 },
        @{ Name = "AI-Bridge"; Port = 18081 },
        @{ Name = "Gateway"; Port = 18082 },
        @{ Name = "MCP-Server"; Port = 18083 },
        @{ Name = "Frontend"; Port = 5173 }
    )

    $IssuesFound = $false

    foreach ($Service in $Services) {
        $Port = $Service.Port
        $Check = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        
        if (-not $Check) {
            Write-HealLog "CRITICAL: Service [$($Service.Name)] on Port $Port is DOWN!"
            $IssuesFound = $true
        }
    }

    if ($IssuesFound) {
        Write-HealLog "Initiating automated recovery protocol..."
        try {
            # Execute the official recovery script
            & $RECOVERY_SCRIPT
            Write-HealLog "Restoring services..."
            & "C:\UCONAI-LLM\scripts\ops\Start-All.ps1"
            Write-HealLog "Recovery sequence completed."
        } catch {
            Write-HealLog "ERROR: Automated recovery failed: $_"
        }
    } else {
        Write-HealLog "All imperial systems are optimal."
    }
}

# Ensure log directory exists
New-Item -ItemType Directory -Path (Split-Path $LOG_PATH) -Force | Out-Null

# Run once for the demo/deployment
Invoke-ImperialHealing
