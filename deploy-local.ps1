# deploy-local.ps1
# Script para construir y desplegar localmente el proyecto

Write-Host "🚀 Iniciando despliegue local..." -ForegroundColor Cyan

# Navegar al directorio frontend
Write-Host "📁 Navegando al directorio frontend..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\baconfort-react"

# Instalar dependencias si es necesario
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Construir el proyecto
Write-Host "🏗️ Construyendo el proyecto..." -ForegroundColor Yellow
npx vite build

# Verificar si la construcción fue exitosa
if (Test-Path -Path "dist") {
    Write-Host "✅ Construcción exitosa!" -ForegroundColor Green
    
    # Opcionalmente, podemos previsualizar el resultado
    $previewOption = Read-Host "¿Deseas previsualizar el resultado? (s/n)"
    if ($previewOption -eq "s") {
        Write-Host "🔍 Iniciando vista previa..." -ForegroundColor Yellow
        npm run preview
    }
} else {
    Write-Host "❌ Error en la construcción. Verifica los errores anteriores." -ForegroundColor Red
}

Set-Location -Path $PSScriptRoot
Write-Host "✨ Proceso completado!" -ForegroundColor Cyan
