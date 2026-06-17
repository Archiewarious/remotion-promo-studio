@echo off
cd /d "%~dp0"
set PATHEXT=.COM;.EXE;.BAT;.CMD
echo === SHARED INSTALL START === > _install.log
call npm install --no-audit --no-fund >> _install.log 2>&1
echo NPM_EXIT=%ERRORLEVEL% >> _install.log
echo DONE >> _install.log
