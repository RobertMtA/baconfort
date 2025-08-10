#!/usr/bin/env pwsh

# Script de despliegue BaconFort mejorado
# Despliega automáticamente el frontend y backend desde cualquier ubicación

Write-Host "===== INICIANDO DESPLIEGUE COMPLETO BACONFORT =====" -ForegroundColor Cyan
Write-Host ""

# Almacenar el directorio actual
$inicialDir = Get-Location

# Ubicar el directorio raíz del proyecto
$rootDir = "C:\Users\rober\Desktop\baconfort5- copia"
$frontendDir = Join-Path $rootDir "baconfort-react"
$backendDir = Join-Path $rootDir "baconfort-backend"

# Verificar que existen los directorios
if (-not (Test-Path $frontendDir)) {
    Write-Host "❌ No se encuentra el directorio frontend en: $frontendDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $backendDir)) {
    Write-Host "❌ No se encuentra el directorio backend en: $backendDir" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Directorios de proyecto verificados" -ForegroundColor Green
Write-Host "📂 Frontend: $frontendDir" -ForegroundColor Cyan
Write-Host "📂 Backend: $backendDir" -ForegroundColor Cyan
Write-Host ""

# 1. Compilar React
Write-Host "🔨 Compilando la aplicación React..." -ForegroundColor Yellow
Set-Location -Path $frontendDir
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar React. Abortando." -ForegroundColor Red
    Set-Location -Path $inicialDir
    exit 1
}

Write-Host "✅ React compilado exitosamente." -ForegroundColor Green

# 2. Firebase
Write-Host "🔥 Desplegando a Firebase Hosting..." -ForegroundColor Yellow
Set-Location -Path $rootDir
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Advertencia al desplegar a Firebase." -ForegroundColor Yellow
    $firebaseSuccess = $false
} else {
    Write-Host "✅ Firebase desplegado exitosamente." -ForegroundColor Green
    $firebaseSuccess = $true
}

# 3. Railway
Write-Host "🚂 Desplegando backend a Railway..." -ForegroundColor Yellow
Set-Location -Path $backendDir
railway up

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Advertencia al desplegar a Railway." -ForegroundColor Yellow
    $railwaySuccess = $false
} else {
    Write-Host "✅ Railway desplegado exitosamente." -ForegroundColor Green
    $railwaySuccess = $true
}

# 4. Verificar API
Write-Host "🔍 Verificando el estado de la API..." -ForegroundColor Yellow
try {
    $apiCheck = Invoke-RestMethod -Uri "https://baconfort-production-084d.up.railway.app/api/properties" -Method GET -ErrorAction Stop
    
    if ($apiCheck.success -eq $true) {
        Write-Host "✅ API verificada correctamente - devuelve datos." -ForegroundColor Green
        $apiSuccess = $true
        
        # Mostrar número de propiedades
        $propCount = $apiCheck.data.Length
        Write-Host "📊 Propiedades disponibles: $propCount" -ForegroundColor Cyan
    }
    else {
        Write-Host "⚠️ La API responde pero con formato inesperado." -ForegroundColor Yellow
        $apiSuccess = $false
    }
}
catch {
    Write-Host "❌ Error al verificar la API: $_" -ForegroundColor Red
    $apiSuccess = $false
}

# 5. Volver al directorio original
Set-Location -Path $inicialDir

# 6. Resumen
Write-Host ""
Write-Host "===== INFORME DE DESPLIEGUE =====" -ForegroundColor Green

if ($firebaseSuccess) {
    Write-Host "Frontend (Firebase): ✅ Desplegado" -ForegroundColor Green
} else {
    Write-Host "Frontend (Firebase): ⚠️ Con advertencias" -ForegroundColor Yellow
}

if ($railwaySuccess) {
    Write-Host "Backend (Railway): ✅ Desplegado" -ForegroundColor Green
} else {
    Write-Host "Backend (Railway): ⚠️ Con advertencias" -ForegroundColor Yellow
}

if ($apiSuccess) {
    Write-Host "API: ✅ Funcionando" -ForegroundColor Green
} else {
    Write-Host "API: ❌ Con problemas" -ForegroundColor Red
}

Write-Host ""
Write-Host "📱 Frontend: https://confort-ba.web.app" -ForegroundColor Cyan
Write-Host "🖥️ Backend: https://baconfort-production-084d.up.railway.app/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "===== FIN DEL INFORME =====" -ForegroundColor Cyan
