param(
    [string]$Query = "",
    [string]$ApiKey = $env:CONTEXT7_API_KEY
)

$ErrorActionPreference = "Stop"

if (!$ApiKey) { 
    return @{ ok = $false; error = "CONTEXT7_API_KEY missing" } | ConvertTo-Json
}

if (!$Query) {
    return @{ ok = $false; error = "Query is empty" } | ConvertTo-Json
}

$headers = @{ Authorization = "Bearer $ApiKey" }
$searchUrl = "https://context7.com/api/v2/libs/search?libraryName=$([uri]::EscapeDataString($Query))"

try {
    $search = Invoke-RestMethod -Uri $searchUrl -Headers $headers -Method GET
    
    if ($search.results) {
        $output = @{
            ok      = $true
            results = $search.results | ForEach-Object {
                @{
                    id          = $_.id
                    name        = $_.name
                    description = $_.description
                    stars       = $_.stars
                }
            }
        }
        $output | ConvertTo-Json -Depth 10
    }
    else {
        @{ ok = $true; results = @() } | ConvertTo-Json
    }
}
catch {
    @{ ok = $false; error = $_.Exception.Message } | ConvertTo-Json
}
