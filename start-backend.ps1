# Script para iniciar el backend en puerto 5005
$BackendPath = "C:\Users\rober\Desktop\baconfort5- copia\baconfort-backend"

Write-Host "🚀 Iniciando servidor backend..." -ForegroundColor Green
Write-Host "📂 Directorio: $BackendPath" -ForegroundColor Cyan
Write-Host "🌐 Puerto: 5005" -ForegroundColor Cyan

# Cambiar al directorio del backend
Set-Location $BackendPath

# Verificar que estamos en el directorio correcto
$CurrentLocation = Get-Location
Write-Host "📍 Ubicación actual: $CurrentLocation" -ForegroundColor Yellow

# Verificar que server.js existe
if (Test-Path "server.js") {
    Write-Host "✅ server.js encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ server.js NO encontrado" -ForegroundColor Red
    exit 1
}

# Establecer puerto y ejecutar
$env:PORT = "5005"
Write-Host "🔧 Puerto establecido: $env:PORT" -ForegroundColor Green

# Ejecutar servidor
Write-Host "🎯 Ejecutando: node server.js" -ForegroundColor Green
node server.js
