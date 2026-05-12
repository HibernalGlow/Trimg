param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

if (-not $Version) {
    Write-Host "Error: VERSION parameter required" -ForegroundColor Red
    Write-Host "Usage: task tag:delete -- 0.2.0" -ForegroundColor Yellow
    exit 1
}

$tagName = "gui-v$Version"
git tag -d $tagName
Write-Host "Deleted local tag: $tagName" -ForegroundColor Yellow
