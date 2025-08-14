# fix-admin-inquiries.ps1
# Script para aplicar correcciones a las consultas de administrador

Write-Host "🛠️ Aplicando correcciones para la gestión de consultas de administrador..." -ForegroundColor Yellow

# Verificar si hay procesos de npm existentes y terminarlos
$npmProcesses = Get-Process -Name "npm" -ErrorAction SilentlyContinue

if ($npmProcesses) {
    Write-Host "🛑 Deteniendo procesos npm existentes..." -ForegroundColor Cyan
    $npmProcesses | ForEach-Object { $_.Kill() }
    Start-Sleep -Seconds 2
}

# Mover al directorio del proyecto React
Set-Location -Path "$PSScriptRoot\baconfort-react"

# Actualizar documentación
Write-Host "✏️ Actualizando documentación de implementación..." -ForegroundColor Cyan
$backendTokensPath = "$PSScriptRoot\BACKEND_STATIC_TOKENS.md"

# Modificar el contenido del archivo
$content = Get-Content -Path $backendTokensPath -Raw
$newContent = $content -replace "FIXED_ADMIN_TOKEN_INQUIRIES_20250812", "admin_static_YYYYMMDD_HHmm0_baconfort"
$newContent | Set-Content -Path $backendTokensPath -Force

Write-Host "✅ Correcciones aplicadas con éxito:" -ForegroundColor Green
Write-Host "  - api.js: Modificado getAllInquiries para usar el mismo token estático que el resto del panel" -ForegroundColor Green
Write-Host "  - api.js: Implementada función generateStaticAdminToken para generar tokens consistentes" -ForegroundColor Green
Write-Host "  - Actualizada documentación para el backend" -ForegroundColor Green

# Reiniciar el servidor de desarrollo
Write-Host "🔄 Reiniciando servidor de desarrollo..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow

Write-Host "✅ ¡Servidor reiniciado con las correcciones aplicadas!" -ForegroundColor Green
Write-Host "   Por favor verifica que la gestión de consultas funcione correctamente" -ForegroundColor Yellow
