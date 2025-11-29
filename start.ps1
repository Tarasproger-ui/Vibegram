# Vibegram Quick Start Script
# Run with: powershell -ExecutionPolicy Bypass -File start.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Vibegram Messenger - Quick Start" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
$npmVersion = npm --version 2>$null

if ($null -eq $nodeVersion) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green
Write-Host "✓ npm $npmVersion" -ForegroundColor Green
Write-Host ""

# Check if dependencies are installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow

$serverNodeModules = Test-Path ".\server\node_modules"
$clientNodeModules = Test-Path ".\client\node_modules"

if (-not $serverNodeModules -or -not $clientNodeModules) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    
    if (-not $serverNodeModules) {
        Write-Host "  Installing server dependencies..." -ForegroundColor Gray
        Push-Location ".\server"
        npm install
        Pop-Location
    }
    
    if (-not $clientNodeModules) {
        Write-Host "  Installing client dependencies..." -ForegroundColor Gray
        Push-Location ".\client"
        npm install
        Pop-Location
    }
    
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Starting Vibegram..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Create two processes
Write-Host "Starting server on port 5000..." -ForegroundColor Yellow
$serverProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$(Get-Location)\server'; npm run dev" -PassThru

Start-Sleep -Seconds 3

Write-Host "Starting client on port 5173..." -ForegroundColor Yellow
$clientProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$(Get-Location)\client'; npm run dev" -PassThru

Write-Host ""
Write-Host "✓ Servers started!" -ForegroundColor Green
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Backend API:  http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend:     http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "To stop, close the terminal windows." -ForegroundColor Yellow
Write-Host ""

# Wait for processes
$null = $serverProcess.WaitForExit()
$null = $clientProcess.WaitForExit()
