#!/usr/bin/env pwsh
# Script de diagnóstico para Railway

Write-Host "🔍 DIAGNÓSTICO RAILWAY BACKEND" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

$urls = @(
    "https://baconfort-backend-production.up.railway.app/api/health",
    "https://baconfort-backend-production.up.railway.app/health", 
    "https://baconfort-backend-production.up.railway.app/",
    "https://baconfort-production.up.railway.app/api/health",
    "https://baconfort-production.up.railway.app/health",
    "https://baconfort-production.up.railway.app/"
)

foreach ($url in $urls) {
    Write-Host "`n🌐 Probando: $url" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri $url -TimeoutSec 10 -ErrorAction Stop
        Write-Host "  ✅ FUNCIONA:" -ForegroundColor Green
        Write-Host "    $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            Write-Host "  ❌ Error $statusCode" -ForegroundColor Red
        } else {
            Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n📋 POSIBLES CAUSAS:" -ForegroundColor Yellow
Write-Host "  1. Servicio Railway dormido" -ForegroundColor Gray
Write-Host "  2. URL del servicio cambió" -ForegroundColor Gray  
Write-Host "  3. Deploy fallido" -ForegroundColor Gray
Write-Host "  4. Problemas de configuración" -ForegroundColor Gray

Write-Host "`n💡 SOLUCIONES:" -ForegroundColor Yellow
Write-Host "  1. Verificar logs en Railway dashboard" -ForegroundColor Gray
Write-Host "  2. Hacer redeploy manual" -ForegroundColor Gray
Write-Host "  3. Verificar variables de entorno" -ForegroundColor Gray
