#!/usr/bin/env pwsh

# Script para verificar la configuración CORS del backend

Write-Host "🔍 Verificando configuración CORS del backend..." -ForegroundColor Cyan
Write-Host ""

# URL del backend
$BackendUrl = "https://baconfort-production.up.railway.app"

Write-Host "📡 Backend URL: $BackendUrl" -ForegroundColor Green
Write-Host ""

# Verificar endpoint de health
Write-Host "🏥 Verificando endpoint de health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$BackendUrl/api/health" -Method Get
    Write-Host "✅ Health Check: OK" -ForegroundColor Green
    Write-Host "📊 Status: $($healthResponse.status)" -ForegroundColor Cyan
    Write-Host "💬 Message: $($healthResponse.message)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Health Check: FALLÓ" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Verificar endpoint de propiedades
Write-Host "🏠 Verificando endpoint de propiedades..." -ForegroundColor Yellow
try {
    $propertiesResponse = Invoke-RestMethod -Uri "$BackendUrl/api/properties" -Method Get
    Write-Host "✅ Properties Endpoint: OK" -ForegroundColor Green
    Write-Host "📊 Propiedades encontradas: $($propertiesResponse.properties.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Properties Endpoint: FALLÓ" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Verificar headers CORS con OPTIONS
Write-Host "🌐 Verificando headers CORS con OPTIONS request..." -ForegroundColor Yellow
try {
    $corsHeaders = @{
        'Origin' = 'https://baconfort.web.app'
        'Access-Control-Request-Method' = 'GET'
        'Access-Control-Request-Headers' = 'Content-Type, Authorization'
    }
    
    $corsResponse = Invoke-WebRequest -Uri "$BackendUrl/api/properties" -Method Options -Headers $corsHeaders
    Write-Host "✅ CORS Preflight: OK ($($corsResponse.StatusCode))" -ForegroundColor Green
    
    # Mostrar headers CORS importantes
    $accessControlOrigin = $corsResponse.Headers['Access-Control-Allow-Origin']
    $accessControlMethods = $corsResponse.Headers['Access-Control-Allow-Methods']
    $accessControlHeaders = $corsResponse.Headers['Access-Control-Allow-Headers']
    
    Write-Host "🔓 Access-Control-Allow-Origin: $accessControlOrigin" -ForegroundColor Cyan
    Write-Host "🛠️  Access-Control-Allow-Methods: $accessControlMethods" -ForegroundColor Cyan
    Write-Host "📋 Access-Control-Allow-Headers: $accessControlHeaders" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ CORS Preflight: FALLÓ" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Verificación de CORS completada." -ForegroundColor Green
Write-Host "💡 Si todo está OK, tu aplicación debería funcionar sin errores CORS." -ForegroundColor Yellow
