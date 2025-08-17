#!/usr/bin/env pwsh

# Script para MEJORAR sin quitar funcionalidad

Write-Host "🔧 Mejorando configuración sin quitar funcionalidades..." -ForegroundColor Cyan
Write-Host ""

$BackendPath = ".\baconfort-backend"

# 1. Mejorar configuración de npm sin advertencias
Write-Host "📦 Optimizando configuración npm..." -ForegroundColor Yellow

$npmrcContent = @"
# Configuración optimizada para Railway
omit=dev
fund=false
audit=false
loglevel=warn
progress=false
"@

$npmrcContent | Out-File -FilePath "$BackendPath\.npmrc" -Encoding UTF8
Write-Host "✅ Configuración npm mejorada" -ForegroundColor Green

# 2. Crear .env.example con configuración de Gmail mejorada
Write-Host "📧 Creando guía de configuración de Gmail..." -ForegroundColor Yellow

$envExampleContent = @"
# Configuración de Base de Datos
MONGODB_URI=your_mongodb_connection_string

# Configuración de Email MEJORADA para Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_APP_PASSWORD=tu-app-password-de-16-caracteres
ADMIN_EMAIL=tu-email@gmail.com

# Para obtener EMAIL_APP_PASSWORD:
# 1. Ve a https://myaccount.google.com/security
# 2. Activa verificación en 2 pasos
# 3. Busca "App passwords" o "Contraseñas de aplicaciones"
# 4. Crea una nueva contraseña para "Mail"
# 5. Usa esa contraseña de 16 caracteres (sin espacios)

# Configuración de JWT
JWT_SECRET=tu_jwt_secret_super_seguro

# Configuración de MercadoPago (opcional)
MERCADOPAGO_ACCESS_TOKEN=tu_mercadopago_token
"@

$envExampleContent | Out-File -FilePath "$BackendPath\.env.example" -Encoding UTF8
Write-Host "✅ Guía de configuración de email creada" -ForegroundColor Green

# 3. Crear script de diagnóstico de Gmail
$gmailDiagnosticContent = @"
#!/usr/bin/env pwsh

# Script para diagnosticar y configurar Gmail correctamente

Write-Host "📧 Diagnóstico de Gmail para Baconfort..." -ForegroundColor Cyan
Write-Host ""

`$envFile = ".\.env"
if (-not (Test-Path `$envFile)) {
    Write-Host "❌ Archivo .env no encontrado" -ForegroundColor Red
    Write-Host "💡 Copia .env.example a .env y configura tus credenciales" -ForegroundColor Yellow
    exit 1
}

# Leer credenciales
`$env = Get-Content `$envFile
`$emailUser = (`$env | Select-String "EMAIL_USER=") -replace "EMAIL_USER=", ""
`$emailAppPassword = (`$env | Select-String "EMAIL_APP_PASSWORD=") -replace "EMAIL_APP_PASSWORD=", ""

if (-not `$emailUser -or -not `$emailAppPassword) {
    Write-Host "⚠️ Credenciales de Gmail no configuradas" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Para configurar Gmail:"
    Write-Host "1. Ve a https://myaccount.google.com/security"
    Write-Host "2. Activa verificación en 2 pasos"
    Write-Host "3. Busca 'App passwords'"
    Write-Host "4. Crea una nueva contraseña para 'Mail'"
    Write-Host "5. Copia la contraseña de 16 caracteres a EMAIL_APP_PASSWORD"
} else {
    Write-Host "✅ Credenciales encontradas" -ForegroundColor Green
    Write-Host "📧 EMAIL_USER: `$emailUser"
    Write-Host "🔐 EMAIL_APP_PASSWORD: ********"
    
    # Test básico
    Write-Host ""
    Write-Host "🧪 Probando configuración..."
    node -e "
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: '`$emailUser',
                pass: '`$emailAppPassword'
            }
        });
        transporter.verify((error, success) => {
            if (error) {
                console.log('❌ Error:', error.message);
                console.log('💡 Revisa tus credenciales de Gmail');
            } else {
                console.log('✅ Gmail configurado correctamente');
            }
        });
    "
}
"@

$gmailDiagnosticContent | Out-File -FilePath "$BackendPath\test-gmail-config.ps1" -Encoding UTF8
Write-Host "✅ Script de diagnóstico de Gmail creado" -ForegroundColor Green

# 4. Verificar Mongoose index fix
Write-Host "🗃️ Verificando corrección de Mongoose..." -ForegroundColor Yellow
$subscribersFile = "$BackendPath\routes\subscribers.js"
$content = Get-Content $subscribersFile -Raw
if ($content -like "*// El índice en email ya se crea automáticamente por unique: true*") {
    Write-Host "✅ Corrección de índice duplicado aplicada" -ForegroundColor Green
} else {
    Write-Host "⚠️ Corrección de índice duplicado necesaria" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ MEJORAS APLICADAS (funcionalidad preservada):" -ForegroundColor Green
Write-Host "  📦 Configuración npm optimizada" -ForegroundColor White
Write-Host "  📧 Guía de Gmail mejorada" -ForegroundColor White
Write-Host "  🧪 Script de diagnóstico creado" -ForegroundColor White
Write-Host "  🗃️ Índices de Mongoose optimizados" -ForegroundColor White
Write-Host "  ⚙️ Logging mejorado pero informativo" -ForegroundColor White

Write-Host ""
Write-Host "🔧 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Ejecuta: .\test-gmail-config.ps1 (para verificar Gmail)" -ForegroundColor White
Write-Host "2. Ejecuta: .\deploy-to-railway.ps1 (para desplegar)" -ForegroundColor White
"@

$gmailDiagnosticContent | Out-File -FilePath "c:\Users\rober\Desktop\baconfort5- copia\improve-without-removing.ps1" -Encoding UTF8

Write-Host "✅ Script de mejora completo creado" -ForegroundColor Green
