# Enhanced MediConnect BD Startup Script
# This script ensures database is set up and populated before starting services

Write-Host "🏥 MediConnect BD - Enhanced Startup" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Check if database needs setup
Write-Host "[1/4] Checking database status..." -ForegroundColor Yellow
Set-Location "E:\db....v2\MediConnectBD\backend"

try {
    $dbCheck = node -e "
        const mysql = require('mysql2/promise');
        require('dotenv').config();
        
        async function checkDb() {
            try {
                const connection = await mysql.createConnection({
                    host: process.env.DB_HOST || 'localhost',
                    user: process.env.DB_USER || 'root',
                    password: process.env.DB_PASS || '',
                    port: process.env.DB_PORT || 3306,
                    database: 'mediconnect'
                });
                
                const [tables] = await connection.query('SHOW TABLES');
                const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
                
                console.log('TABLES:' + tables.length + ',USERS:' + users[0].count);
                await connection.end();
            } catch (error) {
                console.log('ERROR:' + error.message);
            }
        }
        
        checkDb();
    " 2>&1

    if ($dbCheck -match "ERROR:") {
        Write-Host "   ⚠️  Database not found. Setting up..." -ForegroundColor Red
        npm run setup-db
        npm run populate-manual
    }
    elseif ($dbCheck -match "USERS:0") {
        Write-Host "   ⚠️  Database empty. Populating..." -ForegroundColor Yellow
        npm run populate-manual
    }
    else {
        Write-Host "   ✅ Database is ready with sample data" -ForegroundColor Green
    }
}
catch {
    Write-Host "   ⚠️  Database check failed. Setting up..." -ForegroundColor Red
    npm run setup-db
    npm run populate-manual
}

Write-Host ""

# Start Backend
Write-Host "[2/4] Starting Backend Server..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "E:\db....v2\MediConnectBD\backend"
    npm run dev
} -Name "MediConnect-Backend"

Start-Sleep 3

# Start API Gateway
Write-Host "[3/4] Starting API Gateway..." -ForegroundColor Yellow
$gatewayJob = Start-Job -ScriptBlock {
    Set-Location "E:\db....v2\MediConnectBD\api-gateway"
    npm run dev-stable
} -Name "MediConnect-Gateway"

Start-Sleep 3

# Start Frontend
Write-Host "[4/4] Starting Frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "E:\db....v2\MediConnectBD"
    npm run dev
} -Name "MediConnect-Frontend"

Write-Host ""
Write-Host "✅ All services started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Services:" -ForegroundColor Cyan
Write-Host "- Backend: http://localhost:5000" 
Write-Host "- API Gateway: http://localhost:4000"
Write-Host "- Frontend: http://localhost:3001"
Write-Host ""
Write-Host "📊 Sample Data Available:" -ForegroundColor Cyan
Write-Host "- 2 Hospitals (DMCH & Square)"
Write-Host "- 3 Users (1 Patient, 2 Doctors)"
Write-Host "- 2 Doctors (Cardiology & Neurology)"
Write-Host ""
Write-Host "🔧 Commands:" -ForegroundColor Cyan
Write-Host "- Check status: Get-Job"
Write-Host "- View output: Receive-Job -Name 'MediConnect-Backend'"
Write-Host "- Stop all: Get-Job | Stop-Job; Get-Job | Remove-Job"
Write-Host "- Reset data: npm run reset-db"
Write-Host ""