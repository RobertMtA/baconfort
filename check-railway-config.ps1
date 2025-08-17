#!/usr/bin/env pwsh

# Script para verificar configuración actual de Railway

Write-Host "🔍 Verificando configuración actual de Railway..." -ForegroundColor Cyan
Write-Host ""

# Verificar si railway CLI está instalado
try {
    $railwayVersion = railway version 2>$null
    Write-Host "✅ Railway CLI instalado: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Railway CLI no encontrado - instalando..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# Intentar obtener variables del proyecto actual
Write-Host ""
Write-Host "📊 Intentando obtener variables del proyecto..." -ForegroundColor Yellow

try {
    Write-Host "🚂 Listando variables actuales..." -ForegroundColor Cyan
    railway variables
    
    Write-Host ""
    Write-Host "🔍 Variables importantes para verificar:" -ForegroundColor Yellow
    Write-Host "  - MONGODB_URI: Para base de datos" -ForegroundColor Gray
    Write-Host "  - EMAIL_USER: Para email service" -ForegroundColor Gray
    Write-Host "  - EMAIL_APP_PASSWORD: Para autenticación Gmail" -ForegroundColor Gray
    Write-Host "  - EMAIL_SERVICE: Debe ser 'gmail'" -ForegroundColor Gray
    Write-Host "  - ADMIN_EMAIL: Email del administrador" -ForegroundColor Gray
    
} catch {
    Write-Host "⚠️ No se pudieron obtener las variables automáticamente" -ForegroundColor Yellow
    Write-Host "💡 Verifica manualmente en: https://railway.app/dashboard" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🛠️ Para configurar las variables faltantes:" -ForegroundColor Green
Write-Host "1. MongoDB: .\setup-mongodb-railway.ps1" -ForegroundColor White
Write-Host "2. Gmail: .\setup-gmail-railway.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Después de configurar, redespliega con: .\deploy-to-railway.ps1" -ForegroundColor Cyan
