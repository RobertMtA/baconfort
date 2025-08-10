#!/usr/bin/env pwsh

# Script para realizar commit y despliegue completo a GitHub, Firebase y Railway

$Host.UI.RawUI.ForegroundColor = "Cyan"
Write-Host "====================================="
Write-Host "🚀 BACONFORT - COMMIT Y DESPLIEGUE COMPLETO"
Write-Host "====================================="
$Host.UI.RawUI.ForegroundColor = "White"
Write-Host ""

# Función para mostrar mensajes con color
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Color
    )
    
    $previousColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Message
    $Host.UI.RawUI.ForegroundColor = $previousColor
}

# 1. Verificar si hay cambios para hacer commit
Write-ColorMessage "📊 Verificando cambios pendientes..." "Yellow"
$gitStatus = git status --porcelain

if (-not $gitStatus) {
    Write-ColorMessage "✅ No hay cambios pendientes para commit." "Green"
    $hasChanges = $false
} 
else {
    $hasChanges = $true
    
    # 2. Hacer commit de los cambios
    Write-ColorMessage "📝 Preparando commit de cambios..." "Yellow"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commitMessage = "Actualización automática $timestamp - Mejoras en consultas y despliegue"

    git add .
    git commit -m "$commitMessage"

    if ($LASTEXITCODE -ne 0) {
        Write-ColorMessage "❌ Error al realizar commit. Abortando." "Red"
        exit 1
    }

    Write-ColorMessage "✅ Commit realizado exitosamente: '$commitMessage'" "Green"

    # 3. Push a GitHub
    Write-ColorMessage "☁️ Subiendo cambios a GitHub..." "Yellow"
    git push origin main

    if ($LASTEXITCODE -ne 0) {
        Write-ColorMessage "❌ Error al subir a GitHub. Abortando." "Red"
        exit 1
    }

    Write-ColorMessage "✅ Cambios subidos a GitHub exitosamente." "Green"
}

# 4. Compilar la aplicación React
Write-ColorMessage "🔧 Compilando la aplicación React..." "Yellow"
Set-Location -Path ".\baconfort-react"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "❌ Error al compilar la aplicación React. Abortando." "Red"
    exit 1
}

Write-ColorMessage "✅ Aplicación React compilada exitosamente." "Green"

# 5. Desplegar a Firebase (solo hosting)
Write-ColorMessage "🔥 Desplegando a Firebase Hosting..." "Yellow"
Set-Location -Path ".."
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "❌ Error al desplegar a Firebase. Revisa el mensaje de error." "Red"
    $firebaseSuccess = $false
} 
else {
    Write-ColorMessage "✅ Aplicación desplegada a Firebase exitosamente." "Green"
    $firebaseSuccess = $true
}

# 6. Desplegar el backend a Railway
Write-ColorMessage "🚂 Desplegando backend a Railway..." "Yellow"
Set-Location -Path ".\baconfort-backend"
railway up

if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "❌ Error al desplegar a Railway. Revisa el mensaje de error." "Red"
    $railwaySuccess = $false
} 
else {
    Write-ColorMessage "✅ Backend desplegado a Railway exitosamente." "Green"
    $railwaySuccess = $true
}

# 7. Volver a la carpeta principal
Set-Location -Path ".."

Write-Host ""
$Host.UI.RawUI.ForegroundColor = "Green"
Write-Host "====================================="
Write-Host "🎉 PROCESO COMPLETADO!"
Write-Host "====================================="

if ($hasChanges) {
    Write-Host "✓ Commit y push a GitHub"
}

Write-Host "✓ Compilación React"

if ($firebaseSuccess) {
    Write-Host "✓ Despliegue a Firebase"
}
else {
    $Host.UI.RawUI.ForegroundColor = "Yellow"
    Write-Host "⚠️ Despliegue a Firebase: con advertencias"
    $Host.UI.RawUI.ForegroundColor = "Green"
}

if ($railwaySuccess) {
    Write-Host "✓ Despliegue a Railway"
}
else {
    $Host.UI.RawUI.ForegroundColor = "Yellow"
    Write-Host "⚠️ Despliegue a Railway: con advertencias"
    $Host.UI.RawUI.ForegroundColor = "Green"
}

Write-Host ""
$Host.UI.RawUI.ForegroundColor = "Cyan"
Write-Host "📱 Frontend: https://confort-ba.web.app"
Write-Host "🖥️ Backend: https://baconfort-production-084d.up.railway.app/api"
$Host.UI.RawUI.ForegroundColor = "White"
Write-Host ""
