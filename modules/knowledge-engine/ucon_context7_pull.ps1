param(
  [string]$LibraryName = "",
  [string]$LibraryId = "",
  [string]$Query = "overview",
  [string]$VaultRoot = "C:\UCONAI-Vault\context7",
  [string]$ApiKey = $env:CONTEXT7_API_KEY
)

$ErrorActionPreference = "Stop"
if (!$ApiKey) { throw "CONTEXT7_API_KEY missing" }

$headers = @{ Authorization = "Bearer $ApiKey" }
$libId = ""

# Direct pull with exact libraryId (skip search)
if ($LibraryId) {
  $libId = $LibraryId
  Write-Host "DIRECT MODE: Using LibraryId=$libId" -ForegroundColor Cyan
}
# Search mode (legacy)
elseif ($LibraryName) {
  $searchUrl = "https://context7.com/api/v2/libs/search?libraryName=$([uri]::EscapeDataString($LibraryName))"
  $search = Invoke-RestMethod -Uri $searchUrl -Headers $headers -Method GET
    
  if (!$search.results -or $search.results.Count -lt 1) {
    throw "No results for libraryName=$LibraryName"
  }
    
  # best match = first
  $lib = $search.results[0]
  $libId = [string]$lib.id
  Write-Host "SEARCH MODE: LibraryName=$LibraryName -> Selected ID=$libId" -ForegroundColor Yellow
}
else {
  throw "Must provide either -LibraryId or -LibraryName"
}

# 2) Context
$encId = [uri]::EscapeDataString($libId)
$encQ = [uri]::EscapeDataString($Query)
$ctxUrl = "https://context7.com/api/v2/context?libraryId=$encId&query=$encQ"

$ctx = Invoke-RestMethod -Uri $ctxUrl -Headers $headers -Method GET

# 3) Save to Vault raw
$safeKey = ($libId -replace "^/", "") -replace "[/\\:<>|?*]" , "_"
$rawRoot = Join-Path $VaultRoot "raw\$safeKey"
New-Item -ItemType Directory -Force -Path $rawRoot | Out-Null

$meta = @{
  fetchedAt   = (Get-Date).ToString("o")
  libraryName = $LibraryName
  libraryId   = $libId
  query       = $Query
  source      = "context7"
  api         = "https://context7.com/api/v2/context"
}
$meta | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 (Join-Path $rawRoot "_pull_meta.json")

# Save context payload (query-based file name)
$qSafe = ($Query -replace "[/\\:<>|?*"" ]", "_")
$outFile = "context__" + $qSafe + ".json"
$outPath = Join-Path $rawRoot $outFile
$ctx | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $outPath

Write-Host "PULL DONE" -ForegroundColor Green
Write-Host "raw: $rawRoot"
Write-Host ("files: _pull_meta.json, " + $outFile)
Write-Host ("Next: run pipeline -> ProjectKey=" + $safeKey)
