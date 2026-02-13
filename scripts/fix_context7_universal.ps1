# ============================
# Context7 Global Install Fix (Windows + npm 11) - UCONAI Optimized
# Target prefix: C:\Users\user\AppData\Roaming\npm
# ============================

$ErrorActionPreference = "Stop"

Write-Host "== 0) Check Node/NPM ==" -ForegroundColor Cyan
node -v
npm -v

Write-Host "`n== 1) Read npm global prefix ==" -ForegroundColor Cyan
$prefix = (npm config get prefix).Trim()
Write-Host "npm prefix = $prefix"

# The bin folder on Windows is usually the prefix itself
$bin = $prefix
Write-Host "expected global bin folder = $bin"

Write-Host "`n== 2) Ensure bin folder is in USER PATH ==" -ForegroundColor Cyan
$userPath = [Environment]::GetEnvironmentVariable("Path","User")
if ($null -eq $userPath) { $userPath = "" }

if ($userPath -notlike "*$bin*") {
  [Environment]::SetEnvironmentVariable("Path", ($userPath.TrimEnd(';') + ";" + $bin), "User")
  Write-Host "Added to USER PATH: $bin" -ForegroundColor Green
} else {
  Write-Host "Already in USER PATH: $bin" -ForegroundColor Green
}

# Also add to current session so we can test immediately
$env:Path = "$bin;$env:Path"

Write-Host "`n== 3) (Re)install context7 globally ==" -ForegroundColor Cyan
# Clean reinstall (avoids broken bin link scenarios)
npm uninstall -g context7 | Out-Null
npm install -g context7 --force

Write-Host "`n== 4) Verify installation artifacts ==" -ForegroundColor Cyan
$globalModules = Join-Path $prefix "node_modules"
$pkgPath = Join-Path $globalModules "context7"
if (!(Test-Path $pkgPath)) {
  throw "context7 package folder not found at: $pkgPath"
}
Write-Host "Found package: $pkgPath" -ForegroundColor Green

Write-Host "`n== 5) Verify command shim (.cmd) exists ==" -ForegroundColor Cyan
$cmd = Join-Path $bin "context7.cmd"
if (Test-Path $cmd) {
  Write-Host "OK: $cmd" -ForegroundColor Green
} else {
  Write-Host "WARN: context7.cmd not found at $cmd" -ForegroundColor Yellow
  Write-Host "Trying manual shim creation..." -ForegroundColor Yellow

  # Read package.json to find the bin entry
  $pkgJson = Get-Content (Join-Path $pkgPath "package.json") -Raw | ConvertFrom-Json
  $binRel = $null

  if ($pkgJson.bin -is [string]) {
    $binRel = $pkgJson.bin
  } elseif ($pkgJson.bin.PSObject.Properties.Name -contains "context7") {
    $binRel = $pkgJson.bin.context7
  } elseif ($pkgJson.bin.PSObject.Properties.Name -contains "c7") {
    $binRel = $pkgJson.bin.c7
  }

  if (!$binRel) {
    throw "No 'bin' entry found in context7/package.json. It may not be a CLI package."
  }

  $targetJs = Join-Path $pkgPath $binRel
  if (!(Test-Path $targetJs)) {
    throw "Bin target not found: $targetJs"
  }

  # Create .cmd shim (Windows standard)
  $cmdBody = "@echo off`r`n" +
             "node `"$targetJs`" %*`r`n"
  Set-Content -Path $cmd -Value $cmdBody -Encoding ASCII
  Write-Host "Created shim: $cmd -> $targetJs" -ForegroundColor Green
}

Write-Host "`n== 6) Test run ==" -ForegroundColor Cyan
# Verify both 'c7' (default) and 'context7' (shimmed)
Write-Host "Testing 'c7' command:"
c7 --version
Write-Host "Testing 'context7' command:"
where.exe context7
cmd /c "context7 --version"

Write-Host "`n== DONE ==" -ForegroundColor Green
Write-Host "IMPORTANT: Restart VS Code (and open a NEW terminal) to pick up USER PATH changes." -ForegroundColor Yellow
