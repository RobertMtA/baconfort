# Script para reiniciar el backend en un puerto alternativo
Write-Host "🔄 Reiniciando backend en puerto alternativo (5005)..." -ForegroundColor Cyan

# Cambiar al directorio del backend
Set-Location -Path "c:\Users\rober\Desktop\baconfort5- copia\baconfort-backend"

# Intentar detener cualquier proceso existente en los puertos 5004 y 5005
Write-Host "🛑 Deteniendo cualquier proceso que use los puertos 5004 y 5005..."
$puerto5004 = netstat -ano | Select-String ":5004" | Select-String "LISTENING"
$puerto5005 = netstat -ano | Select-String ":5005" | Select-String "LISTENING"

if ($puerto5004) {
    $pid5004 = ($puerto5004 -split '\s+')[-1]
    Write-Host "🔍 Proceso encontrado en puerto 5004: PID $pid5004, intentando detenerlo..."
    taskkill /F /PID $pid5004 2>$null
    if ($?) {
        Write-Host "✅ Proceso en puerto 5004 detenido exitosamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No se pudo detener el proceso en puerto 5004" -ForegroundColor Yellow
    }
}

if ($puerto5005) {
    $pid5005 = ($puerto5005 -split '\s+')[-1]
    Write-Host "🔍 Proceso encontrado en puerto 5005: PID $pid5005, intentando detenerlo..."
    taskkill /F /PID $pid5005 2>$null
    if ($?) {
        Write-Host "✅ Proceso en puerto 5005 detenido exitosamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No se pudo detener el proceso en puerto 5005" -ForegroundColor Yellow
    }
}

# Establecer la variable de entorno PORT y iniciar el servidor
Write-Host "🚀 Iniciando servidor en puerto 5005..." -ForegroundColor Green
$env:PORT = 5005
npm start
