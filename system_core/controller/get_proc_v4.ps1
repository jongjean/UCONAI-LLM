
$perf = Get-CimInstance Win32_PerfFormattedData_PerfProc_Process | Where-Object { $_.Name -notmatch '_Total|Idle|System' }
$proc = Get-Process | Where-Object { $_.Name -notmatch 'Idle|^System$' }

$results = foreach ($p in $proc) {
    try {
        $perfMatch = $perf | Where-Object { $_.IDProcess -eq $p.Id }
        $cpu = 0
        if ($perfMatch) { $cpu = $perfMatch.PercentProcessorTime }
        
        $desc = $p.Description
        if (-not $desc) { $desc = $p.Name }
        
        $hasWin = 0
        if ($p.MainWindowTitle) { $hasWin = 1 }

        [PSCustomObject]@{
            Name     = $desc
            CPU      = $cpu
            MemoryMB = [Math]::Round($p.WorkingSet / 1024 / 1024, 0)
            HasWin   = $hasWin
        }
    }
    catch {}
}

$grouped = $results | Group-Object Name | ForEach-Object {
    [PSCustomObject]@{
        Name     = $_.Name
        CPU      = ($_.Group | Measure-Object CPU -Sum).Sum
        MemoryMB = ($_.Group | Measure-Object MemoryMB -Sum).Sum
        HasWin   = ($_.Group | Measure-Object HasWin -Max).Maximum
    }
} | Sort-Object HasWin, MemoryMB -Descending | Select-Object -First 20

# Force UTF8 for JSON output
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$grouped | ConvertTo-Json
