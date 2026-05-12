param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "GUI Release v$Version Ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review changes: git diff" -ForegroundColor White
Write-Host "  2. Commit changes: git add -A && git commit -m 'chore(gui): bump to $Version'" -ForegroundColor White
Write-Host "  3. Push tag: task tag:push" -ForegroundColor White
Write-Host "  4. Build release: task build" -ForegroundColor White
Write-Host ""
