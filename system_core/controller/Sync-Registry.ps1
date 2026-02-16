$paths = @(
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*"
)

$apps = @()
foreach ($p in $paths) {
    Get-ItemProperty $p -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.DisplayName) {
            $apps += @{
                id = $_.PSChildName
                name = $_.DisplayName
                path = $_.InstallLocation
                exec = $_.DisplayIcon -replace ',.*$', '' # Basic executable guess
            }
        }
    }
}

$registry = @{
    last_sync = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    total_apps = $apps.Count
    apps = $apps
}

$registry | ConvertTo-Json -Depth 4 | Out-File -FilePath "C:\OpenClaw\controller\system-registry.json" -Encoding utf8
Write-Host "Registry Synced: $($apps.Count) apps found."
