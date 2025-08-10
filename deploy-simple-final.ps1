#!/usr/bin/env pwsh

# Script ULTRA simplificado para desplegar BaconFort
# Sin colores ni emojis para evitar problemas de codificación

Write-Host "===== INICIANDO DESPLIEGUE BACONFORT ====="
Write-Host ""

# Almacenar directorio inicial
$startDir = Get-Location

# Directorios del proyecto
$rootDir = "C:\Users\rober\Desktop\baconfort5- copia"
$frontendDir = "$rootDir\baconfort-react"
$backendDir = "$rootDir\baconfort-backend"

# 1. Compilar frontend
Write-Host "Compilando la aplicacion React..."
Set-Location -Path $frontendDir
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar React. Abortando."
    Set-Location -Path $startDir
    exit 1
}
Write-Host "React compilado exitosamente."

# 2. Desplegar a Firebase
Write-Host "Desplegando a Firebase Hosting..."
Set-Location -Path $rootDir
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "Advertencia al desplegar a Firebase."
} else {
    Write-Host "Firebase desplegado exitosamente."
}

# 3. Desplegar a Railway
Write-Host "Desplegando backend a Railway..."
Set-Location -Path $backendDir
railway up

if ($LASTEXITCODE -ne 0) {
    Write-Host "Advertencia al desplegar a Railway."
} else {
    Write-Host "Railway desplegado exitosamente."
}

# 4. Verificar API
Write-Host "Verificando el estado de la API..."
try {
    $apiCheck = Invoke-RestMethod -Uri "https://baconfort-production-084d.up.railway.app/api/properties" -Method GET -ErrorAction Stop
    
    Write-Host "API verificada correctamente."
    Write-Host "Propiedades disponibles:" $apiCheck.data.Length
} catch {
    Write-Host "Error al verificar la API:" $_
}

# 5. Volver al directorio inicial
Set-Location -Path $startDir

# 6. Resumen
Write-Host ""
Write-Host "===== DESPLIEGUE COMPLETADO ====="
Write-Host "Frontend: https://confort-ba.web.app"
Write-Host "Backend: https://baconfort-production-084d.up.railway.app/api"
Write-Host ""
