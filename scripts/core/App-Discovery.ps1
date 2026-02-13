# UCONAI App Discovery & Usage Tracker
# This script scans for installed apps and merges them with a persistent registry

$registryPath = "C:\OpenClaw\controller\system-registry.json"
$vaultPath = "C:\UCONAI-Vault\analysis"
if (!(Test-Path $vaultPath)) { New-Item -ItemType Directory -Path $vaultPath -Force }

# 1. Discover Installed Apps (Registry Scan)
$scanPaths = @(
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*"
)

$installed = @{}

foreach ($path in $scanPaths) {
    Get-ItemProperty $path -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.DisplayName -and ($_.UninstallString -or $_.InstallLocation)) {
            $name = $_.DisplayName.Trim()
            if (-not $installed.ContainsKey($name)) {
                $installed[$name] = @{
                    id = $name.Replace(" ", "-").ToLower()
                    name = $name
                    version = $_.DisplayVersion
                    installDate = $_.InstallDate
                    publisher = $_.Publisher
                    path = $_.InstallLocation
                    icon = $_.DisplayIcon
                }
            }
        }
    }
}

# 2. Load Existing Registry or Create New
if (Test-Path $registryPath) {
    $currentRegistry = Get-Content $registryPath | ConvertFrom-Json -ErrorAction SilentlyContinue
} else {
    $currentRegistry = @{ apps = @(); lastDiscovery = "" }
}

# 3. Merge Discovery with Stats
$updatedApps = @()
foreach ($appId in $installed.Keys) {
    $app = $installed[$appId]
    $existing = $currentRegistry.apps | Where-Object { $_.name -eq $app.name }
    
    if ($existing) {
        $app.usageCount = $existing.usageCount
        $app.lastUsed = $existing.lastUsed
        $app.score = $existing.score # Optimization score
    } else {
        $app.usageCount = 0
        $app.lastUsed = "Never"
        $app.score = 100 # Default score
    }
    $updatedApps += $app
}

$report = @{
    apps = $updatedApps
    lastDiscovery = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    count = $updatedApps.Count
}

$reportJson = $report | ConvertTo-Json -Depth 5 -Compress
$tempPath = "$registryPath.tmp"
[System.IO.File]::WriteAllText($tempPath, $reportJson, [System.Text.Encoding]::UTF8)
if (Test-Path $tempPath) {
    if (Test-Path $registryPath) { Remove-Item $registryPath -Force }
    Move-Item -Path $tempPath -Destination $registryPath -Force
}

Write-Host "Discovery Complete. Found $($updatedApps.Count) applications."
