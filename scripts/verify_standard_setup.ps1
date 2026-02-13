# UCONAI 2.0 - Standard Setup Verification (M 2.2-1)
# Verifies that folders, configs, and connectors are set up according to the v2.2 Master Plan.

$ErrorActionPreference = "Stop"

Write-Host "== UCONAI 2.0 Standard Setup Verification ==" -ForegroundColor Cyan

# 1. Folder Isolation Check
$vaultPaths = @(
    "C:\UCONAI-Vault\context7\raw",
    "C:\UCONAI-Vault\context7\meta",
    "C:\UCONAI-Vault\context7\index"
)

Write-Host "`n[1] Checking Vault Isolation..." -ForegroundColor White
foreach ($p in $vaultPaths) {
    if (Test-Path $p) {
        Write-Host "  OK: $p" -ForegroundColor Green
    } else {
        Write-Host "  FAIL: $p missing" -ForegroundColor Red
    }
}

# 2. Connector Scaffolding Check
$connectorFiles = @(
    "C:\UCONAI-LLM\connectors\context7\package.json",
    "C:\UCONAI-LLM\connectors\context7\index.js",
    "C:\UCONAI-LLM\connectors\context7\context7.config.json"
)

Write-Host "`n[2] Checking Connector Scaffolding..." -ForegroundColor White
foreach ($f in $connectorFiles) {
    if (Test-Path $f) {
        Write-Host "  OK: $f" -ForegroundColor Green
    } else {
        Write-Host "  FAIL: $f missing" -ForegroundColor Red
    }
}

# 3. Security/Env Check
Write-Host "`n[3] Checking Security/Env..." -ForegroundColor White
if (Test-Path "C:\UCONAI-LLM\.env.example") {
    Write-Host "  OK: .env.example exists" -ForegroundColor Green
} else {
    Write-Host "  WARN: .env.example missing" -ForegroundColor Yellow
}

# 4. Pipeline Readiness Test (Mock Pull)
Write-Host "`n[4] Testing Pipeline Readiness (Smoke Test)..." -ForegroundColor White
try {
    cd C:\UCONAI-LLM\connectors\context7
    $output = node index.js "/verify/test-project"
    Write-Host "  Connector Output: $output" -ForegroundColor Green
    
    if (Test-Path "C:\UCONAI-Vault\context7\meta\verify_test-project\manifest.json") {
        Write-Host "  OK: Manifest created in Vault meta successfully." -ForegroundColor Green
    } else {
        Write-Host "  FAIL: Manifest not found." -ForegroundColor Red
    }
} catch {
    Write-Host "  FAIL: Connector script errored - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n== Verification Complete ==" -ForegroundColor Cyan
