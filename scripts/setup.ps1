# One-time setup: configure MSVC in PATH and libjxl prebuilt.
# Run once after cloning: powershell -File scripts/setup.ps1
# CI builds are unaffected — they use vendored cmake.

$ErrorActionPreference = "Stop"
$ProjectRoot = (Resolve-Path "$PSScriptRoot\..").Path

# ── 1. Add MSVC to user PATH ────────────────────────────────────
$msvcBin = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207\bin\Hostx64\x64"
$currentUserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not $currentUserPath) { $currentUserPath = "" }

if ($currentUserPath -notlike "*$msvcBin*") {
    [Environment]::SetEnvironmentVariable("Path", "$msvcBin;$currentUserPath", "User")
    Write-Host "[setup] Added MSVC to user PATH" -ForegroundColor Green
} else {
    Write-Host "[setup] MSVC already in PATH" -ForegroundColor Gray
}

# ── 2. Pin libjxl prebuilt ──────────────────────────────────────
$prebuiltDirs = Get-ChildItem "$ProjectRoot\target\debug\build" -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "slimg-libjxl-sys-*" }

$prebuiltSrc = $null
foreach ($dir in $prebuiltDirs) {
    $candidate = Join-Path $dir.FullName "out\libjxl-prebuilt-windows-x86_64"
    if (Test-Path $candidate) {
        $prebuiltSrc = $candidate
        break
    }
}

if ($prebuiltSrc) {
    $prebuiltDst = "$ProjectRoot\target\libjxl-prebuilt"
    if (-not (Test-Path $prebuiltDst)) {
        Copy-Item -Recurse $prebuiltSrc $prebuiltDst
        Write-Host "[setup] Libjxl prebuilt copied to $prebuiltDst" -ForegroundColor Green
    } else {
        Write-Host "[setup] Libjxl prebuilt already exists" -ForegroundColor Gray
    }

    # Set as user env var (NOT in .cargo/config.toml — that would break CI)
    [Environment]::SetEnvironmentVariable("LIBJXL_SYS_DIR", $prebuiltDst, "User")
    Write-Host "[setup] LIBJXL_SYS_DIR set to $prebuiltDst" -ForegroundColor Green
} else {
    Write-Host "[setup] WARNING: No prebuilt libjxl found. Run 'cargo build --workspace' once to download it." -ForegroundColor Yellow
}

# ── 3. Warn about Git link.exe conflict ─────────────────────────
$gitUsrBin = "D:\scoop\apps\git\2.54.0\usr\bin"
if ($currentUserPath -like "*$gitUsrBin*") {
    Write-Host "[setup] WARNING: Git usr/bin in PATH may shadow MSVC link.exe" -ForegroundColor Yellow
    Write-Host "  If linking fails, remove from PATH: $gitUsrBin" -ForegroundColor Yellow
}

Write-Host "`nSetup complete. Restart your terminal for changes to take effect." -ForegroundColor Cyan
