param(
  [Parameter(Mandatory=$true)][string]$ProjectKey,
  [Parameter(Mandatory=$true)][string]$Term,
  [string]$VaultRoot = "C:\UCONAI-Vault\context7",
  [int]$TopN = 20
)

$ErrorActionPreference="Stop"

$indexRoot = Join-Path $VaultRoot "index\$ProjectKey"
$snipPath = Join-Path $indexRoot ("snips__" + ($Term -replace "[^a-zA-Z0-9_-]","_") + ".json")
if (!(Test-Path $snipPath)) { throw "Missing snips: $snipPath" }

$sn = Get-Content $snipPath -Raw | ConvertFrom-Json

# --- 1) dedup snippets by normalized text fingerprint ---
function Normalize([string]$s) {
  if (!$s) { return "" }
  $t = $s.ToLowerInvariant()
  $t = $t -replace "\\u0027","'"          # common escapes
  $t = $t -replace "\\n"," " -replace "\s+"," "
  $t = $t -replace "[^a-z0-9/_\-\s]"," "  # keep url-ish and tokens
  $t = $t -replace "\s+"," "
  return $t.Trim()
}

$seen = @{}
$dedup = New-Object System.Collections.Generic.List[object]

foreach ($x in $sn.snips) {
  $norm = Normalize $x.snippet
  if ($norm.Length -gt 320) { $norm = $norm.Substring(0,320) }  # fingerprint window
  if ($seen.ContainsKey($norm)) { continue }
  $seen[$norm] = $true
  $dedup.Add($x) | Out-Null
}

# --- 2) token extraction from dedup snippets ---
$stop = @(
  "the","and","or","to","of","a","in","for","with","on","is","are","as","it","this","that","be","by",
  "from","at","an","after","before","when","then","into","out","your","you","we","they","their","our",
  "function","example","examples","source","describes","shows","called","export","default","runtime"
) | ForEach-Object { $_.ToLowerInvariant() }

$stopSet = @{}
foreach ($w in $stop) { $stopSet[$w]=$true }

$freq = @{}

foreach ($x in $dedup) {
  $norm = Normalize $x.snippet
  # split into tokens
  $tokens = $norm -split "\s+"
  foreach ($tok in $tokens) {
    if ($tok.Length -lt 4) { continue }
    if ($stopSet.ContainsKey($tok)) { continue }
    if ($tok -match "^\d+$") { continue }
    if (!$freq.ContainsKey($tok)) { $freq[$tok]=0 }
    $freq[$tok] += 1
  }
}

# --- 3) pick top tokens, but bias toward meaningful dev terms ---
$boost = @(
  "matcher","matchers","cookies","headers","authorization","redirect","rewrite","nextresponse","nextrequest",
  "edge","nodejs","env","dotenv","dependencies","cleanup","strict","objectis","uselayouteffect","memo","callback"
)

foreach ($b in $boost) {
  if ($freq.ContainsKey($b)) { $freq[$b] += 3 }
}

$top = $freq.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First $TopN

# --- 4) build query suggestions (term + top tokens) ---
$suggestions = New-Object System.Collections.Generic.List[string]

# Base expansions that almost always help for these terms
if ($Term.ToLowerInvariant() -eq "middleware") {
  @(
    "middleware matcher",
    "middleware NextRequest NextResponse",
    "middleware cookies headers authorization",
    "middleware redirect rewrite",
    "middleware edge runtime limitations"
  ) | ForEach-Object { $suggestions.Add($_) | Out-Null }
}

if ($Term.ToLowerInvariant() -eq "useeffect") {
  @(
    "useEffect dependencies Object.is",
    "useEffect cleanup function",
    "useEffect Strict Mode double invoke",
    "useEffect vs useLayoutEffect",
    "useEffect infinite loop patterns"
  ) | ForEach-Object { $suggestions.Add($_) | Out-Null }
}

foreach ($kv in $top) {
  $t = [string]$kv.Name
  if ($t -match "^(http|https)$") { continue }
  if ($t -match "github\.com|react\.dev|vercel") { continue }
  # build a query phrase
  $suggestions.Add(($Term + " " + $t)) | Out-Null
}

# uniq suggestions
$uniq = @{}
$final = New-Object System.Collections.Generic.List[string]
foreach ($s in $suggestions) {
  $k = $s.ToLowerInvariant().Trim()
  if ($uniq.ContainsKey($k)) { continue }
  $uniq[$k]=$true
  $final.Add($s) | Out-Null
}

$out = [ordered]@{
  generatedAt = (Get-Date).ToString("o")
  projectKey = $ProjectKey
  term = $Term
  snipsTotal = ($sn.snips | Measure-Object).Count
  snipsDedup = $dedup.Count
  topTokens = @($top | ForEach-Object { [ordered]@{ token=$_.Name; score=$_.Value } })
  suggestions = $final
}

$outPath = Join-Path $indexRoot ("suggest__" + ($Term -replace "[^a-zA-Z0-9_-]","_") + ".json")
$out | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $outPath

Write-Host "SUGGEST DONE" -ForegroundColor Green
Write-Host ("snips: " + $out.snipsTotal + " -> dedup: " + $out.snipsDedup)
Write-Host ("out: " + $outPath)
