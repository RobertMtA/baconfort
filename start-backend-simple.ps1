# Script simple para iniciar el backend
Write-Host "🚀 Iniciando servidor backend simple..." -ForegroundColor Green

# Navegar al directorio del backend
$backendDir = "C:\Users\rober\Desktop\baconfort5- copia\baconfort-backend"
Set-Location $backendDir

# Verificar que server.js exista
if (-not (Test-Path "server.js")) {
    Write-Host "❌ Error: server.js no encontrado en $backendDir" -ForegroundColor Red
    exit 1
}

# Configurar variables de entorno
$env:PORT = "5005"
$env:NODE_ENV = "development"

Write-Host "🌐 Puerto configurado: $($env:PORT)" -ForegroundColor Cyan
Write-Host "🌍 Entorno: $($env:NODE_ENV)" -ForegroundColor Cyan

# Iniciar el servidor y mantenerlo ejecutándose
Write-Host "🎯 Iniciando servidor..." -ForegroundColor Yellow

# Usar start-process para mantener el servidor ejecutándose en segundo plano
Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $backendDir -WindowStyle Normal

Write-Host "✅ Servidor iniciado en segundo plano" -ForegroundColor Green
Write-Host "🔍 Verifica en: http://localhost:5005/health" -ForegroundColor Cyan
