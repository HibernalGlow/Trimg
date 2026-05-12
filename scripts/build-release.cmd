@echo off
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
cd /d "%~dp0.."

set LIBJXL_SYS_DIR=%~dp0..\target\libjxl-prebuilt

echo === Building CLI (release) ===
cargo build --workspace --release
if %errorlevel% neq 0 goto :fail

echo === Building GUI (release) ===
cargo build --manifest-path gui\src-tauri\Cargo.toml --release
if %errorlevel% neq 0 goto :fail

echo.
echo === Done ===
dir target\release\trimg.exe 2>nul
dir gui\src-tauri\target\release\trimg-gui.exe 2>nul
exit /b 0

:fail
echo === FAILED ===
pause
exit /b 1
