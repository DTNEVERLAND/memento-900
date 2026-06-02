@echo off
setlocal enabledelayedexpansion
REM ============================================================
REM  Memento 900 — one-click release
REM  Bumps version, commits, builds the .exe, and publishes a
REM  GitHub Release with the installer attached.
REM ============================================================

cd /d "%~dp0"

echo.
echo  ==========================================
echo   Memento 900  -  Release helper
echo  ==========================================
echo.

REM --- current version (read from package.json) ---
for /f "tokens=2 delims=:, " %%a in ('findstr /r /c:"\"version\"" package.json') do (
  set "CURVER=%%~a"
  goto :gotver
)
:gotver
echo  Current version: !CURVER!
echo.

REM --- ask for the new version ---
set /p NEWVER="  New version (e.g. 0.3.0, without 'v'): "
if "!NEWVER!"=="" (
  echo  [abort] No version entered.
  goto :end
)

REM --- ask for release notes (one line) ---
echo.
set /p NOTES="  What changed in this version? "
if "!NOTES!"=="" set "NOTES=Maintenance release."

echo.
echo  ------------------------------------------
echo   Releasing v!NEWVER!
echo   Notes: !NOTES!
echo  ------------------------------------------
set /p CONFIRM="  Proceed? (y/n): "
if /i not "!CONFIRM!"=="y" (
  echo  [abort] Cancelled.
  goto :end
)

REM --- 1. bump version in the three manifests ---
echo.
echo  [1/5] Bumping version to !NEWVER! ...
powershell -NoProfile -Command ^
  "$v='!NEWVER!'; (Get-Content package.json -Raw) -replace '\"version\":\s*\"[^\"]+\"', ('\"version\": \"'+$v+'\"') | Set-Content package.json -NoNewline -Encoding utf8"
powershell -NoProfile -Command ^
  "$v='!NEWVER!'; (Get-Content src-tauri\tauri.conf.json -Raw) -replace '\"version\":\s*\"[^\"]+\"', ('\"version\": \"'+$v+'\"') | Set-Content src-tauri\tauri.conf.json -NoNewline -Encoding utf8"
powershell -NoProfile -Command ^
  "$v='!NEWVER!'; (Get-Content src-tauri\Cargo.toml -Raw) -replace '(?m)^version = \"[^\"]+\"', ('version = \"'+$v+'\"') | Set-Content src-tauri\Cargo.toml -NoNewline -Encoding utf8"

REM --- 2. run tests ---
echo.
echo  [2/5] Running tests ...
call npm test
if errorlevel 1 (
  echo  [abort] Tests failed. Fix them before releasing.
  goto :end
)

REM --- 3. commit + push ---
echo.
echo  [3/5] Committing and pushing ...
git add -A
git commit -m "release: v!NEWVER! - !NOTES!"
git push

REM --- 4. build the installer (loads MSVC env via build-exe.bat) ---
echo.
echo  [4/5] Building the installer (this can take a few minutes) ...
call "%~dp0build-exe.bat"

set "INSTALLER=src-tauri\target\release\bundle\nsis\Memento 900_!NEWVER!_x64-setup.exe"
if not exist "!INSTALLER!" (
  echo  [error] Installer not found at: !INSTALLER!
  echo          The build may have failed - check build-exe.log
  goto :end
)

REM --- 5. publish the GitHub release ---
echo.
echo  [5/5] Publishing GitHub Release v!NEWVER! ...
gh release create v!NEWVER! "!INSTALLER!#Memento-900-!NEWVER!-windows-x64-setup.exe" --title "Memento 900 v!NEWVER!" --notes "!NOTES!"

echo.
echo  ==========================================
echo   Done!  v!NEWVER! is live.
echo   https://github.com/DTNEVERLAND/memento-900/releases/latest
echo  ==========================================

:end
echo.
pause
endlocal
