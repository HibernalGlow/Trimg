@echo off
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
cd /d "%~dp0"
set SYSTEM_DEPS_DAV1D_BUILD_INTERNAL=always

echo === Building CLI ===
cargo build --workspace
if %errorlevel% neq 0 goto :error

echo.
echo === Building GUI ===
cargo build --manifest-path gui/src-tauri/Cargo.toml
if %errorlevel% neq 0 goto :error

echo.
echo === Running tests ===
cargo test --workspace
if %errorlevel% neq 0 goto :error

echo.
echo === All passed ===
pause
exit /b 0

:error
echo.
echo === FAILED ===
pause
exit /b 1
