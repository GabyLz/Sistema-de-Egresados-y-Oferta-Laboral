# Start system - will fail if DB/Redis not running
Write-Host "Sistema de Egresados y Oferta Laboral" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Green
Write-Host ""

# Check Docker
Write-Host "[1/5] Verificando Docker..." -ForegroundColor Cyan
$dockerCheck = docker ps 2>$null
if ($null -eq $dockerCheck) {
    Write-Host "⚠ Docker no está disponible. Las bases de datos no se iniciarán." -ForegroundColor Yellow
} else {
    Write-Host "✓ Docker está disponible" -ForegroundColor Green
    
    # Start services
    Write-Host "[2/5] Iniciando PostgreSQL y Redis..." -ForegroundColor Cyan
    docker-compose up -d
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "[3/5] Iniciando Backend (Puerto 3001)..." -ForegroundColor Cyan
Write-Host "Abre una NUEVA terminal PowerShell y corre:" -ForegroundColor Yellow
Write-Host "  cd apps/api" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host ""

Write-Host "[4/5] Iniciando Frontend (Puerto 3000)..." -ForegroundColor Cyan
Write-Host "En OTRA terminal PowerShell:" -ForegroundColor Yellow
Write-Host "  cd apps/web" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host ""

Write-Host "[5/5] URLs de acceso:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor Green
Write-Host "  API Doc:  POST http://localhost:3001/auth/login" -ForegroundColor Green
Write-Host ""

Write-Host "Primero, asegúrate de ejecutar la migración:" -ForegroundColor Yellow
Write-Host "  cd apps/api" -ForegroundColor Yellow
Write-Host "  npx prisma migrate dev --name init" -ForegroundColor Yellow
