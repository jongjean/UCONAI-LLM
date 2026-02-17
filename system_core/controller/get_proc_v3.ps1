
$perf = Get-CimInstance Win32_PerfFormattedData_PerfProc_Process | Where-Object { $_.Name -notmatch 'Idle|_Total|System' }
$proc = Get-Process | Where-Object { $_.Name -notmatch 'Idle|^System$' }

$results = foreach ($p in $proc) {
    try {
        $perfMatch = $perf | Where-Object { $_.IDProcess -eq $p.Id }
        $cpu = 0
        if ($perfMatch) { $cpu = $perfMatch.PercentProcessorTime }
        
        $desc = $p.Description
        if (-not $desc) { $desc = $p.Name }
        
        [PSCustomObject]@{
            Name     = $desc
            CPU      = $cpu
            MemoryMB = [Math]::Round($p.WorkingSet / 1024 / 1024, 0)
        }
    }
    catch {}
}

$grouped = $results | Group-Object Name | ForEach-Object {
    [PSCustomObject]@{
        Name     = $_.Name
        CPU      = ($_.Group | Measure-Object CPU -Sum).Sum
        MemoryMB = ($_.Group | Measure-Object MemoryMB -Sum).Sum
    }
} | Sort-Object MemoryMB -Descending | Select-Object -First 20

$grouped | ConvertTo-Json
