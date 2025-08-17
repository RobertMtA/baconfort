#!/usr/bin/env pwsh

# Script para diagnosticar y corregir problemas de email

Write-Host "📧 Diagnóstico de configuración de Email..." -ForegroundColor Cyan
Write-Host ""

# Verificar variables de entorno
$BackendPath = ".\baconfort-backend"
$EnvPath = "$BackendPath\.env"

if (Test-Path $EnvPath) {
    Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
    
    # Leer variables de email
    $envContent = Get-Content $EnvPath
    $emailUser = ($envContent | Select-String "EMAIL_USER=") -replace "EMAIL_USER=", ""
    $emailAppPassword = ($envContent | Select-String "EMAIL_APP_PASSWORD=") -replace "EMAIL_APP_PASSWORD=", ""
    $adminEmail = ($envContent | Select-String "ADMIN_EMAIL=") -replace "ADMIN_EMAIL=", ""
    
    Write-Host "📧 EMAIL_USER: $($emailUser ? 'CONFIGURADO' : 'NO CONFIGURADO')" -ForegroundColor Cyan
    Write-Host "🔐 EMAIL_APP_PASSWORD: $($emailAppPassword ? 'CONFIGURADO' : 'NO CONFIGURADO')" -ForegroundColor Cyan
    Write-Host "👤 ADMIN_EMAIL: $($adminEmail ? 'CONFIGURADO' : 'NO CONFIGURADO')" -ForegroundColor Cyan
    
    if ($emailUser -and $emailAppPassword) {
        Write-Host ""
        Write-Host "⚠️ Las credenciales están configuradas pero Gmail las rechaza." -ForegroundColor Yellow
        Write-Host "Posibles causas y soluciones:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. 🔐 App Password expirada:" -ForegroundColor White
        Write-Host "   - Ve a https://myaccount.google.com/security" -ForegroundColor Gray
        Write-Host "   - Búsqueda > 'App passwords'" -ForegroundColor Gray
        Write-Host "   - Crea una nueva App Password para 'Mail'" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. 🔒 Verificación en 2 pasos deshabilitada:" -ForegroundColor White
        Write-Host "   - Ve a https://myaccount.google.com/security" -ForegroundColor Gray
        Write-Host "   - Habilita la verificación en 2 pasos" -ForegroundColor Gray
        Write-Host "   - Luego crea una App Password" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. 🚫 Acceso de apps menos seguras:" -ForegroundColor White
        Write-Host "   - Google ya no permite este método" -ForegroundColor Gray
        Write-Host "   - DEBES usar App Passwords" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Archivo .env no encontrado en $EnvPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 Solución temporal para Railway:" -ForegroundColor Green
Write-Host "Mientras corriges las credenciales, puedes deshabilitar el email:" -ForegroundColor Gray

# Crear archivo de configuración temporal sin email
$tempServerPath = "$BackendPath\server-without-email.js"
if (-not (Test-Path $tempServerPath)) {
    Write-Host "📝 Creando versión temporal del server sin email..." -ForegroundColor Yellow
    
    # Copiar server.js y modificarlo
    Copy-Item "$BackendPath\server.js" $tempServerPath
    
    # Buscar y comentar las líneas problemáticas
    (Get-Content $tempServerPath) -replace 'setupEmailTransporter\(\);', '// setupEmailTransporter(); // Temporalmente deshabilitado' | Set-Content $tempServerPath
    (Get-Content $tempServerPath) -replace 'emailTransporter\.sendMail', '// emailTransporter.sendMail // Temporalmente deshabilitado' | Set-Content $tempServerPath
    
    Write-Host "✅ Archivo temporal creado: $tempServerPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Para aplicar los cambios:" -ForegroundColor Cyan
Write-Host "1. Corrige las credenciales de Gmail siguiendo los pasos de arriba" -ForegroundColor White
Write-Host "2. Ejecuta: .\deploy-to-railway.ps1" -ForegroundColor White
