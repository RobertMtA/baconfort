# Script para realizar commit y despliegue completo
# Despliega a GitHub, Firebase y Railway

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🚀 BACONFORT - COMMIT Y DESPLIEGUE COMPLETO" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar si hay cambios para hacer commit
Write-Host "📊 Verificando cambios pendientes..." -ForegroundColor Yellow
git status --porcelain

$hasChanges = (git status --porcelain) -ne $null
if (-not $hasChanges) {
    Write-Host "✅ No hay cambios pendientes para commit." -ForegroundColor Green
} 
else {
    # 2. Hacer commit de los cambios
    Write-Host "📝 Preparando commit de cambios..." -ForegroundColor Yellow
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commitMessage = "Actualización automática $timestamp - Mejoras en consultas y despliegue"

    git add .
    git commit -m "$commitMessage"

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al realizar commit. Abortando." -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Commit realizado exitosamente: '$commitMessage'" -ForegroundColor Green

    # 3. Push a GitHub
    Write-Host "☁️ Subiendo cambios a GitHub..." -ForegroundColor Yellow
    git push origin main

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al subir a GitHub. Abortando." -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Cambios subidos a GitHub exitosamente." -ForegroundColor Green
}

# 4. Compilar la aplicación React
Write-Host "🔧 Compilando la aplicación React..." -ForegroundColor Yellow
Set-Location -Path ".\baconfort-react"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar la aplicación React. Abortando." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Aplicación React compilada exitosamente." -ForegroundColor Green

# 5. Desplegar a Firebase (solo hosting)
Write-Host "🔥 Desplegando a Firebase Hosting..." -ForegroundColor Yellow
Set-Location -Path ".."
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al desplegar a Firebase. Revisa el mensaje de error." -ForegroundColor Red
} 
else {
    Write-Host "✅ Aplicación desplegada a Firebase exitosamente." -ForegroundColor Green
}

# 6. Desplegar el backend a Railway
Write-Host "🚂 Desplegando backend a Railway..." -ForegroundColor Yellow
Set-Location -Path ".\baconfort-backend"
railway up

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al desplegar a Railway. Revisa el mensaje de error." -ForegroundColor Red
} 
else {
    Write-Host "✅ Backend desplegado a Railway exitosamente." -ForegroundColor Green
}

# 7. Volver a la carpeta principal
Set-Location -Path ".."

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "🎉 PROCESO COMPLETADO!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✓ Commit y push a GitHub" -ForegroundColor Green
Write-Host "✓ Compilación React" -ForegroundColor Green
Write-Host "✓ Despliegue a Firebase" -ForegroundColor Green
Write-Host "✓ Despliegue a Railway" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: https://confort-ba.web.app" -ForegroundColor Cyan
$backendUrl = "https://baconfort-production-084d.up.railway.app/api"
Write-Host "🖥️ Backend: $backendUrl" -ForegroundColor Cyan
Write-Host ""
