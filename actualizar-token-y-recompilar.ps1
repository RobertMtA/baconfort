# Actualizar token y recompilar aplicación
$ErrorActionPreference = "Stop"

Write-Host "🔧 Iniciando actualización de token de autenticación..." -ForegroundColor Cyan
Write-Host "----------------------------------------------------------" -ForegroundColor Cyan

# Ruta al proyecto React
$reactPath = Join-Path -Path $PSScriptRoot -ChildPath "baconfort-react"

# Comprobar que estamos en la ubicación correcta
if (-Not (Test-Path -Path $reactPath)) {
    Write-Host "❌ Error: No se encuentra la carpeta baconfort-react. Ejecute este script desde el directorio raíz del proyecto." -ForegroundColor Red
    exit 1
}

Write-Host "📝 Se ha actualizado el token de autenticación en el código fuente:" -ForegroundColor Green
Write-Host "  - Token anterior: admin_static_20250812_17200_baconfort" -ForegroundColor Yellow
Write-Host "  - Token nuevo: admin_static_20250812_17300_baconfort" -ForegroundColor Green
Write-Host ""

# Navegar a la carpeta del proyecto React
Set-Location -Path $reactPath

Write-Host "🔄 Reinstalando dependencias..." -ForegroundColor Cyan
npm install

Write-Host "🔨 Recompilando la aplicación..." -ForegroundColor Cyan
npm run build

Write-Host "✅ Aplicación recompilada correctamente con el nuevo token." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Pasos siguientes:" -ForegroundColor Cyan
Write-Host "1. Inicie el servidor de desarrollo: npm start" -ForegroundColor White
Write-Host "2. Verifique que las solicitudes API ahora funcionen correctamente" -ForegroundColor White
Write-Host "3. Si sigue teniendo problemas, revise el archivo BACKEND_STATIC_TOKENS.md" -ForegroundColor White

# Volver al directorio original
Set-Location -Path $PSScriptRoot

Write-Host ""
Write-Host "¿Desea iniciar el servidor de desarrollo ahora? (S/N)" -ForegroundColor Yellow
$respuesta = Read-Host

if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Host "🚀 Iniciando servidor de desarrollo..." -ForegroundColor Cyan
    Set-Location -Path $reactPath
    npm start
}
