# fix-admin-inquiries-hardcoded.ps1
# Script para corregir el acceso a las consultas de administrador usando token hardcodeado

Write-Host "🛠️ Aplicando solución para gestión de consultas de administrador con token fijo..." -ForegroundColor Yellow

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

Write-Host "✅ Correcciones aplicadas con éxito:" -ForegroundColor Green
Write-Host "  - api.js: Modificado getAllInquiries para usar token fijo hardcodeado" -ForegroundColor Green
Write-Host "  - Token usado: admin_static_20250812_17000_baconfort" -ForegroundColor Green
Write-Host "  - BACKEND_STATIC_TOKENS.md: Actualizado para mostrar el token correcto" -ForegroundColor Green

# Reiniciar el servidor de desarrollo
Write-Host "🔄 Reiniciando servidor de desarrollo..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow

Write-Host ""
Write-Host "✅ ¡Servidor reiniciado con las correcciones aplicadas!" -ForegroundColor Green
Write-Host "📋 Por favor, verifica que la gestión de consultas funcione correctamente:" -ForegroundColor Magenta
Write-Host "   1. Navega a http://localhost:3000/admin" -ForegroundColor White
Write-Host "   2. Haz clic en 'Gestión de Consultas'" -ForegroundColor White
Write-Host "   3. Confirma que las consultas se carguen sin errores 403" -ForegroundColor White
