#!/usr/bin/env pwsh

# Script para configurar Gmail correctamente en Railway

Write-Host "📧 Configurando Gmail para Railway..." -ForegroundColor Cyan
Write-Host ""

Write-Host "🔐 PASO 1 - Configurar Gmail App Password:" -ForegroundColor Yellow
Write-Host "1. Ve a https://myaccount.google.com/security" -ForegroundColor White
Write-Host "2. Asegúrate que la verificación en 2 pasos esté ACTIVADA" -ForegroundColor White
Write-Host "3. Busca 'App passwords' o 'Contraseñas de aplicaciones'" -ForegroundColor White
Write-Host "4. Selecciona 'Mail' como aplicación" -ForegroundColor White
Write-Host "5. Copia la contraseña de 16 caracteres generada" -ForegroundColor White
Write-Host ""

Write-Host "🚂 PASO 2 - Configurar variables en Railway:" -ForegroundColor Yellow
Write-Host "1. Ve a tu proyecto en Railway: https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Selecciona tu servicio backend" -ForegroundColor White
Write-Host "3. Ve a la pestaña 'Variables'" -ForegroundColor White
Write-Host "4. Agrega estas variables:" -ForegroundColor White
Write-Host ""

Write-Host "   Variable: EMAIL_SERVICE" -ForegroundColor Cyan
Write-Host "   Valor: gmail" -ForegroundColor Green
Write-Host ""

Write-Host "   Variable: EMAIL_USER" -ForegroundColor Cyan
Write-Host "   Valor: baconfort.centro@gmail.com" -ForegroundColor Green
Write-Host ""

Write-Host "   Variable: EMAIL_APP_PASSWORD" -ForegroundColor Cyan
Write-Host "   Valor: [tu-app-password-de-16-caracteres]" -ForegroundColor Green
Write-Host ""

Write-Host "   Variable: ADMIN_EMAIL" -ForegroundColor Cyan
Write-Host "   Valor: baconfort.centro@gmail.com" -ForegroundColor Green
Write-Host ""

Write-Host "⚠️ IMPORTANTE:" -ForegroundColor Red
Write-Host "- NO uses tu contraseña normal de Gmail" -ForegroundColor White
Write-Host "- DEBES usar la App Password de 16 caracteres" -ForegroundColor White
Write-Host "- La verificación en 2 pasos DEBE estar activada" -ForegroundColor White
Write-Host ""

Write-Host "🧪 PASO 3 - Probar configuración:" -ForegroundColor Yellow
Write-Host "Después de configurar, ejecuta:" -ForegroundColor White
Write-Host ".\test-gmail-railway.ps1" -ForegroundColor Cyan

# Crear script de prueba
$testGmailContent = @"
#!/usr/bin/env pwsh

Write-Host "📧 Probando configuración de Gmail en Railway..." -ForegroundColor Cyan

# Simular las variables de entorno que Railway debería tener
`$testEmail = "baconfort.centro@gmail.com"
`$testAppPassword = Read-Host "Ingresa tu Gmail App Password (16 caracteres)" -MaskInput

if (`$testAppPassword.Length -ne 16) {
    Write-Host "❌ Error: App Password debe ser exactamente 16 caracteres" -ForegroundColor Red
    exit 1
}

Write-Host "🧪 Probando conexión a Gmail..." -ForegroundColor Yellow

# Crear script Node.js temporal para probar
`$testScript = @"
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: '`$testEmail',
        pass: '`$testAppPassword'
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Error:', error.message);
        process.exit(1);
    } else {
        console.log('✅ Gmail configurado correctamente');
        console.log('📧 Listo para enviar emails desde Railway');
        process.exit(0);
    }
});
"@

`$testScript | Out-File -FilePath "test-gmail-temp.js" -Encoding UTF8

try {
    Set-Location "baconfort-backend"
    node ../test-gmail-temp.js
    Set-Location ..
    Remove-Item "test-gmail-temp.js" -Force
    
    Write-Host ""
    Write-Host "✅ Configuración de Gmail exitosa" -ForegroundColor Green
    Write-Host "🚀 Ahora puedes desplegar a Railway con email funcionando" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error probando Gmail: `$(`$_.Exception.Message)" -ForegroundColor Red
    Remove-Item "test-gmail-temp.js" -Force -ErrorAction SilentlyContinue
}
"@

$testGmailContent | Out-File -FilePath "c:\Users\rober\Desktop\baconfort5- copia\test-gmail-railway.ps1" -Encoding UTF8

Write-Host "✅ Script de configuración Gmail creado" -ForegroundColor Green
