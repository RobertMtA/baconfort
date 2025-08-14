# Script para resolver el problema de tokens inválidos
$ErrorActionPreference = "Stop"

Write-Host "🔧 SOLUCIÓN COMPLETA PARA ERRORES DE TOKEN INVÁLIDO" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que los tokens ya estén actualizados
Write-Host "PASO 1: Verificando tokens actuales" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

$apiJsPath = Join-Path -Path $PSScriptRoot -ChildPath "baconfort-react\src\services\api.js"
$adminAuthPath = Join-Path -Path $PSScriptRoot -ChildPath "baconfort-react\src\utils\adminAuth.js"

# Token correcto según documentación
$tokenCorrecto = "admin_static_20250812_17300_baconfort"
$tokenAntiguo = "admin_static_20250812_17200_baconfort"
$requiereActualizar = $false

# Verificar api.js
if (Test-Path $apiJsPath) {
    $apiJsContent = Get-Content $apiJsPath -Raw
    if ($apiJsContent -match $tokenAntiguo) {
        Write-Host "❌ api.js: Token incorrecto encontrado" -ForegroundColor Red
        $requiereActualizar = $true
    } else {
        Write-Host "✅ api.js: Token configurado correctamente" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ api.js: No se encontró el archivo" -ForegroundColor Yellow
}

# Verificar adminAuth.js
if (Test-Path $adminAuthPath) {
    $adminAuthContent = Get-Content $adminAuthPath -Raw
    if ($adminAuthContent -match $tokenAntiguo) {
        Write-Host "❌ adminAuth.js: Token incorrecto encontrado" -ForegroundColor Red
        $requiereActualizar = $true
    } else {
        Write-Host "✅ adminAuth.js: Token configurado correctamente" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ adminAuth.js: No se encontró el archivo" -ForegroundColor Yellow
}

# 2. Actualizar tokens si es necesario
if ($requiereActualizar) {
    Write-Host ""
    Write-Host "PASO 2: Actualizando tokens estáticos" -ForegroundColor Yellow
    Write-Host "-----------------------------------" -ForegroundColor Yellow
    
    # Actualizar api.js
    if (Test-Path $apiJsPath) {
        $apiJsContent = Get-Content $apiJsPath -Raw
        $apiJsContent = $apiJsContent -replace $tokenAntiguo, $tokenCorrecto
        Set-Content -Path $apiJsPath -Value $apiJsContent
        Write-Host "✅ api.js: Token actualizado a $tokenCorrecto" -ForegroundColor Green
    }
    
    # Actualizar adminAuth.js
    if (Test-Path $adminAuthPath) {
        $adminAuthContent = Get-Content $adminAuthPath -Raw
        $adminAuthContent = $adminAuthContent -replace $tokenAntiguo, $tokenCorrecto
        Set-Content -Path $adminAuthPath -Value $adminAuthContent
        Write-Host "✅ adminAuth.js: Token actualizado a $tokenCorrecto" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Todos los tokens están correctamente configurados" -ForegroundColor Green
}

# 3. Implementar cambios para bypass de emergencia
Write-Host ""
Write-Host "PASO 3: Implementando bypass de emergencia" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

# Ejecutar script de configuración de token de emergencia
Write-Host "Ejecutando script de configuración de token de emergencia en el backend..." -ForegroundColor White
& "$PSScriptRoot\configurar-token-emergencia-backend.ps1"

Write-Host ""
Write-Host "PASO 4: Instrucciones finales" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow
Write-Host "1. Reinicie el servidor backend para aplicar los cambios" -ForegroundColor White
Write-Host "2. Reinicie el servidor frontend con 'npm start' en la carpeta baconfort-react" -ForegroundColor White
Write-Host "3. Verifique que los errores de token inválido hayan desaparecido" -ForegroundColor White
Write-Host ""
Write-Host "Para más información, consulte el archivo SOLUCION_TOKEN_INVALIDO.md" -ForegroundColor White
Write-Host ""
Write-Host "¿Desea reiniciar el servidor frontend ahora? (S/N)" -ForegroundColor Cyan
$respuesta = Read-Host

if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Host "Reiniciando el servidor frontend..." -ForegroundColor Cyan
    Set-Location -Path (Join-Path -Path $PSScriptRoot -ChildPath "baconfort-react")
    npm start
}
