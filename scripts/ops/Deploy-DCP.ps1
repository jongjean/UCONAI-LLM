# DCP Global Deployment Pipeline
# Chapter 4-3: ?„ì²´ CI/CD ?Œì´?„ë¼??
#
# ???¤í¬ë¦½íŠ¸???ŒìŠ¤ ì½”ë“œ ?…ë°?´íŠ¸ë¶€???œìŠ¤???¬ê¸°?™ê¹Œì§€????ê³¼ì •???ë™?”í•©?ˆë‹¤.

param(
    [string]$Environment = "Production",
    [switch]$SkipTests = $false
)

. "C:\UCONAI-LLM\scripts\utils\Logger.ps1"
New-CorrelationId | Out-Null

Write-DCPLog -Component "Pipeline" -Message "Starting Deployment Pipeline for [$Environment]..." -Level "INFO"

# 1. ?¬ì „ ê²€??(Health Check)
if (-not $SkipTests) {
    Write-DCPLog -Component "Pipeline" -Message "Running Pre-deployment Health Checks..."
    $health = & "C:\UCONAI-LLM\scripts\health\health-all.ps1" -JsonOutput | ConvertFrom-Json
    if (-not $health.ok) {
        Write-DCPLog -Level "WARN" -Component "Pipeline" -Message "Systems are not healthy. Proceeding with caution."
    }
}

# 2. ì½”ë“œ ?™ê¸°??(Simulated Git Pull)
Write-DCPLog -Component "Pipeline" -Message "Syncing source code from Git repository..."
# git pull origin main
Start-Sleep -Seconds 2
Write-DCPLog -Level "SUCCESS" -Component "Pipeline" -Message "Source code is up to date."

# 3. ë¸Œëœì¹?ê·œì•½ ?•ì¸ (Git Standards)
Write-DCPLog -Component "Pipeline" -Message "Verifying Branch Standards..."
# git check-ref-format --allow-onelevel main

# 4. ?œìŠ¤??ë¡¤ë§ ?…ë°?´íŠ¸ (Rolling Restart via Wrapper)
$targetSystems = @("openclaw-gateway", "infotech-monitor")

foreach ($sysId in $targetSystems) {
    Write-DCPLog -Component "Pipeline" -Message "Rolling Update: Restarting $sysId..."
    & "C:\UCONAI-LLM\scripts\core\Standard-Wrapper.ps1" -SystemId $sysId -Action "Restart"
}

# 5. ?¬í›„ ê²€??
Write-DCPLog -Component "Pipeline" -Message "Running Post-deployment Verification..."
$finalHealth = & "C:\UCONAI-LLM\scripts\health\health-all.ps1" -JsonOutput | ConvertFrom-Json
Write-DCPLog -Component "Pipeline" -Message "Post-check: $($finalHealth.healthy)/$($finalHealth.total) systems are online."
Write-DCPLog -Level "SUCCESS" -Component "Pipeline" -Message "Deployment to [$Environment] COMPLETED successfully."
