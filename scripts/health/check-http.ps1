# Generic HTTP Health Check Script
# Version: 1.0

param(
    [string]$Url,
    [int]$ExpectedStatus = 200,
    [int]$TimeoutMs = 3000
)

$ErrorActionPreference = "Stop"

try {
    $startTime = Get-Date
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec ([math]::Max(1, $TimeoutMs / 1000))
    $endTime = Get-Date
    $latency = ($endTime - $startTime).TotalMilliseconds

    if ($response.StatusCode -eq $ExpectedStatus) {
        $result = @{
            ok         = $true
            url        = $Url
            status     = $response.StatusCode
            latency_ms = [math]::Round($latency, 2)
            timestamp  = (Get-Date).ToString("o")
        }
    }
    else {
        $result = @{
            ok        = $false
            url       = $Url
            status    = $response.StatusCode
            error     = "Unexpected status code"
            timestamp = (Get-Date).ToString("o")
        }
    }
}
catch {
    $result = @{
        ok        = $false
        url       = $Url
        error     = $_.Exception.Message
        timestamp = (Get-Date).ToString("o")
    }
}

$result | ConvertTo-Json -Compress
