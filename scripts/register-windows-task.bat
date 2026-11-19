@echo off
REM FollowDesk Autonomous Daily Posting Scheduler for Windows Task Scheduler
REM Registers a background task that runs every day at 10:00 AM without opening cmd windows

set SCRIPT_DIR=%~dp0
set PROJECT_DIR=%SCRIPT_DIR%..

echo [FollowDesk] Registering daily automated post scheduler...
schtasks /create /tn "FollowDeskDailyPost" /tr "node \"%PROJECT_DIR%\scripts\auto-post.mjs\" --now" /sc daily /st 10:00 /f

if %ERRORLEVEL% EQU 0 (
    echo [FollowDesk] Successfully registered Windows Task "FollowDeskDailyPost" at 10:00 AM daily.
) else (
    echo [FollowDesk] Warning: Administrative privileges may be required to register schtasks.
)
pause
