# DCP Data Cleansing & Packaging Utility
# Chapter 5-3: ?°ì´???´ë Œì§?ë°?ìµœì¢… ?¨í‚¤ì§?
# 
# ???¤í¬ë¦½íŠ¸???˜ì§‘???°ì´?°ì—??ì¤‘ë³µ???œê±°?˜ê³  ë¯¼ê° ?•ë³´ë¥?ë§ˆìŠ¤?¹í•˜ë©? 
# ?™ìŠµ???í•©??ìµœì¢… ?°ì´?°ì…‹(Gold Tier)???ì„±?©ë‹ˆ??

param(
    [string]$SilverFolder = "C:\UCONAI-LLM\ml_data\lake\silver_failure_windows",
    [string]$GoldFolder = "C:\UCONAI-LLM\ml_data\lake\gold_training_set",
    [switch]$IncludeFullHistory = $false
)

. "C:\UCONAI-LLM\scripts\utils\Logger.ps1"
New-CorrelationId | Out-Null

Write-DCPLog -Component "DataCleansing" -Message "Initiating final data cleansing & packaging..." -Level "INFO"

if (-not (Test-Path $GoldFolder)) { New-Item -Path $GoldFolder -ItemType Directory | Out-Null }

$windowFiles = Get-ChildItem -Path $SilverFolder -Filter "*.jsonl"
$totalProcessed = 0
$totalDuplicatesRemoved = 0

foreach ($file in $windowFiles) {
    Write-DCPLog -Component "DataCleansing" -Message "Cleansing window: $($file.Name)"
    
    $data = Get-Content $file.FullName | ForEach-Object { $_ | ConvertFrom-Json }
    
    # 1. ì¤‘ë³µ ?œê±° (ë©”ì‹œì§€?€ ?€?„ìŠ¤?¬í”„ê°€ ?™ì¼??ë¡œê·¸ ?œê±°)
    $originalCount = $data.Count
    $uniqueData = $data | Sort-Object timestamp, message -Unique
    $totalDuplicatesRemoved += ($originalCount - $uniqueData.Count)

    # 2. ê°œì¸?•ë³´/ë¯¼ê°?•ë³´ ë§ˆìŠ¤??(?? IP ì£¼ì†Œ, API ???¨í„´)
    $cleansedData = $uniqueData | ForEach-Object {
        $_.message = $_.message -replace '\b\d{1,3}(\.\d{1,3}){3}\b', '[IP_MASKED]'
        $_.message = $_.message -replace 'sk-[a-zA-Z0-9]{20,}', '[API_KEY_MASKED]'
        $_
    }

    # 3. ?¸ì´ì¦??„í„°ë§?(ë¶ˆí•„?”í•œ ?”ë²„ê·¸ì„± ë°˜ë³µ ë¡œê·¸ ?œê±° - ?ˆì‹œ)
    $filteredData = $cleansedData | Where-Object { $_.message -notmatch "Heartbeat sent" }

    # 4. Gold Tier ?€??
    if ($filteredData) {
        $exportFile = Join-Path $GoldFolder "cleansed_$($file.Name)"
        $filteredData | ForEach-Object { $_ | ConvertTo-Json -Compress } | Out-File -FilePath $exportFile -Encoding UTF8
        $totalProcessed++
    }
}

Write-DCPLog -Level "SUCCESS" -Component "DataCleansing" -Message "Cleansing completed. Processed: $totalProcessed windows. Duplicates removed: $totalDuplicatesRemoved."
Write-DCPLog -Component "DataCleansing" -Message "Final training dataset ready in $GoldFolder" -Level "SUCCESS"
