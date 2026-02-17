
$procList = Get-Process | Where-Object { $_.Name -notmatch 'Idle|^System$' } | ForEach-Object {
    try {
        $desc = $_.Description
        if (-not $desc) { $desc = $_.Name }
        $hasWin = 0
        if ($_.MainWindowTitle) { $hasWin = 1 }
        [PSCustomObject]@{
            Id        = $_.Id
            Name      = $desc
            RawName   = $_.Name
            MemoryMB  = [Math]::Round($_.WorkingSet / 1024 / 1024, 0)
            HasWindow = $hasWin
        }
    }
    catch { }
}

$grouped = $procList | Group-Object Name | ForEach-Object {
    [PSCustomObject]@{
        Name      = $_.Name
        MemoryMB  = ($_.Group | Measure-Object MemoryMB -Sum).Sum
        Count     = $_.Count
        HasWindow = ($_.Group | Measure-Object HasWindow -Max).Maximum
    }
} | Sort-Object MemoryMB -Descending | Select-Object -First 30

$grouped | ConvertTo-Json
