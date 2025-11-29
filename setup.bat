@echo off
REM Vibegram Setup Script for Windows

echo =====================================
echo Vibegram Messenger - Setup Script
echo =====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo Requires Node.js 16 or higher
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Install server dependencies
echo Installing server dependencies...
cd /d "%~dp0server"
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)

echo Server dependencies installed!
echo.

REM Install client dependencies
echo Installing client dependencies...
cd /d "%~dp0client"
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install client dependencies
    pause
    exit /b 1
)

echo Client dependencies installed!
echo.

REM Create .env files if they don't exist
echo Creating environment files...

if not exist "%~dp0server\.env" (
    copy "%~dp0server\.env.example" "%~dp0server\.env"
    echo Created server\.env
)

if not exist "%~dp0client\.env" (
    copy "%~dp0client\.env.example" "%~dp0client\.env"
    echo Created client\.env
)

echo.
echo =====================================
echo Setup Complete!
echo =====================================
echo.
echo Next steps:
echo 1. Open two terminals
echo 2. Terminal 1: cd server && npm run dev
echo 3. Terminal 2: cd client && npm run dev
echo.
echo Server will run on: http://localhost:5000
echo Client will run on: http://localhost:5173
echo.
pause
