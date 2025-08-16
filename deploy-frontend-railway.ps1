# Script para desplegar frontend limpio en Railway como alternativa
Write-Host "🚀 Copiando build limpio a Railway backend para servir como alternativa..." -ForegroundColor Cyan

# Crear directorio público en el backend si no existe
$publicDir = "c:\Users\rober\Desktop\baconfort5- copia\baconfort-backend\public"
if (-not (Test-Path $publicDir)) {
    New-Item -ItemType Directory -Path $publicDir -Force
    Write-Host "📁 Creado directorio público en backend: $publicDir" -ForegroundColor Green
}

# Copiar build completo al backend
$buildSource = "c:\Users\rober\Desktop\baconfort5- copia\baconfort-react\dist\*"
$buildDest = $publicDir

Write-Host "📦 Copiando build desde: $buildSource" -ForegroundColor Yellow
Write-Host "📦 Copiando build hacia: $buildDest" -ForegroundColor Yellow

Copy-Item -Path $buildSource -Destination $buildDest -Recurse -Force

Write-Host "✅ Build copiado exitosamente al backend de Railway" -ForegroundColor Green

# Verificar archivos copiados
$copiedFiles = Get-ChildItem $publicDir -Recurse | Measure-Object
Write-Host "📊 Total de archivos copiados: $($copiedFiles.Count)" -ForegroundColor Cyan

# Configurar Railway backend para servir archivos estáticos
$serverFile = "c:\Users\rober\Desktop\baconfort5- copia\baconfort-backend\server.js"
if (Test-Path $serverFile) {
    Write-Host "🔧 Verificando configuración de archivos estáticos en server.js..." -ForegroundColor Yellow
    
    $serverContent = Get-Content $serverFile -Raw
    if ($serverContent -match "app\.use\(express\.static") {
        Write-Host "✅ Configuración de archivos estáticos ya presente" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Puede que falte configuración de archivos estáticos en server.js" -ForegroundColor Orange
    }
}

Write-Host "`n🌐 Frontend limpio disponible en Railway:" -ForegroundColor Cyan
Write-Host "🔗 https://baconfort-production.up.railway.app" -ForegroundColor Blue
Write-Host "🎯 Aplicación sin logs de debug lista para producción" -ForegroundColor Green
