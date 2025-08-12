#!/usr/bin/env pwsh

# Script para iniciar el servidor en un puerto alternativo
param (
    [int]$Puerto = 5005
)

Write-Host "🚀 Iniciando servidor BaconFort en puerto alternativo $Puerto..." -ForegroundColor Cyan

# Verificar si estamos en el directorio correcto
if (-not (Test-Path ".\baconfort-backend\server.js")) {
    # Si no estamos en la raíz del proyecto, intentar navegar a ella
    if (Test-Path ".\server.js") {
        Write-Host "📂 Ya estamos en el directorio baconfort-backend" -ForegroundColor Green
    } else {
        # Intentar navegar al directorio del backend
        if (Test-Path "..\baconfort-backend\server.js") {
            Set-Location -Path ".."
        }
        
        if (Test-Path ".\baconfort-backend\server.js") {
            Write-Host "📂 Navegando al directorio del backend..." -ForegroundColor Yellow
            Set-Location -Path ".\baconfort-backend"
        } else {
            Write-Host "❌ Error: No se puede encontrar el archivo server.js" -ForegroundColor Red
            Write-Host "   Asegúrate de ejecutar este script desde el directorio raíz del proyecto" -ForegroundColor Red
            exit 1
        }
    }
}

# Configurar la variable de entorno PORT
$env:PORT = $Puerto

# Iniciar el servidor
Write-Host "🌐 Iniciando servidor con PORT=$Puerto..." -ForegroundColor Green
npm start

# Este punto solo se alcanza si el servidor se detiene
Write-Host "⚠️ El servidor se ha detenido" -ForegroundColor Yellow
