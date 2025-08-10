# Script para verificar el estado del sistema
Write-Host "======================================" -ForegroundColor Yellow
Write-Host "🚀 BACONFORT - VERIFICACIÓN DEL SISTEMA" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""

# Verificar Git
Write-Host "Verificando Git..." -ForegroundColor Cyan
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git no encontrado. Por favor instálalo." -ForegroundColor Red
}

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    
    # Verificar versión mínima
    $nodeMajor = $nodeVersion.Substring(1, 2).Trim('.')
    if ([int]$nodeMajor -lt 16) {
        Write-Host "⚠️ Se recomienda Node.js 16 o superior (tienes versión $nodeVersion)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Node.js no encontrado. Por favor instálalo." -ForegroundColor Red
}

# Verificar NPM
Write-Host "Verificando NPM..." -ForegroundColor Cyan
try {
    $npmVersion = npm --version
    Write-Host "✅ NPM encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ NPM no encontrado. Por favor instálalo." -ForegroundColor Red
}

# Verificar Firebase CLI
Write-Host "Verificando Firebase CLI..." -ForegroundColor Cyan
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI encontrado: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI no encontrado. Para instalarlo ejecuta:" -ForegroundColor Red
    Write-Host "   npm install -g firebase-tools" -ForegroundColor Gray
    Write-Host "   Después inicia sesión con: firebase login" -ForegroundColor Gray
}

# Verificar Railway CLI
Write-Host "Verificando Railway CLI..." -ForegroundColor Cyan
try {
    $railwayVersion = railway version
    Write-Host "✅ Railway CLI encontrado: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI no encontrado. Para instalarlo ejecuta:" -ForegroundColor Red
    Write-Host "   npm i -g @railway/cli" -ForegroundColor Gray
    Write-Host "   Después inicia sesión con: railway login" -ForegroundColor Gray
}

# Verificar dependencias del proyecto
Write-Host ""
Write-Host "Verificando dependencias del proyecto..." -ForegroundColor Cyan

# Frontend
$frontendPackageJson = Join-Path (Get-Location) "baconfort-react\package.json"
$frontendNodeModules = Join-Path (Get-Location) "baconfort-react\node_modules"

if (Test-Path $frontendPackageJson) {
    Write-Host "✅ Package.json del frontend encontrado" -ForegroundColor Green
    if (Test-Path $frontendNodeModules) {
        Write-Host "✅ node_modules del frontend instalado" -ForegroundColor Green
    } else {
        Write-Host "❌ node_modules del frontend NO encontrado" -ForegroundColor Red
        Write-Host "   Para instalar las dependencias ejecuta:" -ForegroundColor Gray
        Write-Host "   cd baconfort-react; npm install" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ No se encuentra package.json del frontend" -ForegroundColor Red
}

# Backend
$backendPackageJson = Join-Path (Get-Location) "baconfort-backend\package.json"
$backendNodeModules = Join-Path (Get-Location) "baconfort-backend\node_modules"

if (Test-Path $backendPackageJson) {
    Write-Host "✅ Package.json del backend encontrado" -ForegroundColor Green
    if (Test-Path $backendNodeModules) {
        Write-Host "✅ node_modules del backend instalado" -ForegroundColor Green
    } else {
        Write-Host "❌ node_modules del backend NO encontrado" -ForegroundColor Red
        Write-Host "   Para instalar las dependencias ejecuta:" -ForegroundColor Gray
        Write-Host "   cd baconfort-backend; npm install" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ No se encuentra package.json del backend" -ForegroundColor Red
}

# Verificar archivos de configuración importantes
Write-Host ""
Write-Host "Verificando archivos de configuración importantes..." -ForegroundColor Cyan

# Firebase
$firebaseJson = Join-Path (Get-Location) "firebase.json"
if (Test-Path $firebaseJson) {
    Write-Host "✅ Archivo firebase.json encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ No se encuentra firebase.json" -ForegroundColor Red
    Write-Host "   Ejecuta 'firebase init' para inicializar Firebase Hosting" -ForegroundColor Gray
}

# Variables de entorno para Railway
$railwayJson = Join-Path (Get-Location) "baconfort-backend\railway.json"
if (Test-Path $railwayJson) {
    Write-Host "✅ Archivo railway.json encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ No se encuentra railway.json" -ForegroundColor Red
    Write-Host "   Ejecuta 'railway init' en la carpeta baconfort-backend" -ForegroundColor Gray
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "✅ VERIFICACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para continuar con el despliegue, utiliza:" -ForegroundColor Cyan
Write-Host "   .\commit-and-deploy.ps1" -ForegroundColor Gray
