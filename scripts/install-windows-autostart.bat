@echo off
REM FollowDesk Windows Startup Launcher
REM Creates or updates a shortcut in the user's Startup folder so FollowDesk background server
REM and dashboard launch automatically on Windows login.

set SCRIPT_DIR=%~dp0
set PROJECT_DIR=%SCRIPT_DIR%..
set STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set VBS_FILE=%TEMP%\CreateFollowDeskShortcut.vbs

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%VBS_FILE%"
echo sLinkFile = "%STARTUP_DIR%\FollowDesk.lnk" >> "%VBS_FILE%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%VBS_FILE%"
echo oLink.TargetPath = "node.exe" >> "%VBS_FILE%"
echo oLink.Arguments = """%PROJECT_DIR%\auto-launch.mjs""" >> "%VBS_FILE%"
echo oLink.WorkingDirectory = """%PROJECT_DIR%""" >> "%VBS_FILE%"
echo oLink.WindowStyle = 7 >> "%VBS_FILE%"
echo oLink.IconLocation = """%PROJECT_DIR%\extension\icons\icon.svg""" >> "%VBS_FILE%"
echo oLink.Description = "FollowDesk Background Auto-Start Service" >> "%VBS_FILE%"
echo oLink.Save >> "%VBS_FILE%"

cscript /nologo "%VBS_FILE%"
del "%VBS_FILE%"

echo [FollowDesk] Auto-start shortcut installed in:
echo %STARTUP_DIR%\FollowDesk.lnk
pause
