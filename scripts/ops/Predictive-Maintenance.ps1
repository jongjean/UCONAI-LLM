# UCONAI Predictive Maintenance Engine - Phase 6.2
# Analyzes system metrics and logs to predict potential failures.

$LOG_PATH = "C:\UCONAI-LLM\logs\predictive-alerts.log"
$THRESHOLD_CPU = 80
$THRESHOLD_MEM = 85

function Write-PredictiveLog {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    
    $Color = "White"
    if ($Level -eq "WARN") { $Color = "Yellow" }
    
    Write-Host $LogEntry -ForegroundColor $Color
    Add-Content -Path $LOG_PATH -Value $LogEntry -ErrorAction SilentlyContinue
}

function Get-SystemMetrics {
    $CpuLoad = (Get-WmiObject win32_processor | Measure-Object -Property LoadPercentage -Average).Average
    $Mem = Get-WmiObject win32_operatingsystem
    $MemLoad = [math]::Round((($Mem.TotalVisibleMemorySize - $Mem.FreePhysicalMemory) / $Mem.TotalVisibleMemorySize) * 100, 2)
    
    return @{ CPU = $CpuLoad; MEM = $MemLoad }
}

function Search-LogPattern {
    $SelfHealLog = "C:\UCONAI-LLM\logs\self-healing.log"
    if (Test-Path $SelfHealLog) {
        $RecentErrors = Get-Content $SelfHealLog -Tail 10 | Where-Object { $_ -match "CRITICAL|ERROR" }
        return $RecentErrors.Count
    }
    return 0
}

function Test-ImperialHealth {
    Write-PredictiveLog "Starting predictive health analysis..."
    
    $Metrics = Get-SystemMetrics
    Write-PredictiveLog "Current Metrics -> CPU: $($Metrics.CPU)%, MEM: $($Metrics.MEM)%"
    
    $ErrorFrequency = Search-LogPattern
    Write-PredictiveLog "Recent error count (Last 10 entries): $ErrorFrequency"

    # Prediction Logic
    if ($Metrics.CPU -gt $THRESHOLD_CPU -or $Metrics.MEM -gt $THRESHOLD_MEM) {
        Write-PredictiveLog "PREDICTION: Resource exhaustion imminent! Recommend baseline check." "WARN"
    }

    if ($ErrorFrequency -gt 3) {
        Write-PredictiveLog "PREDICTION: High frequency of failures detected. Internal instability likely." "WARN"
    }

    if ($Metrics.CPU -le $THRESHOLD_CPU -and $Metrics.MEM -le $THRESHOLD_MEM -and $ErrorFrequency -le 3) {
        Write-PredictiveLog "Predictive status: System stability is high. No immediate threats detected."
    }
}

# Ensure log directory exists
New-Item -ItemType Directory -Path (Split-Path $LOG_PATH) -Force | Out-Null

# Run Analysis
Test-ImperialHealth
