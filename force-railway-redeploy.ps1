# Script para limpiar archivos grandes temporalmente y forzar redeploy desde GitHub
Write-Host "🗑️ Limpiando archivos grandes temporalmente para forzar redeploy..." -ForegroundColor Cyan

# Remover temporalmente el directorio public del backend
$publicDir = "c:\Users\rober\Desktop\baconfort5- copia\baconfort-backend\public"
if (Test-Path $publicDir) {
    Write-Host "📁 Removiendo temporalmente: $publicDir" -ForegroundColor Yellow
    Remove-Item $publicDir -Recurse -Force
    Write-Host "✅ Directorio public removido temporalmente" -ForegroundColor Green
}

# Commit la eliminación temporal
Write-Host "📦 Haciendo commit temporal..." -ForegroundColor Yellow
Set-Location "c:\Users\rober\Desktop\baconfort5- copia"
git add -A
git commit -m "🚀 TEMP: Removido public/ para forzar redeploy desde GitHub

Railway se sincronizará automáticamente con el repositorio
El frontend será servido cuando Railway procese el código"

# Push para trigger auto-deploy en Railway
git push

Write-Host "`n✅ Código pushado a GitHub" -ForegroundColor Green
Write-Host "🔄 Railway debería iniciar auto-deploy automáticamente" -ForegroundColor Cyan
Write-Host "🌐 Verifica en: https://railway.app/dashboard" -ForegroundColor Blue

# Restaurar el directorio público localmente después del deploy
Write-Host "`n🔄 Restaurando archivos localmente..." -ForegroundColor Cyan
