param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

if (-not $Version) {
    Write-Host "Error: VERSION parameter required" -ForegroundColor Red
    Write-Host "Usage: task tag:create -- 0.2.0" -ForegroundColor Yellow
    exit 1
}

$tagName = "gui-v$Version"
git tag -a $tagName -m "GUI release v$Version"
Write-Host "Created tag: $tagName" -ForegroundColor Green
Write-Host "Push with: git push origin $tagName" -ForegroundColor Cyan
