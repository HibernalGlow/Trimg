@echo off
:: Run this from File Explorer or cmd.exe to build release binaries.
:: Git Bash interferes because /usr/bin/link.exe shadows MSVC link.exe.
set MSVC_BIN=C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207\bin\Hostx64\x64
set PATH=%MSVC_BIN%;%PATH%
set LIBJXL_SYS_DIR=%~dp0..\target\libjxl-prebuilt
set SYSTEM_DEPS_DAV1D_BUILD_INTERNAL=always

cd /d "%~dp0.."
echo === Building CLI (release) ===
cargo build --workspace --release
if %errorlevel% neq 0 goto :fail

echo === Building GUI (release) ===
cargo build --manifest-path gui\src-tauri\Cargo.toml --release
if %errorlevel% neq 0 goto :fail

echo.
echo === Done ===
dir /b target\release\trimg.exe 2>nul
dir /b gui\src-tauri\target\release\trimg-gui.exe 2>nul
pause
exit /b 0

:fail
echo === FAILED ===
pause
exit /b 1
