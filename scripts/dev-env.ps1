# Run this before building on Windows:
#   powershell -File scripts/dev-env.ps1
# Or dot-source in your PowerShell session:
#   . .\scripts\dev-env.ps1

# 1. Activate MSVC toolchain
$vcvars = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
if (Test-Path $vcvars) {
    cmd /c "call `"$vcvars`" > NUL 2>&1 && set" | ForEach-Object {
        if ($_ -match '^(.*?)=(.*)$') {
            Set-Item -Force -Path "env:$($matches[1])" -Value $matches[2]
        }
    }
    Write-Host "[dev-env] MSVC environment loaded" -ForegroundColor Green
} else {
    Write-Host "[dev-env] WARNING: vcvars64.bat not found at $vcvars" -ForegroundColor Yellow
}

# 2. Remove Git MSYS2 link.exe from PATH (conflicts with MSVC link.exe)
$env:PATH = ($env:PATH -split ';' | Where-Object { $_ -notmatch 'git.*\\usr\\bin' }) -join ';'

# 3. Set dav1d to build from source
$env:SYSTEM_DEPS_DAV1D_BUILD_INTERNAL = "always"
