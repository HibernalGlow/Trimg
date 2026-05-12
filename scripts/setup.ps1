# One-time setup: configure MSVC in PATH so cargo builds work without vcvars.
# Run: powershell -File scripts/setup.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = "$PSScriptRoot\.."

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
        Write-Host "[setup] Libjxl prebuilt copied" -ForegroundColor Green
    } else {
        Write-Host "[setup] Libjxl prebuilt already exists" -ForegroundColor Gray
    }

    # ── 3. Write .cargo/config.toml ─────────────────────────────────
    $prebuiltDstForward = $prebuiltDst -replace '\\', '/'
    $cargoConfig = @"
[env]
SYSTEM_DEPS_DAV1D_BUILD_INTERNAL = "always"
LIBJXL_SYS_DIR = "$prebuiltDstForward"
"@
    $cargoConfig | Set-Content -Path "$ProjectRoot\.cargo\config.toml"
    Write-Host "[setup] .cargo/config.toml updated" -ForegroundColor Green
} else {
    Write-Host "[setup] WARNING: No prebuilt libjxl found. Run build_msvc.bat build first." -ForegroundColor Yellow
}

# ── 4. Remove Git link.exe from PATH (conflicts with MSVC) ──────
$gitUsrBin = "D:\scoop\apps\git\2.54.0\usr\bin"
if ($currentUserPath -like "*$gitUsrBin*") {
    Write-Host "[setup] WARNING: Git usr/bin in PATH may shadow MSVC link.exe" -ForegroundColor Yellow
    Write-Host "  Consider removing: $gitUsrBin" -ForegroundColor Yellow
}

Write-Host "`nDone. Restart your terminal for PATH changes to take effect." -ForegroundColor Cyan
