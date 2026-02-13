param(
  [string]$ProjectKey,
  [Parameter(Mandatory=$true)][string]$Term,
  [string]$VaultRoot = "C:\UCONAI-Vault\context7",
  [int]$MaxHits = 50
)

$ErrorActionPreference="Stop"

$rawRoot = Join-Path $VaultRoot "raw\$ProjectKey"
if (!(Test-Path $rawRoot)) { throw "Raw path missing: $rawRoot" }

$hits = New-Object System.Collections.Generic.List[object]

Get-ChildItem $rawRoot -File | Where-Object { $_.Name -like "context__*.json" -or $_.Name -eq "context.json" } | ForEach-Object {
  $file = $_.FullName
  $text = Get-Content $file -Raw -ErrorAction SilentlyContinue
  if (!$text) { return }

  $m = [regex]::Matches($text, [regex]::Escape($Term), "IgnoreCase")
  if ($m.Count -gt 0) {
    $hits.Add([ordered]@{
      file = $_.Name
      count = $m.Count
    }) | Out-Null
  }
}

# Sort by count desc
$sorted = $hits | Sort-Object -Property count -Descending | Select-Object -First $MaxHits

$out = [ordered]@{
  generatedAt = (Get-Date).ToString("o")
  projectKey = $ProjectKey
  term = $Term
  hits = $sorted
}

$indexRoot = Join-Path $VaultRoot "index\$ProjectKey"
New-Item -ItemType Directory -Force -Path $indexRoot | Out-Null
$outPath = Join-Path $indexRoot ("hits__" + ($Term -replace "[^a-zA-Z0-9_-]","_") + ".json")
$out | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $outPath

Write-Host "SEARCH DONE" -ForegroundColor Green
Write-Host ("term: " + $Term)
Write-Host ("out: " + $outPath)
