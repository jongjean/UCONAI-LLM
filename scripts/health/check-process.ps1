# Generic Process Health Check Script
# Version: 1.0

param(
    [string]$ProcessName,
    [string]$Pattern = ""
)

$ErrorActionPreference = "Continue"

$processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue

if ($Pattern) {
    $processes = $processes | Where-Object { (Get-Process -Id $_.Id -IncludeUserName -ErrorAction SilentlyContinue).CommandLine -like "*$Pattern*" }
}

if ($processes) {
    $result = @{
        ok        = $true
        process   = $ProcessName
        count     = $processes.Count
        pids      = $processes.Id
        timestamp = (Get-Date).ToString("o")
    }
}
else {
    $result = @{
        ok        = $false
        process   = $ProcessName
        error     = "Process not found"
        timestamp = (Get-Date).ToString("o")
    }
}

$result | ConvertTo-Json -Compress
