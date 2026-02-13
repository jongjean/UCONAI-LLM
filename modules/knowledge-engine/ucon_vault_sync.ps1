param(
  [string]$ProjectKey,
  [string]$VaultRoot = "C:\UCONAI-Vault\context7"
)

$ErrorActionPreference="Stop"

function Get-Sha256([string]$path) {
  $sha = [System.Security.Cryptography.SHA256]::Create()
  $bytes = [System.IO.File]::ReadAllBytes($path)
  ($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString("x2") }) -join ""
}

$rawRoot  = Join-Path $VaultRoot "raw\$ProjectKey"
$metaRoot = Join-Path $VaultRoot "meta\$ProjectKey"

if (!(Test-Path $rawRoot)) { throw "Raw path missing: $rawRoot" }
New-Item -ItemType Directory -Force -Path $metaRoot | Out-Null

$now = (Get-Date).ToString("o")

$entries = @()

Get-ChildItem $rawRoot -File | Where-Object {
  $_.Extension -in ".txt",".md",".json"
} | ForEach-Object {

  $hash = Get-Sha256 $_.FullName
  $docId = $_.BaseName

  $meta = [ordered]@{
    docId     = $docId
    path      = "$ProjectKey/$($_.Name)"
    type      = "doc"
    hash      = $hash
    fetchedAt = $now
  }

  $metaPath = Join-Path $metaRoot "$docId.json"
  $meta | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 $metaPath

  $entries += $meta
}

$manifest = [ordered]@{
  source      = "context7"
  project     = [ordered]@{
    projectId  = "context7-cloud"
    projectKey = $ProjectKey
    title      = $ProjectKey
  }
  generatedAt = $now
  entries     = $entries
}

$manifestPath = Join-Path $metaRoot "manifest.json"
$manifest | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $manifestPath

Write-Host "SYNC DONE" -ForegroundColor Green
Write-Host "Files:" $entries.Count
Write-Host "Manifest:" $manifestPath
