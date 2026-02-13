param(
  [string]$ProjectKey = "verify_test-project",
  [string]$VaultRoot = "C:\UCONAI-Vault\context7"
)

$ErrorActionPreference = "Stop"

$indexRoot = Join-Path $VaultRoot "index\$ProjectKey"
$filesPath = Join-Path $indexRoot "files.json"
$kwPath    = Join-Path $indexRoot "keywords.json"
$rawRoot   = Join-Path $VaultRoot "raw\$ProjectKey"

if (!(Test-Path $filesPath)) { throw "Missing: $filesPath" }
if (!(Test-Path $kwPath))    { throw "Missing: $kwPath" }

$filesObj = Get-Content $filesPath -Raw | ConvertFrom-Json
$kwObj    = Get-Content $kwPath -Raw | ConvertFrom-Json

$files = @($filesObj.files)
$totalBytes = 0
foreach ($f in $files) { $totalBytes += [int64]$f.bytes }

# keyword hits total
$keywordHits = 0
if ($kwObj.keywords) {
  foreach ($k in $kwObj.keywords.PSObject.Properties) { $keywordHits += [int]$k.Value }
}

# suspicious file heuristics (tiny but extendable)
$suspicious = @()
foreach ($f in $files) {
  $full = Join-Path $VaultRoot ("raw\" + $f.path)
  if (!(Test-Path $full)) { continue }

  $text = Get-Content $full -Raw -ErrorAction SilentlyContinue
  if (!$text) { continue }

  # simple signals: secrets-like patterns
  if ($text -match "(?i)(api[_-]?key|secret|token)\s*[:=]\s*['""][^'""]+['""]") {
    $suspicious += [ordered]@{ docId=$f.docId; path=$f.path; reason="Possible hardcoded credential" }
  }
  if ($text -match "(?i)\beval\s*\(") {
    $suspicious += [ordered]@{ docId=$f.docId; path=$f.path; reason="Use of eval()" }
  }
}

# top findings
$top = @()
if ($keywordHits -gt 0) {
  $top += [ordered]@{ severity="medium"; title="Keyword signals detected"; detail="Total keyword hits: $keywordHits" }
}
foreach ($s in $suspicious | Select-Object -First 5) {
  $top += [ordered]@{ severity="high"; title=$s.reason; detail=$s.path }
}

$now = (Get-Date).ToString("o")
$out = [ordered]@{
  generatedAt = $now
  projectKey  = $ProjectKey
  totals      = [ordered]@{
    files = $files.Count
    bytes = $totalBytes
  }
  signals     = [ordered]@{
    keywordHits     = $keywordHits
    suspiciousFiles = $suspicious.Count
  }
  topFindings = $top
}

$outPath = Join-Path $indexRoot "risk_summary.json"
$out | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $outPath

Write-Host "RISK SUMMARY DONE" -ForegroundColor Green
Write-Host ("out: " + $outPath)
