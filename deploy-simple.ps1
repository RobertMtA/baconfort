# Script de despliegue simple para BaconFort

Write-Host "===== INICIANDO DESPLIEGUE COMPLETO BACONFORT =====" -ForegroundColor Cyan
Write-Host ""

# 1. Compilar la aplicación React
Write-Host "Compilando la aplicación React..." -ForegroundColor Yellow
cd baconfort-react
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar React. Abortando." -ForegroundColor Red
    exit 1
}
Write-Host "React compilado exitosamente." -ForegroundColor Green

# 2. Desplegar a Firebase
Write-Host "Desplegando a Firebase Hosting..." -ForegroundColor Yellow
cd ..
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "Advertencia al desplegar a Firebase." -ForegroundColor Yellow
} else {
    Write-Host "Firebase desplegado exitosamente." -ForegroundColor Green
}

# 3. Desplegar a Railway
Write-Host "Desplegando backend a Railway..." -ForegroundColor Yellow
cd baconfort-backend
railway up

if ($LASTEXITCODE -ne 0) {
    Write-Host "Advertencia al desplegar a Railway." -ForegroundColor Yellow
} else {
    Write-Host "Railway desplegado exitosamente." -ForegroundColor Green
}

# 4. Volver a directorio principal
cd ..

# 5. Resumen
Write-Host ""
Write-Host "===== DESPLIEGUE COMPLETADO =====" -ForegroundColor Green
Write-Host "Frontend: https://confort-ba.web.app" -ForegroundColor Cyan
Write-Host "Backend: https://baconfort-production-084d.up.railway.app/api" -ForegroundColor Cyan
Write-Host ""
