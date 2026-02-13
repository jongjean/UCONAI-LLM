param(
  [string]$ConfigPath = "C:\UCONAI-LLM\config\context7_queries.json",
  [string]$VaultRoot = "C:\UCONAI-Vault\context7",
  [string]$ApiKey = $env:CONTEXT7_API_KEY
)

$ErrorActionPreference="Stop"

if (!(Test-Path $ConfigPath)) { throw "Config not found: $ConfigPath" }
if (!$ApiKey) { throw "CONTEXT7_API_KEY missing" }

$config = Get-Content $ConfigPath -Raw | ConvertFrom-Json

foreach ($libName in $config.PSObject.Properties.Name) {

    Write-Host ""
    Write-Host "===============================" -ForegroundColor Cyan
    Write-Host "LIBRARY: $libName" -ForegroundColor Cyan
    Write-Host "===============================" -ForegroundColor Cyan

    $queries = $config.$libName

    foreach ($q in $queries) {

        Write-Host ""
        Write-Host ("Pulling: " + $q) -ForegroundColor Yellow

        powershell -ExecutionPolicy Bypass -File `
        C:\UCONAI-LLM\scripts\ucon_context7_pull.ps1 `
        -LibraryName $libName `
        -Query $q `
        -VaultRoot $VaultRoot `
        -ApiKey $ApiKey
    }

    # derive projectKey from search result (same logic as pull script)
    $headers = @{ Authorization = "Bearer $ApiKey" }
    $searchUrl = "https://context7.com/api/v2/libs/search?libraryName=$([uri]::EscapeDataString($libName))"
    $search = Invoke-RestMethod -Uri $searchUrl -Headers $headers -Method GET
    $libId = [string]$search.results[0].id
    $safeKey = ($libId -replace "^/","") -replace "[/\\:<>|?*]" , "_"

    Write-Host ""
    Write-Host ("Running pipeline for: " + $safeKey) -ForegroundColor Green

    powershell -ExecutionPolicy Bypass -File `
    C:\UCONAI-LLM\scripts\ucon_pipeline_run.ps1 `
    -ProjectKey $safeKey
}

Write-Host ""
Write-Host "RUNPACK COMPLETE" -ForegroundColor Green
