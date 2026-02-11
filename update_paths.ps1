Get-ChildItem -Path "C:\UCONAI-LLM" -Recurse -File -Include *.ps1, *.yaml, *.json, *.md, *.ts, *.tsx, *.js, *.css, *.html, *.bat | Where-Object { $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch ".git" } | ForEach-Object {
    try {
        $content = Get-Content $_.FullName -Raw -ErrorAction Stop
        if ($content -match "UCONAI-LLM") {
            $newContent = $content -replace "UCONAI-LLM", "UCONAI-LLM"
            Set-Content $_.FullName -Value $newContent -NoNewline -ErrorAction Stop
            Write-Host "Updated: $($_.FullName)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "Failed to update $($_.FullName): $_" -ForegroundColor Red
    }
}
Write-Host "Migration Search & Replace Complete." -ForegroundColor Cyan
