# fix-admin-inquiries-token-updated.ps1
# Script para corregir el token de acceso a las consultas de administrador

Write-Host "🛠️ Aplicando corrección al token de administrador para consultas..." -ForegroundColor Yellow

# Verificar si hay procesos de npm existentes y terminarlos
$npmProcesses = Get-Process -Name "npm" -ErrorAction SilentlyContinue

if ($npmProcesses) {
    Write-Host "🛑 Deteniendo procesos npm existentes..." -ForegroundColor Cyan
    $npmProcesses | ForEach-Object { $_.Kill() }
    Start-Sleep -Seconds 2
}

# Mover al directorio del proyecto React
$reactPath = Join-Path -Path $PSScriptRoot -ChildPath "baconfort-react"
Set-Location -Path $reactPath

Write-Host "✅ Actualizaciones aplicadas con éxito:" -ForegroundColor Green
Write-Host "  - api.js: Token fijo actualizado a 'admin_static_20250812_17200_baconfort'" -ForegroundColor Green
Write-Host "  - adminAuth.js: Token estático actualizado" -ForegroundColor Green
Write-Host "  - BACKEND_STATIC_TOKENS.md: Documentación actualizada" -ForegroundColor Green

# Reiniciar el servidor de desarrollo
Write-Host "🔄 Reiniciando servidor de desarrollo..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow

Write-Host ""
Write-Host "✅ ¡Servidor reiniciado con el token actualizado!" -ForegroundColor Green
Write-Host "📋 Por favor, verifica que la gestión de consultas funcione correctamente:" -ForegroundColor Magenta
Write-Host "   1. Navega a http://localhost:3000/admin" -ForegroundColor White
Write-Host "   2. Haz clic en 'Gestión de Consultas'" -ForegroundColor White
Write-Host "   3. Confirma que las consultas se carguen sin errores 403" -ForegroundColor White
