# DCP Data Pipeline Orchestrator
# Chapter 5-1: ?°ì´???Œì´?„ë¼???¤ê³„ ë°?êµ¬í˜„
# 
# ???¤í¬ë¦½íŠ¸???¬ëŸ¬ ?œìŠ¤?œì˜ ë¡œê·¸?€ ?íƒœ ?°ì´?°ë? ?˜ì§‘?˜ì—¬ 
# AI ?™ìŠµ??ê°€?¥í•œ ?µì¼???¬ë§·(JSONL)?¼ë¡œ ?•ê·œ?”í•©?ˆë‹¤.

param(
    [string]$SourceLogDir = "C:\UCONAI-LLM\logs",
    [string]$ExportDir = "C:\UCONAI-LLM\ml_data\training",
    [switch]$ForceExtract = $false
)

. "C:\UCONAI-LLM\scripts\utils\Logger.ps1"
New-CorrelationId | Out-Null

Write-DCPLog -Component "DataPipeline" -Message "Initiating Data Extraction & Normalization..." -Level "INFO"

if (-not (Test-Path $ExportDir)) { New-Item -Path $ExportDir -ItemType Directory | Out-Null }

# 1. ë¡œê·¸ ?Œì¼ ëª©ë¡ ?•ë³´
$logFiles = Get-ChildItem -Path $SourceLogDir -Filter "dcp_trace_*.log"

foreach ($file in $logFiles) {
    Write-DCPLog -Component "DataPipeline" -Message "Processing: $($file.Name)"
    
    $content = Get-Content $file.FullName
    $processedEntries = @()

    foreach ($line in $content) {
        # Format: [timestamp] [level] [id] [component] message
        if ($line -match "^\[(.*?)\] \[(.*?)\] \[(.*?)\] \[(.*?)\] (.*)$") {
            $entry = @{
                timestamp = $Matches[1]
                level     = $Matches[2]
                traceId   = $Matches[3]
                component = $Matches[4]
                message   = $Matches[5]
                source    = $file.Name
            }
            $processedEntries += $entry
        }
    }

    # 2. JSONL ?¬ë§·?¼ë¡œ ?€??(AI ?™ìŠµ??
    $exportFile = Join-Path $ExportDir "$($file.BaseName).jsonl"
    $processedEntries | ForEach-Object { $_ | ConvertTo-Json -Compress } | Out-File -FilePath $exportFile -Encoding UTF8
}

Write-DCPLog -Level "SUCCESS" -Component "DataPipeline" -Message "Data pipeline execution completed. Normalized data stored in $ExportDir"
