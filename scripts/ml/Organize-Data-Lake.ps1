# DCP Data Lake Management Utility
# Chapter 5-2: ?°ì´???ˆì´??êµ¬ì¶• ë°??•ì œ
# 
# ???¤í¬ë¦½íŠ¸???˜ì§‘???°ì´?°ë? Raw -> Bronze -> Silver ê³„ì¸µ?¼ë¡œ ë¶„ë¥˜?˜ê³  
# ?¥ì•  ?„í›„??"?¥ì•  ?ˆë„??Failure Window)" ?°ì´?°ë? ë³„ë„ ì¶”ì¶œ?©ë‹ˆ??

param(
    [string]$SourceFolder = "C:\UCONAI-LLM\ml_data\training",
    [string]$LakeRoot = "C:\UCONAI-LLM\ml_data\lake",
    [int]$ContextWindowMinutes = 10
)

. "C:\UCONAI-LLM\scripts\utils\Logger.ps1"
New-CorrelationId | Out-Null

Write-DCPLog -Component "DataLake" -Message "Organizing Data Lake tiers..." -Level "INFO"

$tiers = @("raw", "bronze_normalized", "silver_failure_windows")
foreach ($tier in $tiers) {
    if (-not (Test-Path (Join-Path $LakeRoot $tier))) { 
        New-Item -Path (Join-Path $LakeRoot $tier) -ItemType Directory | Out-Null 
    }
}

# 1. Raw ?„ì¹´?´ë¹™ (?ë³¸ ë³´ì¡´)
$jsonlFiles = Get-ChildItem -Path $SourceFolder -Filter "*.jsonl"
foreach ($file in $jsonlFiles) {
    Copy-Item $file.FullName -Destination (Join-Path $LakeRoot "raw") -Force
}

# 2. Failure Window ì¶”ì¶œ (Silver Tier)
# ?¥ì• (ERROR/WARN) ë°œìƒ ?œì  ?„í›„ $ContextWindowMinutes ë¶„ì˜ ë¡œê·¸ë¥?ì¶”ì¶œ?˜ì—¬ 
# ëª¨ë¸???¥ì•  ?„ì¡° ì¦ìƒ???™ìŠµ?????ˆê²Œ ?„ì?
Write-DCPLog -Component "DataLake" -Message "Extracting Failure Context Windows..."

foreach ($file in $jsonlFiles) {
    $data = Get-Content $file.FullName | ForEach-Object { $_ | ConvertFrom-Json }
    $errorEvents = $data | Where-Object { $_.level -eq "ERROR" -or $_.level -eq "WARN" }

    foreach ($event in $errorEvents) {
        $eventTime = [DateTime]::Parse($event.timestamp)
        $startTime = $eventTime.AddMinutes(-$ContextWindowMinutes)
        $endTime = $eventTime.AddMinutes($ContextWindowMinutes)

        $windowData = $data | Where-Object {
            $t = [DateTime]::Parse($_.timestamp)
            $t -ge $startTime -and $t -le $endTime
        }

        if ($windowData) {
            $windowId = $event.traceId + "_" + $eventTime.ToString("HHmmss")
            $windowFile = Join-Path $LakeRoot "silver_failure_windows\window_$windowId.jsonl"
            $windowData | ForEach-Object { $_ | ConvertTo-Json -Compress } | Out-File -FilePath $windowFile -Encoding UTF8
        }
    }
}

Write-DCPLog -Level "SUCCESS" -Component "DataLake" -Message "Data Lake organization and Silver tier extraction completed."
