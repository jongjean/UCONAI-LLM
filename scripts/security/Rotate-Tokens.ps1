# DCP Token Rotation and Expiration Monitor
# Chapter 2-5: ? í° ë¡œí…Œ?´ì…˜ ?ë™??
# Version: 1.0

param(
    [int]$WarningDays = 30,
    [int]$DefaultLifespanDays = 90,
    [switch]$CheckOnly = $false
)

. "C:\UCONAI-LLM\scripts\security\Manage-Secrets.ps1"

# Metadata storage (Windows Credential Manager is used for secrets, 
# but we store timestamps in a small encrypted-at-rest or protected JSON for easier tracking)
$metadataPath = "C:\UCONAI-LLM\config\token_metadata.json"

function Get-TokenMetadata {
    if (Test-Path $metadataPath) {
        try {
            $obj = Get-Content $metadataPath -Raw | ConvertFrom-Json
            $hash = @{}
            if ($obj) {
                foreach ($prop in $obj.PSObject.Properties) {
                    $hash[$prop.Name] = $prop.Value
                }
            }
            return $hash
        }
        catch {
            return @{}
        }
    }
    return @{}
}

function Save-TokenMetadata {
    param($Metadata)
    $Metadata | ConvertTo-Json | Set-Content $metadataPath
}

function Invoke-TokenRotation {
    Write-Host "--- DCP Token Expiration Check ---" -ForegroundColor Cyan
    
    $metadata = Get-TokenMetadata
    $now = Get-Date
    $changesMade = $false

    # $metadata is a Hashtable
    $keys = $metadata.Keys
    
    if ($keys.Count -eq 0) {
        Write-Host "No token metadata found. Use Set-DCPSecretWithExpiry to track tokens." -ForegroundColor Yellow
        return
    }

    foreach ($key in $keys) {
        $info = $metadata[$key]
        $createdDate = [DateTime]::Parse($info.CreatedDate)
        $lifespan = if ($info.LifespanDays) { $info.LifespanDays } else { $DefaultLifespanDays }
        $expiryDate = $createdDate.AddDays($lifespan)
        $daysRemaining = ($expiryDate - $now).Days

        Write-Host "Token [$key]: " -NoNewline
        
        if ($daysRemaining -le 0) {
            Write-Host "EXPIRED ($($daysRemaining) days)" -ForegroundColor Red
            if (-not $CheckOnly) {
                Write-Host "  >> Triggering Auto-Rotation for '$key'..." -ForegroundColor Magenta
                # Here we would call specific rotation logic for different systems
                # For now, we simulate by generating a new dummy token
                $newToken = "sk-dcp-rotated-" + [Guid]::NewGuid().ToString().Substring(0, 8)
                Set-DCPSecret -Name $key -Value $newToken
                
                # Update Metadata
                $info.CreatedDate = $now.ToString("o")
                $info.LastRotated = $now.ToString("o")
                $changesMade = $true
                Write-Host "  >> Successfully rotated '$key'." -ForegroundColor Green
            }
        }
        elseif ($daysRemaining -le $WarningDays) {
            Write-Host "WARNING ($($daysRemaining) days remaining)" -ForegroundColor Yellow
        }
        else {
            Write-Host "OK ($($daysRemaining) days remaining)" -ForegroundColor Green
        }
    }

    if ($changesMade) {
        Save-TokenMetadata -Metadata $metadata
    }
}

# Extended version of Set-DCPSecret that registers metadata
function Set-DCPSecretWithExpiry {
    param(
        [Parameter(Mandatory = $true)] [string]$Name,
        [Parameter(Mandatory = $true)] [string]$Value,
        [int]$LifespanDays = 90
    )
    
    # 1. Save to Credential Manager
    Set-DCPSecret -Name $Name -Value $Value
    
    # 2. Update Metadata
    $metadata = Get-TokenMetadata
    $metadata[$Name] = @{
        CreatedDate  = (Get-Date).ToString("o")
        LifespanDays = $LifespanDays
        LastRotated  = (Get-Date).ToString("o")
    }
    Save-TokenMetadata -Metadata $metadata
}

# If run directly
if ($MyInvocation.InvocationName -ne '.') {
    Invoke-TokenRotation
}
