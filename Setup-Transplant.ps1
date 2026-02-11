# UCONAI-LLM New PC Transplant Setup Script
# Run this on a new PC to prepare the environment

$ErrorActionPreference = "SilentlyContinue"

Write-Host "--- UCONAI-LLM System Transplant Initializing ---" -ForegroundColor Cyan

# 1. Create Directory Structure
$paths = @(
    "C:\OpenClaw\controller",
    "C:\Users\$($env:USERNAME)\.openclaw",
    "C:\UCONAI-LLM\system_core"
)

foreach ($p in $paths) {
    if (-not (Test-Path $p)) {
        New-Item -ItemType Directory -Path $p -Force
        Write-Host "[✓] Created: $p"
    }
}

# 2. Link Configs from system_core to User profile
Write-Host "Linking configurations..." -ForegroundColor Yellow
Copy-Item "C:\UCONAI-LLM\system_core\openclaw_config\*" "C:\Users\$($env:USERNAME)\.openclaw\" -Force
Copy-Item "C:\UCONAI-LLM\system_core\controller\*" "C:\OpenClaw\controller\" -Recursive -Force

# 3. Verify External Units
$unitMap = Get-Content "C:\UCONAI-LLM\system_core\external_unit_map.json" | ConvertFrom-Json
Write-Host "`n--- External Unit Status Check ---" -ForegroundColor Cyan
foreach ($name in $unitMap.PSObject.Properties.Name) {
    $path = $unitMap.$name
    $status = if (Test-Path $path) { "Found" } else { "NOT FOUND" }
    $color = if ($status -eq "Found") { "Green" } else { "Red" }
    Write-Host "[$name] Path: $path -> $status" -ForegroundColor $color
}

Write-Host "`nTransplant Setup Complete. Restart Dashboard to finalize." -ForegroundColor Green
