# Script para probar el endpoint de reviews con diagnóstico

Write-Host "🔍 Iniciando diagnóstico del endpoint de reviews..." -ForegroundColor Cyan

# Cambiar al directorio del backend
Push-Location "baconfort-backend"

# Iniciar servidor en segundo plano
Write-Host "🚀 Iniciando servidor..." -ForegroundColor Yellow
$process = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $PWD -PassThru -WindowStyle Hidden
$env:PORT = "5005"
$env:NODE_ENV = "development"

# Esperar un momento para que el servidor arranque
Write-Host "⏳ Esperando que el servidor se inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Probar endpoint básico
Write-Host "🌐 Probando conectividad básica..." -ForegroundColor Yellow
try {
    $basicTest = Invoke-RestMethod -Uri "http://localhost:5005/" -Method GET -TimeoutSec 10
    Write-Host "✅ Servidor responde correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor no responde: $($_.Exception.Message)" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Probar endpoint de reviews con headers de bypass
Write-Host "🔍 Probando endpoint de reviews con bypass..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer admin_static_20250812_17300_baconfort"
    "x-admin-emergency-token" = "ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS"
    "x-admin-access" = "admin"
    "x-token-override" = "emergency"
    "Content-Type" = "application/json"
}

$url = "http://localhost:5005/api/reviews/admin?status=pending&limit=20&page=1&sort=-createdAt&admin=true&dev=true&bypass=true&emergency=true"

try {
    Write-Host "📤 Enviando request a: $url" -ForegroundColor Cyan
    Write-Host "📤 Headers enviados:" -ForegroundColor Cyan
    $headers | Format-Table -AutoSize
    
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method GET -TimeoutSec 30
    Write-Host "✅ Endpoint de reviews respondió correctamente" -ForegroundColor Green
    Write-Host "📋 Respuesta:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error en endpoint de reviews:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "📋 Respuesta del servidor:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Yellow
    }
}

# Limpiar
Write-Host "🧹 Limpiando..." -ForegroundColor Yellow
Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
Pop-Location

Write-Host "🏁 Diagnóstico completado" -ForegroundColor Cyan
