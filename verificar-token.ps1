# Verificar configuración de tokens
$ErrorActionPreference = "Stop"

Write-Host "🔍 Verificando configuración de tokens..." -ForegroundColor Cyan
Write-Host "----------------------------------------------------------" -ForegroundColor Cyan

# Verificar archivos principales
$apiJsPath = Join-Path -Path $PSScriptRoot -ChildPath "baconfort-react\src\services\api.js"
$adminAuthPath = Join-Path -Path $PSScriptRoot -ChildPath "baconfort-react\src\utils\adminAuth.js"

# Token correcto según documentación
$tokenCorrecto = "admin_static_20250812_17300_baconfort"

# Verificar api.js
if (Test-Path $apiJsPath) {
    $apiJsContent = Get-Content $apiJsPath -Raw
    if ($apiJsContent -match "admin_static_20250812_17200_baconfort") {
        Write-Host "❌ api.js: Token incorrecto encontrado" -ForegroundColor Red
        Write-Host "   Se encontró: admin_static_20250812_17200_baconfort" -ForegroundColor Yellow
        Write-Host "   Debería ser: $tokenCorrecto" -ForegroundColor Yellow
    } else {
        Write-Host "✅ api.js: Token configurado correctamente" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ api.js: No se encontró el archivo" -ForegroundColor Yellow
}

# Verificar adminAuth.js
if (Test-Path $adminAuthPath) {
    $adminAuthContent = Get-Content $adminAuthPath -Raw
    if ($adminAuthContent -match "admin_static_20250812_17200_baconfort") {
        Write-Host "❌ adminAuth.js: Token incorrecto encontrado" -ForegroundColor Red
        Write-Host "   Se encontró: admin_static_20250812_17200_baconfort" -ForegroundColor Yellow
        Write-Host "   Debería ser: $tokenCorrecto" -ForegroundColor Yellow
    } else {
        Write-Host "✅ adminAuth.js: Token configurado correctamente" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ adminAuth.js: No se encontró el archivo" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Sugerencias para la corrección:" -ForegroundColor Cyan
Write-Host "1. Ejecute el script actualizar-token-y-recompilar.ps1 para actualizar los tokens" -ForegroundColor White
Write-Host "2. Verifique la configuración del backend para asegurarse que acepta el token:" -ForegroundColor White
Write-Host "   $tokenCorrecto" -ForegroundColor White
