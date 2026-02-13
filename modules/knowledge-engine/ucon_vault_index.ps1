param(
  [string]$ProjectKey = "verify_test-project",
  [string]$VaultRoot = "C:\UCONAI-Vault\context7"
)

$ErrorActionPreference = "Stop"

function Get-Sha256([string]$path) {
  $sha = [System.Security.Cryptography.SHA256]::Create()
  $bytes = [System.IO.File]::ReadAllBytes($path)
  ($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString("x2") }) -join ""
}

$rawRoot   = Join-Path $VaultRoot "raw\$ProjectKey"
$metaRoot  = Join-Path $VaultRoot "meta\$ProjectKey"
$indexRoot = Join-Path $VaultRoot "index\$ProjectKey"

if (!(Test-Path $rawRoot)) { throw "Raw path missing: $rawRoot" }
New-Item -ItemType Directory -Force -Path $indexRoot | Out-Null

$now = (Get-Date).ToString("o")

# Load manifest (source of truth)
$manifestPath = Join-Path $metaRoot "manifest.json"
if (!(Test-Path $manifestPath)) { throw "Manifest missing: $manifestPath" }
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json

# 1) files.json
$files = @()
foreach ($e in $manifest.entries) {
  $p = Join-Path $VaultRoot ("raw\" + $e.path)
  if (!(Test-Path $p)) { continue }
  $fi = Get-Item $p
  $files += [ordered]@{
    docId = $e.docId
    path  = $e.path
    hash  = $e.hash
    bytes = $fi.Length
    mtime = $fi.LastWriteTime.ToString("o")
  }
}

$filesObj = [ordered]@{
  generatedAt = $now
  projectKey  = $ProjectKey
  files       = $files
}
$filesObj | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 (Join-Path $indexRoot "files.json")

# 2) keywords.json (very light tokenizer)
$keywords = @{}
$focus = @("TODO","FIXME","HACK","secret","token","password","apikey","CORS","eval","spawn","exec","docker","caddy","nginx","prisma","drizzle","sequelize")

foreach ($f in $files) {
  $full = Join-Path $VaultRoot ("raw\" + $f.path)
  $text = Get-Content $full -Raw -ErrorAction SilentlyContinue
  if (!$text) { continue }

  foreach ($k in $focus) {
    $cnt = ([regex]::Matches($text, [regex]::Escape($k), "IgnoreCase")).Count
    if ($cnt -gt 0) {
      if (!$keywords.ContainsKey($k)) { $keywords[$k] = 0 }
      $keywords[$k] += $cnt
    }
  }
}

$kwObj = [ordered]@{
  generatedAt = $now
  projectKey  = $ProjectKey
  keywords    = $keywords
}
$kwObj | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 (Join-Path $indexRoot "keywords.json")

Write-Host "INDEX DONE" -ForegroundColor Green
Write-Host ("IndexRoot: " + $indexRoot)
Write-Host ("files.json: " + (Join-Path $indexRoot "files.json"))
Write-Host ("keywords.json: " + (Join-Path $indexRoot "keywords.json"))
