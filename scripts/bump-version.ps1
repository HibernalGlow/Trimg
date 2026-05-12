param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

if (-not $Version) {
    Write-Host "Error: VERSION parameter required" -ForegroundColor Red
    Write-Host "Usage: task gui:bump -- 0.2.0" -ForegroundColor Yellow
    exit 1
}

# Update package.json
$pkg = Get-Content gui/package.json | ConvertFrom-Json
$pkg.version = $Version
$pkg | ConvertTo-Json -Depth 10 | Set-Content gui/package.json

# Update Cargo.toml
(Get-Content gui/src-tauri/Cargo.toml) -replace '^version = ".*"', "version = `"$Version`"" | Set-Content gui/src-tauri/Cargo.toml

# Update tauri.conf.json
$conf = Get-Content gui/src-tauri/tauri.conf.json | ConvertFrom-Json
$conf.version = $Version
$conf | ConvertTo-Json -Depth 10 | Set-Content gui/src-tauri/tauri.conf.json

Write-Host "GUI version bumped to $Version" -ForegroundColor Green
