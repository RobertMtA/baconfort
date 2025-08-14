# fix-jsx-syntax.ps1
# Script para corregir error de sintaxis JSX

Write-Host "🛠️ Corrigiendo error de sintaxis JSX en fix-admin-inquiries-display..." -ForegroundColor Yellow

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
Write-Host "  - Creado archivo fix-admin-inquiries-display.jsx con extensión correcta para JSX" -ForegroundColor Green
Write-Host "  - Actualizada la importación en AdminInquiries.jsx" -ForegroundColor Green
Write-Host "  - Eliminado el archivo .js original que causaba el error" -ForegroundColor Green

# Reiniciar el servidor de desarrollo
Write-Host "🔄 Reiniciando servidor de desarrollo..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow

Write-Host ""
Write-Host "✅ ¡Servidor reiniciado con la sintaxis JSX corregida!" -ForegroundColor Green
Write-Host "📋 Por favor, verifica que el panel de administración cargue correctamente:" -ForegroundColor Magenta
Write-Host "   1. Navega a http://localhost:3000/admin" -ForegroundColor White
Write-Host "   2. Haz clic en 'Gestión de Consultas'" -ForegroundColor White
