@echo off
echo Starting MediConnect BD Services...

echo.
echo [1/3] Starting Backend Server...
start "MediConnect Backend" /D "E:\db....v2\MediConnectBD\backend" cmd /k "npm run dev"

echo.
echo [2/3] Starting API Gateway...
timeout /t 3 /nobreak > nul
start "MediConnect API Gateway" /D "E:\db....v2\MediConnectBD\api-gateway" cmd /k "npm run dev-stable"

echo.
echo [3/3] Starting Frontend...
timeout /t 3 /nobreak > nul
start "MediConnect Frontend" /D "E:\db....v2\MediConnectBD" cmd /k "npm run dev"

echo.
echo ✅ All services started in separate windows!
echo.
echo Services:
echo - Backend: http://localhost:5000
echo - API Gateway: http://localhost:4000  
echo - Frontend: http://localhost:3001
echo.
pause