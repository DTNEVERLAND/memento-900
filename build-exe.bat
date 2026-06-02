@echo off
REM Load MSVC x64 developer environment (sets VCINSTALLDIR, LIB, INCLUDE, link.exe path)
call "C:\Program Files (x86)\Microsoft Visual Studio\2017\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
REM Ensure cargo/rustc are on PATH
set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"
cd /d "C:\Users\Acer\Downloads\memento-900"
echo === ENV CHECK ===
echo VCINSTALLDIR=%VCINSTALLDIR%
where cargo
where link
echo === BUILDING ===
call npx tauri build
echo TAURI_BUILD_EXIT=%ERRORLEVEL%
