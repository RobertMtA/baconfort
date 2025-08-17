#!/usr/bin/env pwsh

# Script para actualizar dependencias y corregir advertencias

Write-Host "🔧 Corrigiendo advertencias y actualizando dependencias..." -ForegroundColor Cyan

$BackendPath = ".\baconfort-backend"

if (-not (Test-Path $BackendPath)) {
    Write-Host "❌ Directorio backend no encontrado: $BackendPath" -ForegroundColor Red
    exit 1
}

Set-Location $BackendPath

Write-Host "📦 Actualizando package.json para eliminar advertencias..." -ForegroundColor Yellow

# Crear .npmrc para evitar advertencias de producción
$npmrcContent = @"
production=true
omit=dev
"@

$npmrcContent | Out-File -FilePath ".npmrc" -Encoding UTF8
Write-Host "✅ Archivo .npmrc creado" -ForegroundColor Green

# Actualizar dependencias
Write-Host "📦 Instalando dependencias actualizadas..." -ForegroundColor Yellow

try {
    npm install --production --no-fund --no-audit
    Write-Host "✅ Dependencias actualizadas exitosamente" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Error al actualizar dependencias: $($_.Exception.Message)" -ForegroundColor Yellow
}

Set-Location ..
Write-Host ""
Write-Host "✅ Correcciones aplicadas. Ejecuta deploy-to-railway.ps1 para aplicar cambios." -ForegroundColor Green
