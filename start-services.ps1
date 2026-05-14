# Start all MediConnect services as background jobs
Write-Host "🚀 Starting MediConnect BD Services..." -ForegroundColor Green

# Start Backend
Write-Host "[1/3] Starting Backend Server..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "E:\db....v2\MediConnectBD\backend"
    npm run dev
} -Name "MediConnect-Backend"

Start-Sleep 3

# Start API Gateway
Write-Host "[2/3] Starting API Gateway..." -ForegroundColor Yellow
$gatewayJob = Start-Job -ScriptBlock {
    Set-Location "E:\db....v2\MediConnectBD\api-gateway"
    npm run dev-stable
} -Name "MediConnect-Gateway"

Start-Sleep 3

# Start Frontend
Write-Host "[3/3] Starting Frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "E:\db....v2\MediConnectBD"
    npm run dev
} -Name "MediConnect-Frontend"

Write-Host ""
Write-Host "✅ All services started as background jobs!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "- Backend: http://localhost:5000" 
Write-Host "- API Gateway: http://localhost:4000"
Write-Host "- Frontend: http://localhost:3001"
Write-Host ""
Write-Host "Commands:" -ForegroundColor Cyan
Write-Host "- Check status: Get-Job"
Write-Host "- View output: Receive-Job -Name 'MediConnect-Backend'"
Write-Host "- Stop all: Get-Job | Stop-Job; Get-Job | Remove-Job"
Write-Host ""

# Show job status
Get-Job