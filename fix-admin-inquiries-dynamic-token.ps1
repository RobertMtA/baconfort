# fix-admin-inquiries-dynamic-token.ps1
# Script para solucionar definitivamente el problema de autenticación en consultas

Write-Host "🛠️ Aplicando solución dinámica para gestión de consultas de administrador..." -ForegroundColor Yellow

# Verificar si hay procesos de npm existentes y terminarlos
$npmProcesses = Get-Process -Name "npm" -ErrorAction SilentlyContinue

if ($npmProcesses) {
    Write-Host "🛑 Deteniendo procesos npm existentes..." -ForegroundColor Cyan
    $npmProcesses | ForEach-Object { $_.Kill() }
    Start-Sleep -Seconds 2
}

# Actualizar el archivo BACKEND_STATIC_TOKENS.md
Write-Host "✏️ Actualizando documentación..." -ForegroundColor Cyan

$backendTokensPath = Join-Path -Path $PSScriptRoot -ChildPath "BACKEND_STATIC_TOKENS.md"
$tokenContent = Get-Content -Path $backendTokensPath -Raw

# Reemplazar la sección con instrucciones actualizadas
$newContent = $tokenContent -replace "### Token principal para consultas(\r\n|\n)```(\r\n|\n)admin_static_\d{8}_\d{5}_baconfort(\r\n|\n)```", @"
### Token principal para consultas
```
Se deben aceptar todos los tokens con el formato: admin_static_YYYYMMDD_HHmm0_baconfort
```

Ejemplos válidos:
```
admin_static_20250812_17300_baconfort
admin_static_20250812_17400_baconfort
admin_static_20250812_17500_baconfort
```
"@

# Guardar los cambios
$newContent | Set-Content -Path $backendTokensPath -Force

# Mover al directorio del proyecto React
$reactPath = Join-Path -Path $PSScriptRoot -ChildPath "baconfort-react"
Set-Location -Path $reactPath

Write-Host "✅ Correcciones aplicadas con éxito:" -ForegroundColor Green
Write-Host "  - api.js: Modificado getAllInquiries para usar el mismo token del sistema" -ForegroundColor Green
Write-Host "  - BACKEND_STATIC_TOKENS.md: Actualizado con instrucciones de formato dinámico" -ForegroundColor Green

# Reiniciar el servidor de desarrollo
Write-Host "🔄 Reiniciando servidor de desarrollo..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow

Write-Host ""
Write-Host "✅ ¡Servidor reiniciado con las correcciones aplicadas!" -ForegroundColor Green
Write-Host "📋 Por favor, verifica que la gestión de consultas funcione correctamente:" -ForegroundColor Magenta
Write-Host "   1. Navega a http://localhost:3000/admin" -ForegroundColor White
Write-Host "   2. Haz clic en 'Gestión de Consultas'" -ForegroundColor White
Write-Host "   3. Confirma que las consultas se carguen con el token dinámico" -ForegroundColor White

Write-Host ""
Write-Host "⚠️ NOTA IMPORTANTE:" -ForegroundColor Yellow
Write-Host "  Para una solución completa, es necesario actualizar el backend para aceptar" -ForegroundColor White
Write-Host "  tokens en el formato dinámico admin_static_YYYYMMDD_HHmm0_baconfort" -ForegroundColor White
