param(
  [Parameter(Mandatory=$true)][string]$ProjectKey,
  [Parameter(Mandatory=$true)][string]$Term,
  [string]$VaultRoot = "C:\UCONAI-Vault\context7",
  [int]$ContextChars = 220,
  [int]$MaxSnips = 15
)

$ErrorActionPreference="Stop"

Write-Host "SNIP START" -ForegroundColor Cyan
Write-Host ("ProjectKey: " + $ProjectKey)
Write-Host ("Term: " + $Term)

$rawRoot = Join-Path $VaultRoot "raw\$ProjectKey"
Write-Host ("RawRoot: " + $rawRoot)

if (!(Test-Path $rawRoot)) { throw "Raw path missing: $rawRoot" }

$files = Get-ChildItem $rawRoot -File | Where-Object { $_.Name -like "context__*.json" -or $_.Name -eq "context.json" }
Write-Host ("Files matched: " + $files.Count)

$snips = New-Object System.Collections.Generic.List[object]

foreach ($f in $files) {
  $name = $f.Name
  $text = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
  if (!$text) { continue }

  $matches = [regex]::Matches($text, [regex]::Escape($Term), "IgnoreCase")
  if ($matches.Count -eq 0) { continue }

  foreach ($m in $matches) {
    $start = [Math]::Max(0, $m.Index - $ContextChars)
    $len   = [Math]::Min($text.Length - $start, ($ContextChars*2 + $m.Length))
    $frag  = $text.Substring($start, $len)

    $snips.Add([ordered]@{
      file = $name
      index = $m.Index
      snippet = $frag
    }) | Out-Null

    if ($snips.Count -ge $MaxSnips) { break }
  }

  if ($snips.Count -ge $MaxSnips) { break }
}

Write-Host ("Snips collected: " + $snips.Count)

$out = [ordered]@{
  generatedAt = (Get-Date).ToString("o")
  projectKey = $ProjectKey
  term = $Term
  snips = $snips
}

$indexRoot = Join-Path $VaultRoot "index\$ProjectKey"
New-Item -ItemType Directory -Force -Path $indexRoot | Out-Null

$termSafe = ($Term -replace "[^a-zA-Z0-9_-]","_")
$outPath = Join-Path $indexRoot ("snips__" + $termSafe + ".json")
$out | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $outPath

Write-Host "SNIP DONE" -ForegroundColor Green
Write-Host ("out: " + $outPath)
