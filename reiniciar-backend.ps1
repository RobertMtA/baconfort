# Script para reiniciar el servidor backend
$ErrorActionPreference = "Stop"

Write-Host "🔄 Reiniciando servidor backend..." -ForegroundColor Cyan
Write-Host "----------------------------------------------------------" -ForegroundColor Cyan

# Ruta al backend
$backendPath = Join-Path -Path $PSScriptRoot -ChildPath "baconfort-backend"

# Comprobar que estamos en la ubicación correcta
if (-Not (Test-Path -Path $backendPath)) {
    Write-Host "❌ Error: No se encuentra la carpeta baconfort-backend. Ejecute este script desde el directorio raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Navegar a la carpeta del proyecto
Set-Location -Path $backendPath

# Buscar procesos de node que podrían estar ejecutando el servidor
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "server.js" }
if ($nodeProcesses) {
    Write-Host "🛑 Deteniendo procesos existentes del servidor..." -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object { 
        try {
            $_.Kill()
            Write-Host "  ✅ Proceso ID $($_.Id) detenido" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ No se pudo detener el proceso ID $($_.Id): $_" -ForegroundColor Red
        }
    }
}

# Inicia el servidor en segundo plano
Write-Host "🚀 Iniciando servidor backend..." -ForegroundColor Green

# Asegúrate de que las dependencias estén instaladas
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
npm install

# Inicia el servidor
Write-Host "🔌 Iniciando servidor en modo desarrollo..." -ForegroundColor Green
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Servidor backend reiniciado correctamente" -ForegroundColor Green
Write-Host "El servidor debería estar disponible en http://localhost:5004/api" -ForegroundColor White
Write-Host ""
Write-Host "📝 Instrucciones:" -ForegroundColor Cyan
Write-Host "1. Espera unos segundos a que el servidor termine de iniciar" -ForegroundColor White
Write-Host "2. Prueba el panel de administración para ver si los errores de token han sido resueltos" -ForegroundColor White

# Volver al directorio original
Set-Location -Path $PSScriptRoot
