# DCP Permission Verification Utility (Simpler Version)
# Chapter 2-3: RBAC êµ¬í˜„

param(
    [Parameter(Mandatory = $true)] [string]$Principal,
    [Parameter(Mandatory = $true)] [string]$Action,
    [string]$ResourceId = $null
)

$policyPath = "C:\UCONAI-LLM\config\rbac_policy.yaml"
if (-not (Test-Path $policyPath)) { Write-Error "Policy not found"; exit 1 }

$lines = Get-Content $policyPath

# 1. Get Role
$roleId = $null
$foundPrincipal = $false
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "principal: `"$Principal`"") {
        $foundPrincipal = $true
        if ($lines[$i + 1] -match "role: `"([^`"]+)`"") {
            $roleId = $Matches[1]
            break
        }
    }
}

if (-not $roleId) {
    Write-Host "??Principal '$Principal' not mapping to a role." -ForegroundColor Red
    return $false
}

# 2. Get Permissions
$permissions = @()
$inTargetRole = $false
foreach ($line in $lines) {
    if ($line -match "id: `"$roleId`"") { $inTargetRole = $true; continue }
    if ($inTargetRole) {
        if ($line -match "^  - id:" -or $line -match "^resource_mappings:") { $inTargetRole = $false; break }
        if ($line -match "- `"([^`"]+)`"") { $permissions += $Matches[1] }
    }
}

# 3. Check Action
if ($permissions -contains $Action -or $permissions -contains "*") {
    # 4. Resource Restriction
    if ($ResourceId) {
        $foundRes = $false
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match "resource_id: `"$ResourceId`"") {
                if ($lines[$i + 1] -match "restricted_to: \[(.*?)\]") {
                    $allowed = $Matches[1] -split "," | ForEach-Object { $_.Trim().Trim('"') }
                    if ($allowed -notcontains $roleId) {
                        Write-Host "?š« Denied: Role '$roleId' restricted from '$ResourceId'." -ForegroundColor Yellow
                        return $false
                    }
                }
                break
            }
        }
    }
    Write-Host "??Allowed: Principal '$Principal' ($roleId) can perform '$Action'." -ForegroundColor Green
    return $true
}
else {
    Write-Host "?š« Denied: Principal '$Principal' ($roleId) does not have '$Action'." -ForegroundColor Yellow
    return $false
}
