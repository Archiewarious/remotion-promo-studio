@echo off
chcp 65001 >nul
title Video Workflow Setup

echo ============================================
echo  Video Workflow - installation
echo ============================================
echo.

REM === 1. Node.js ===
where node >nul 2>&1
if errorlevel 1 (
  echo [X] Node.js not found
  echo     Install LTS from: https://nodejs.org
  echo     Re-run setup.bat after install
  pause
  exit /b 1
)
echo [1/4] Node.js OK
node --version

REM === 2. FFmpeg ===
where ffmpeg >nul 2>&1
if errorlevel 1 (
  echo [!] FFmpeg not found in PATH
  echo     Download essentials: https://www.gyan.dev/ffmpeg/builds/
  echo     Extract to C:\ffmpeg, add C:\ffmpeg\bin to PATH
  echo     ^(needed for final voice+music mix^)
) else (
  echo [2/4] FFmpeg OK
)

REM === 3. Remotion Agent Skills ===
if not exist .claude\skills\remotion (
  echo [3/4] Downloading Remotion Agent Skills...
  if not exist .claude\skills mkdir .claude\skills
  powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest 'https://github.com/remotion-dev/skills/archive/refs/heads/main.tar.gz' -OutFile '%TEMP%\remotion-skills.tar.gz'"
  if errorlevel 1 (
    echo [X] Download failed. Check internet.
    pause
    exit /b 1
  )
  tar -xzf "%TEMP%\remotion-skills.tar.gz" -C "%TEMP%"
  xcopy "%TEMP%\skills-main\skills\remotion" ".claude\skills\remotion\" /E /I /Q /Y >nul
  del "%TEMP%\remotion-skills.tar.gz"
  rmdir /s /q "%TEMP%\skills-main"
  echo     Skills installed
) else (
  for /f %%c in ('dir /b .claude\skills\remotion\rules 2^>nul ^| find /c /v ""') do set RULES_COUNT=%%c
  echo [3/4] Remotion Skills already installed ^(%RULES_COUNT% rules^)
)

REM === 4. .env ===
if not exist .env (
  if exist .env.example (
    copy .env.example .env >nul
    echo [4/4] .env created from .env.example - fill in API keys
  ) else (
    echo [!] .env.example missing
  )
) else (
  echo [4/4] .env exists
)

REM === Required directories ===
if not exist _ASSETS mkdir _ASSETS
if not exist incoming mkdir incoming
REM _ARCHIVE может быть папкой или ярлыком (.lnk) на внешний диск — создаём только если ни того ни другого нет
if not exist _ARCHIVE if not exist _ARCHIVE.lnk mkdir _ARCHIVE

echo.
echo ============================================
echo  SETUP COMPLETE
echo.
echo  Next steps:
echo   1. Fill .env with Pexels / Pixabay API keys
echo   2. Open Cowork ^(Claude Desktop^) and install:
echo      Settings - Extensions - search "Desktop Commander"
echo      ^(gives Claude direct access to this PC^)
echo   3. One-time: install shared deps -^> run _ASSETS\_install.bat
echo   4. New project (one command): powershell -File newproject.ps1 MyProject
echo   5. Open new chat with Claude and provide brief
echo ============================================
pause
