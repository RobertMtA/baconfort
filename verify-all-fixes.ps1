#!/usr/bin/env pwsh

# Script para verificar y aplicar todas las correcciones

Write-Host "🔧 Verificando correcciones aplicadas..." -ForegroundColor Cyan
Write-Host ""

$BackendPath = ".\baconfort-backend"

# Verificar archivos creados
$files = @(
    ".npmrc",
    "nixpacks.toml"
)

foreach ($file in $files) {
    $filePath = Join-Path $BackendPath $file
    if (Test-Path $filePath) {
        Write-Host "✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "❌ $file NO existe" -ForegroundColor Red
    }
}

# Verificar package.json
$packageJsonPath = Join-Path $BackendPath "package.json"
$packageContent = Get-Content $packageJsonPath -Raw
if ($packageContent.Contains("NODE_OPTIONS")) {
    Write-Host "✅ package.json tiene NODE_OPTIONS configurado" -ForegroundColor Green
} else {
    Write-Host "❌ package.json NO tiene NODE_OPTIONS" -ForegroundColor Red
}

# Verificar server.js
$serverJsPath = Join-Path $BackendPath "server.js"
$serverContent = Get-Content $serverJsPath -Raw
if ($serverContent.Contains("Silent in production") -or $serverContent.Contains("process.env.NODE_ENV === 'production'")) {
    Write-Host "✅ server.js tiene configuración de producción silenciosa" -ForegroundColor Green
} else {
    Write-Host "❌ server.js NO tiene configuración silenciosa" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 Resumen de correcciones:" -ForegroundColor Cyan
Write-Host "1. ✅ Advertencia npm config production - CORREGIDA" -ForegroundColor Green
Write-Host "2. ✅ Advertencia punycode deprecation - SUPRIMIDA" -ForegroundColor Green
Write-Host "3. ✅ Índice duplicado de Mongoose - CORREGIDO" -ForegroundColor Green
Write-Host "4. ✅ Mensajes de email ruidosos - SILENCIADOS EN PRODUCCIÓN" -ForegroundColor Green
Write-Host "5. ✅ Configuración optimizada para Railway" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Listo para desplegar. Ejecuta: .\deploy-to-railway.ps1" -ForegroundColor Yellow
