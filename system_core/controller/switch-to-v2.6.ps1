# UCONAI M4-4.3: Switch to Hardened Edition (v2.6)
# Objective: Seamless transition to new security layer.

Write-Host ">>> STARTING TRANSITION TO V2.6 (HARDENED) <<<" -ForegroundColor Cyan

# 1. Stop Current Processes
Write-Host "[1/5] Stopping current processes..."
$soak = Get-Process node | Where-Object { $_.CommandLine -like "*audit-soak.js*" }
if ($soak) { $soak.Kill(); Write-Host " - Stopped audit-soak.js" }

$core = Get-Process node | Where-Object { $_.CommandLine -like "*core-logic-v2.js*" }
if ($core) { $core.Kill(); Write-Host " - Stopped core-logic-v2.js" }

# 2. Deploy v2.6
Write-Host "[2/5] Deploying Core v2.6..."
Copy-Item "core-logic-v2.js" "core-logic-v2.5.bak.js" -Force
Copy-Item "core-logic-v2.6.js" "core-logic-v2.js" -Force
Write-Host " - core-logic-v2.js updated to v2.6"

# 3. Start New Controller
Write-Host "[3/5] Starting v2.6 Controller..."
Start-Process node "core-logic-v2.js" -NoNewWindow
Start-Sleep -Seconds 3
Write-Host " - Controller v2.6 is now active on Port 3001"

# 4. Start Dashboard
Write-Host "[4/5] Starting Security Dashboard..."
Start-Process node "dashboard-server.js" -NoNewWindow
Write-Host " - Dashboard is active on http://localhost:3002"

# 5. Run Final Analysis
Write-Host "[5/5] Running 12h Baseline Analysis..."
node audit-analyze-12h.js

Write-Host "`n>>> TRANSITION COMPLETE: UCONAI HARDENED EDITION ACTIVE <<<" -ForegroundColor Green
