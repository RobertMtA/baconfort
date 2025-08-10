#!/usr/bin/env pwsh

# Script para realizar commit y despliegue completo a GitHub, Firebase y Railway

# Colores
$colorCyan = "Cyan"
$colorGreen = "Green"
$colorYellow = "Yellow"
$colorRed = "Red"
$colorWhite = "White"

# Mostrar encabezado
Write-Host "=====================================" -ForegroundColor $colorCyan
Write-Host "🚀 BACONFORT - COMMIT Y DESPLIEGUE COMPLETO" -ForegroundColor $colorCyan
Write-Host "=====================================" -ForegroundColor $colorCyan
Write-Host ""

# 1. Verificar si hay cambios para hacer commit
Write-Host "📊 Verificando cambios pendientes..." -ForegroundColor $colorYellow
$gitStatus = git status --porcelain

if (-not $gitStatus) {
    Write-Host "✅ No hay cambios pendientes para commit." -ForegroundColor $colorGreen
    $hasChanges = $false
} else {
    $hasChanges = $true
    
    # 2. Hacer commit de los cambios
    Write-Host "📝 Preparando commit de cambios..." -ForegroundColor $colorYellow
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commitMessage = "Actualización automática $timestamp - Mejoras en consultas y despliegue"

    git add .
    git commit -m "$commitMessage"

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al realizar commit. Abortando." -ForegroundColor $colorRed
        exit 1
    }

    Write-Host "✅ Commit realizado exitosamente: '$commitMessage'" -ForegroundColor $colorGreen

    # 3. Push a GitHub
    Write-Host "☁️ Subiendo cambios a GitHub..." -ForegroundColor $colorYellow
    git push origin main

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al subir a GitHub. Abortando." -ForegroundColor $colorRed
        exit 1
    }

    Write-Host "✅ Cambios subidos a GitHub exitosamente." -ForegroundColor $colorGreen
}

# 4. Compilar la aplicación React
Write-Host "🔧 Compilando la aplicación React..." -ForegroundColor $colorYellow
Set-Location -Path ".\baconfort-react"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar la aplicación React. Abortando." -ForegroundColor $colorRed
    exit 1
}

Write-Host "✅ Aplicación React compilada exitosamente." -ForegroundColor $colorGreen

# 5. Desplegar a Firebase (solo hosting)
Write-Host "🔥 Desplegando a Firebase Hosting..." -ForegroundColor $colorYellow
Set-Location -Path ".."
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al desplegar a Firebase. Revisa el mensaje de error." -ForegroundColor $colorRed
    $firebaseSuccess = $false
} else {
    Write-Host "✅ Aplicación desplegada a Firebase exitosamente." -ForegroundColor $colorGreen
    $firebaseSuccess = $true
}

# 6. Desplegar el backend a Railway
Write-Host "🚂 Desplegando backend a Railway..." -ForegroundColor $colorYellow
Set-Location -Path ".\baconfort-backend"
railway up

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al desplegar a Railway. Revisa el mensaje de error." -ForegroundColor $colorRed
    $railwaySuccess = $false
} else {
    Write-Host "✅ Backend desplegado a Railway exitosamente." -ForegroundColor $colorGreen
    $railwaySuccess = $true
}

# 7. Volver a la carpeta principal
Set-Location -Path ".."

Write-Host ""
Write-Host "=====================================" -ForegroundColor $colorGreen
Write-Host "🎉 PROCESO COMPLETADO!" -ForegroundColor $colorGreen
Write-Host "=====================================" -ForegroundColor $colorGreen

if ($hasChanges) {
    Write-Host "✓ Commit y push a GitHub" -ForegroundColor $colorGreen
}

Write-Host "✓ Compilación React" -ForegroundColor $colorGreen

if ($firebaseSuccess) {
    Write-Host "✓ Despliegue a Firebase" -ForegroundColor $colorGreen
} else {
    Write-Host "⚠️ Despliegue a Firebase: con advertencias" -ForegroundColor $colorYellow
}

if ($railwaySuccess) {
    Write-Host "✓ Despliegue a Railway" -ForegroundColor $colorGreen
} else {
    Write-Host "⚠️ Despliegue a Railway: con advertencias" -ForegroundColor $colorYellow
}

Write-Host ""
Write-Host "📱 Frontend: https://confort-ba.web.app" -ForegroundColor $colorCyan
Write-Host "🖥️ Backend: https://baconfort-production-084d.up.railway.app/api" -ForegroundColor $colorCyan
Write-Host ""
