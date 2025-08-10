#!/usr/bin/env pwsh

# Script simplificado de despliegue con verificación
Write-Host "===== INICIANDO DESPLIEGUE BACONFORT =====" -ForegroundColor Cyan
Write-Host ""

# 1. Compilar React
Write-Host "Compilando la aplicación React..." -ForegroundColor Yellow
Set-Location -Path "..\baconfort-react"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar React. Abortando." -ForegroundColor Red
    exit 1
}
Write-Host "React compilado exitosamente." -ForegroundColor Green

# 2. Firebase
Write-Host "Desplegando a Firebase Hosting..." -ForegroundColor Yellow
Set-Location -Path ".."
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "Advertencia al desplegar a Firebase." -ForegroundColor Yellow
} else {
    Write-Host "Firebase desplegado exitosamente." -ForegroundColor Green
}

# 3. Railway
Write-Host "Desplegando backend a Railway..." -ForegroundColor Yellow
Set-Location -Path ".\baconfort-backend"
railway up

if ($LASTEXITCODE -ne 0) {
    Write-Host "Advertencia al desplegar a Railway." -ForegroundColor Yellow
} else {
    Write-Host "Railway desplegado exitosamente." -ForegroundColor Green
}

# 4. Verificar API
Write-Host "Verificando el estado de la API..." -ForegroundColor Yellow
try {
    $apiCheck = Invoke-RestMethod -Uri "https://baconfort-production-084d.up.railway.app/api/properties" -Method GET -ErrorAction Stop
    
    Write-Host "API verificada correctamente." -ForegroundColor Green
    Write-Host "Propiedades disponibles: $($apiCheck.data.Length)" -ForegroundColor Cyan
} catch {
    Write-Host "Error al verificar la API: $_" -ForegroundColor Red
}

# 5. Volver
Set-Location -Path ".."

# 6. Resumen
Write-Host ""
Write-Host "===== DESPLIEGUE COMPLETADO =====" -ForegroundColor Green
Write-Host "Frontend: https://confort-ba.web.app" -ForegroundColor Cyan
Write-Host "Backend: https://baconfort-production-084d.up.railway.app/api" -ForegroundColor Cyan
Write-Host ""
