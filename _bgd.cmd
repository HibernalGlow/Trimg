@echo off
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
cd /d "D:\1VSCODE\Projects\ImageAll\Trimg\gui"
set LIBJXL_SYS_DIR=D:\1VSCODE\Projects\ImageAll\Trimg\target\libjxl-prebuilt
cargo build --manifest-path src-tauri\Cargo.toml
