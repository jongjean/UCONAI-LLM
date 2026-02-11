# DCP Autonomous Controller
# Chapter 6-2: ?ìœ¨ ë³µêµ¬ ?µí•©
# 
# ???¤í¬ë¦½íŠ¸??AI(SLM)???ë‹¨ê²°ê³¼ë¥??¤ì œ ë³µêµ¬ ëª…ë ¹(Wrapper)?¼ë¡œ ?„í™˜?˜ì—¬ 
# ?¸ê°„??ê°œì… ?†ëŠ” ?ìœ¨ ê´€?œë? ?„ì„±?©ë‹ˆ??

param(
    [Parameter(Mandatory = $true)] [string]$SystemId,
    [Parameter(Mandatory = $true)] [string]$EventType
)

. "C:\UCONAI-LLM\scripts\utils\Logger.ps1"
New-CorrelationId | Out-Null

Write-DCPLog -Component "AutonomousEngine" -Message "Autonomous decision loop started for $SystemId..." -Level "INFO"

# 1. AI ë¶„ì„ ?”ì²­ (Fine-tuned ëª¨ë¸ ì§€????
Write-DCPLog -Component "AutonomousEngine" -Message "Consulting DCP-SLM-V1-Alpha..."
$analysis = & "C:\UCONAI-LLM\scripts\automation\Invoke-OpenClaw-Analysis.ps1" -SystemId $SystemId -Logs "Real-time context window from Silver Tier..."

# 2. AI ê²°ì •???°ë¥¸ ê°€ì¤‘ì¹˜ ë¶€??ë°??¡ì…˜ ?•ì •
$actionMap = @{
    "RESTART_GATEWAY" = "Restart"
    "RESTART_SERVICE" = "Start"
    "STOP_PROCESS"    = "Stop"
}

$finalAction = $actionMap[$analysis.recommendation]
$confidence = $analysis.confidence

if ($confidence -ge 0.8) {
    Write-DCPLog -Level "SUCCESS" -Component "AutonomousEngine" -Message "AI Decision Confirmed (Conf: $confidence). Action: $finalAction"
    
    # 3. ?œì? ?˜í¼ë¥??µí•œ ?¤ë¬´ ?¤í–‰
    & "C:\UCONAI-LLM\scripts\core\Standard-Wrapper.ps1" -SystemId $SystemId -Action $finalAction
    
    Write-DCPLog -Level "SUCCESS" -Component "AutonomousEngine" -Message "Autonomous Recovery COMPLETED for $SystemId."
}
else {
    Write-DCPLog -Level "WARN" -Component "AutonomousEngine" -Message "Low confidence ($confidence). Escalating to human admin."
}
