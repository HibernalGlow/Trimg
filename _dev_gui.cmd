@echo off
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
cd /d "%~dp0gui"
set LIBJXL_SYS_DIR=%~dp0target\libjxl-prebuilt
bun tauri dev
