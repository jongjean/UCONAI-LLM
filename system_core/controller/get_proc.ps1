
$procs = Get-CimInstance Win32_PerfFormattedData_PerfProc_Process | Where-Object { $_.Name -notmatch 'Idle|_Total|System' }
$grouped = $procs | ForEach-Object {
    $cleanName = $_.Name -replace '#\d+', ''
    [PSCustomObject]@{
        Name     = $cleanName
        CPU      = $_.PercentProcessorTime
        MemoryMB = [Math]::Round($_.WorkingSet / 1024 / 1024, 0)
    }
} | Group-Object Name | ForEach-Object {
    [PSCustomObject]@{
        Name     = $_.Name
        CPU      = ($_.Group | Measure-Object CPU -Sum).Sum
        MemoryMB = ($_.Group | Measure-Object MemoryMB -Sum).Sum
    }
} | Sort-Object MemoryMB -Descending | Select-Object -First 10

$grouped | ConvertTo-Json
