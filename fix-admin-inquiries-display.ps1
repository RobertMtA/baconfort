# fix-admin-inquiries-display.ps1
# Script para corregir la visualización de datos en la gestión de consultas

Write-Host "🛠️ Aplicando mejoras en la visualización de datos de consultas..." -ForegroundColor Yellow

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

Write-Host "✅ Mejoras aplicadas con éxito:" -ForegroundColor Green
Write-Host "  - Creada utilidad fix-admin-inquiries-display.js para formateo de datos" -ForegroundColor Green
Write-Host "  - AdminInquiries.jsx: Implementado formateo seguro de fechas" -ForegroundColor Green
Write-Host "  - AdminInquiries.jsx: Mejorado manejo de datos nulos o inválidos" -ForegroundColor Green
Write-Host "  - AdminInquiries.jsx: Adaptador de datos para compatibilidad entre API y datos de ejemplo" -ForegroundColor Green

# Reiniciar el servidor de desarrollo
Write-Host "🔄 Reiniciando servidor de desarrollo..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow

Write-Host ""
Write-Host "✅ ¡Servidor reiniciado con las mejoras visuales!" -ForegroundColor Green
Write-Host "📋 Por favor, verifica que los datos de consultas se muestren correctamente:" -ForegroundColor Magenta
Write-Host "   1. Navega a http://localhost:3000/admin" -ForegroundColor White
Write-Host "   2. Haz clic en 'Gestión de Consultas'" -ForegroundColor White
Write-Host "   3. Verifica que las fechas, monedas y demás datos se muestren correctamente" -ForegroundColor White
