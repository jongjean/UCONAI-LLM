# DCP Scope Validator
# systems.yamlê³?scope.yaml???•í•©??ê²€ì¦?

param(
    [switch]$Strict = $false
)

$SystemsYaml = "C:\UCONAI-LLM\config\systems.yaml"
$ScopeYaml = "C:\UCONAI-LLM\config\scope.yaml"

Write-Host "`n=== DCP Scope Validation ===" -ForegroundColor Cyan
Write-Host "Started: $(Get-Date -Format 'HH:mm:ss')`n"

# Extract system paths from systems.yaml
function Get-SystemPaths {
    $content = Get-Content $SystemsYaml
    $systems = @()
    $current = $null
    $inLogsSection = $false
    
    foreach ($line in $content) {
        if ($line -match '^\s*- id: "(.+)"') {
            if ($current) { $systems += $current }
            $current = @{ id = $Matches[1]; path = $null }
            $inLogsSection = $false
        }
        elseif ($line -match '^\s+logs:') {
            $inLogsSection = $true
        }
        elseif ($line -match '^\s+\w+:' -and $line -notmatch '^\s+path:') {
            $inLogsSection = $false
        }
        elseif ($current -and -not $inLogsSection -and $line -match '^\s+path: "(.+)"') {
            if (-not $current.path) {
                $current.path = $Matches[1] -replace '\\\\', '\'
            }
        }
    }
    if ($current) { $systems += $current }
    return $systems
}

# Extract scope paths
function Get-ScopePaths {
    $content = Get-Content $ScopeYaml
    $scope = @{ manage = @(); observe = @(); deny = @() }
    $section = $null
    
    foreach ($line in $content) {
        if ($line -match '^\s+manage:') { $section = 'manage' }
        elseif ($line -match '^\s+observe:') { $section = 'observe' }
        elseif ($line -match '^\s+deny:') { $section = 'deny' }
        elseif ($section -and $line -match '^\s+- path: "(.+)"') {
            $scope[$section] += ($Matches[1] -replace '\\\\', '\')
        }
    }
    return $scope
}

# Validation
$issues = @()
$systems = Get-SystemPaths
$scope = Get-ScopePaths

Write-Host "[1/3] Loading data..."
Write-Host "  Systems: $($systems.Count)"
Write-Host "  Scope: Manage=$($scope.manage.Count), Observe=$($scope.observe.Count), Deny=$($scope.deny.Count)`n"

Write-Host "[2/3] Checking systems are in scope..." -NoNewline
$allScopePaths = $scope.manage + $scope.observe
$missing = @()

foreach ($sys in $systems) {
    if ($sys.path -and $sys.path -notin $allScopePaths) {
        $missing += $sys
    }
}

if ($missing.Count -gt 0) {
    Write-Host " FAIL" -ForegroundColor Red
    $issues += "Missing in scope: $($missing.Count) systems"
    foreach ($m in $missing) {
        Write-Host "  - $($m.id): $($m.path)" -ForegroundColor Yellow
    }
}
else {
    Write-Host " OK" -ForegroundColor Green
}

Write-Host "[3/3] Checking deny conflicts..." -NoNewline
$conflicts = @()

foreach ($sys in $systems) {
    foreach ($deny in $scope.deny) {
        if ($sys.path -eq $deny -or $sys.path -like "$deny\*") {
            $conflicts += $sys
        }
    }
}

if ($conflicts.Count -gt 0) {
    Write-Host " FAIL" -ForegroundColor Red
    $issues += "Deny conflicts: $($conflicts.Count) systems"
    foreach ($c in $conflicts) {
        Write-Host "  - $($c.id): $($c.path)" -ForegroundColor Red
    }
}
else {
    Write-Host " OK" -ForegroundColor Green
}

# Results
Write-Host "`n=== Results ===" -ForegroundColor Cyan

if ($issues.Count -eq 0) {
    Write-Host "All checks passed!" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "Issues found: $($issues.Count)" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  - $issue" -ForegroundColor Yellow
    }
    exit 1
}
