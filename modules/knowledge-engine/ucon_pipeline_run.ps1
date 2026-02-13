param(
  [string]$ProjectKey = "default_project",
  [string]$ConfigPath = "pipeline.config.json",
  [string]$Action = "Full" # Full, Pull, Process, Search
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot

# 1. Load Configuration
if (-not (Test-Path (Join-Path $ScriptDir $ConfigPath))) {
    Write-Error "Config file not found at $(Join-Path $ScriptDir $ConfigPath)"
}
$Config = Get-Content (Join-Path $ScriptDir $ConfigPath) | ConvertFrom-Json
$VaultRoot = $Config.vault_defaults.root

# 2. Setup Logging
$logDir = Join-Path $VaultRoot "index\$ProjectKey"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
$logPath = Join-Path $logDir "pipeline_v2.3.log"

function LogLine([string]$msg) {
    $ts = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $line = "[$ts] $msg"
    Add-Content -Path $logPath -Value $line
    Write-Host $line -ForegroundColor Cyan
}

LogLine "=========================================================="
LogLine " UCONAI KNOWLEDGE PIPELINE v2.3 START"
LogLine " Project: $ProjectKey | Action: $Action"
LogLine "=========================================================="

# Helper to run sub-scripts
function Run-Step([string]$ScriptName, [hashtable]$Args) {
    $file = Join-Path $ScriptDir $ScriptName
    if (Test-Path $file) {
        LogLine "Executing: $ScriptName ..."
        & powershell.exe -ExecutionPolicy Bypass -File $file @Args | ForEach-Object { LogLine "  > $_" }
    } else {
        LogLine "[SKIP] Script not found: $ScriptName"
    }
}

# 3. Execution Logic
try {
    if ($Action -eq "Full" -or $Action -eq "Pull") {
        Run-Step "ucon_context7_pull.ps1" @{ ProjectKey=$ProjectKey; VaultRoot=$VaultRoot }
    }

    if ($Action -eq "Full" -or $Action -eq "Process") {
        Run-Step "ucon_vault_sync.ps1"   @{ ProjectKey=$ProjectKey; VaultRoot=$VaultRoot }
        Run-Step "ucon_vault_index.ps1"  @{ ProjectKey=$ProjectKey; VaultRoot=$VaultRoot }
        Run-Step "ucon_vault_risk.ps1"   @{ ProjectKey=$ProjectKey; VaultRoot=$VaultRoot }

        # --- Intelligent Snip & Suggest Loop ---
        $kwPath = Join-Path $VaultRoot "index\$ProjectKey\keywords.json"
        if (Test-Path $kwPath) {
            $KWs = Get-Content $kwPath | ConvertFrom-Json
            $TopKWs = $KWs.keywords.PSObject.Properties | Sort-Object Value -Descending | Select-Object -First 3
            
            if ($TopKWs) {
                LogLine "Detected Top Keywords: $($TopKWs.Name -join ', ')"
                foreach ($kw in $TopKWs) {
                    Run-Step "ucon_vault_snip.ps1" @{ ProjectKey=$ProjectKey; VaultRoot=$VaultRoot; Term=$kw.Name }
                    Run-Step "ucon_suggest_queries.ps1" @{ ProjectKey=$ProjectKey; VaultRoot=$VaultRoot; Term=$kw.Name }
                }
            }
        }
    }

    LogLine "=========================================================="
    LogLine " PIPELINE COMPLETE SUCCESSFULLY"
    LogLine "=========================================================="
} catch {
    LogLine "!!! PIPELINE FAILED: $($_.Exception.Message)"
    exit 1
}
