# Script para realizar commit y push de los cambios de configuración de GitHub Actions

$ErrorActionPreference = "Stop"

Write-Host "🚀 Preparando commit y push de las correcciones de GitHub Actions..." -ForegroundColor Cyan

# Ejecutar la validación primero
Write-Host "📋 Ejecutando validación de estructura..." -ForegroundColor Yellow
./validate-for-actions.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ La validación ha fallado. Resuelva los problemas antes de continuar." -ForegroundColor Red
    exit 1
}

# Agregar los archivos modificados
Write-Host "📝 Agregando archivos modificados..." -ForegroundColor Yellow
git add .github/workflows/deploy.yml

# Realizar el commit
Write-Host "💾 Realizando commit..." -ForegroundColor Yellow
git commit -m "Fix: Corregida configuración de GitHub Actions para solucionar error de caché de dependencias"

# Push a GitHub
Write-Host "🔼 Empujando cambios a GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Proceso completado. Los cambios han sido enviados a GitHub." -ForegroundColor Green
