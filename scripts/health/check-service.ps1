# Generic Service Health Check Script
# Version: 1.0

param(
    [string]$ServiceName,
    [string]$ExpectedStatus = "Running"
)

try {
    $service = Get-Service -Name $ServiceName -ErrorAction Stop
    
    if ($service.Status -eq $ExpectedStatus) {
        $result = @{
            ok        = $true
            service   = $ServiceName
            status    = $service.Status.ToString()
            timestamp = (Get-Date).ToString("o")
        }
    }
    else {
        $result = @{
            ok        = $false
            service   = $ServiceName
            status    = $service.Status.ToString()
            error     = "Service in unexpected state"
            timestamp = (Get-Date).ToString("o")
        }
    }
}
catch {
    $result = @{
        ok        = $false
        service   = $ServiceName
        error     = $_.Exception.Message
        timestamp = (Get-Date).ToString("o")
    }
}

$result | ConvertTo-Json -Compress
