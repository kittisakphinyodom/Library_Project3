@echo off
REM Library Management System v2 - Comprehensive Test Script
REM Windows Batch Version

cd /d "d:\01-Teaching\682\88734365\Library-Management-v2"

echo ===============================================================
echo  Library Management System v2 - Comprehensive Test Suite
echo ===============================================================
echo.

echo Step 1: Cleaning old database...
if exist "database\library.db" (
    del "database\library.db"
    echo ✓ Database cleaned
) else (
    echo ✓ No old database found
)

echo.
echo Step 2: Installing fresh dependencies...
call npm install --silent > nul
echo ✓ Dependencies installed

echo.
echo Step 3: Starting server...
start /B cmd /c "npm start 1>server.log 2>&1"
timeout /t 6 /nobreak

echo ✓ Server started (PID in background)

echo.
echo Step 4: Running comprehensive tests...
node comprehensive-test.js

echo.
echo ===============================================================
echo  Test Suite Complete
echo ===============================================================
echo.

REM Kill the server
taskkill /F /IM node.exe >nul 2>&1

pause
