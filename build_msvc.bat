@echo off
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
cd /d "%~dp0"

if "%1"=="" (
    echo Usage: build_msvc.bat [command]
    echo   build    - Build CLI + GUI
    echo   check    - Type-check workspace + GUI
    echo   test     - Run tests
    echo   all      - Build + test
    exit /b 0
)

if "%1"=="build" (
    cargo build --workspace
    if %errorlevel% neq 0 exit /b %errorlevel%
    cargo build --manifest-path gui/src-tauri/Cargo.toml
    exit /b %errorlevel%
)

if "%1"=="check" (
    cargo check --workspace
    if %errorlevel% neq 0 exit /b %errorlevel%
    cargo check --manifest-path gui/src-tauri/Cargo.toml
    exit /b %errorlevel%
)

if "%1"=="test" (
    cargo test --workspace
    exit /b %errorlevel%
)

if "%1"=="all" (
    cargo build --workspace && cargo build --manifest-path gui/src-tauri/Cargo.toml && cargo test --workspace
    exit /b %errorlevel%
)

echo Unknown command: %1
exit /b 1
