#!/usr/bin/env pwsh

# fix-railway-deployment.ps1
# Script para corregir problemas con el despliegue en Railway

# Función para mostrar mensajes con color
function Write-ColorOutput {
    param (
        [Parameter(Mandatory=$false)]
        [string]$Message = "",
        
        [Parameter(Mandatory=$false)]
        [string]$ForegroundColor = "White"
    )
    
    Write-Host $Message -ForegroundColor $ForegroundColor
}

Write-ColorOutput "===== CORRECCIÓN DE DESPLIEGUE RAILWAY =====" -ForegroundColor Cyan
Write-ColorOutput "Fecha y hora: $(Get-Date)" -ForegroundColor Gray
Write-ColorOutput ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "baconfort-backend")) {
    Write-ColorOutput "❌ ERROR: No se encuentra el directorio 'baconfort-backend'. Asegúrate de ejecutar este script desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Verificar el archivo railway.json
$railwayJsonPath = ".\baconfort-backend\railway.json"

Write-ColorOutput "Verificando railway.json..." -ForegroundColor Yellow
if (-not (Test-Path $railwayJsonPath) -or (Get-Content $railwayJsonPath -Raw).Length -eq 0) {
    Write-ColorOutput "❌ El archivo railway.json no existe o está vacío." -ForegroundColor Red
    
    # Crear el archivo railway.json con la configuración correcta
    Write-ColorOutput "Creando nuevo archivo railway.json..." -ForegroundColor Yellow
    
    $railwayContent = @"
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "numReplicas": 1
  }
}
"@
    
    Set-Content -Path $railwayJsonPath -Value $railwayContent -Encoding UTF8
    Write-ColorOutput "✅ Archivo railway.json creado correctamente" -ForegroundColor Green
} else {
    Write-ColorOutput "✅ El archivo railway.json ya existe con contenido" -ForegroundColor Green
    
    # Mostrar el contenido actual
    $currentContent = Get-Content $railwayJsonPath -Raw
    Write-ColorOutput "Contenido actual:" -ForegroundColor Gray
    Write-ColorOutput $currentContent -ForegroundColor Gray
    
    # Verificar si el archivo es JSON válido
    try {
        $jsonObject = $currentContent | ConvertFrom-Json
        Write-ColorOutput "✅ JSON válido" -ForegroundColor Green
    } catch {
        Write-ColorOutput "❌ El archivo railway.json contiene JSON inválido. Corrigiendo..." -ForegroundColor Red
        
        # Sobrescribir con JSON correcto
        $railwayContent = @"
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "numReplicas": 1
  }
}
"@
        Set-Content -Path $railwayJsonPath -Value $railwayContent -Encoding UTF8
        Write-ColorOutput "✅ Archivo railway.json corregido" -ForegroundColor Green
    }
}

# Verificar que exista el endpoint de health
$apiIndexPath = ".\baconfort-backend\api\index.js"
$healthEndpointExists = $false

if (Test-Path $apiIndexPath) {
    $apiContent = Get-Content $apiIndexPath -Raw
    if ($apiContent -match "/api/health") {
        $healthEndpointExists = $true
        Write-ColorOutput "✅ Endpoint /api/health encontrado en api/index.js" -ForegroundColor Green
    }
}

if (-not $healthEndpointExists) {
    Write-ColorOutput "❌ No se encontró el endpoint /api/health en api/index.js" -ForegroundColor Red
    Write-ColorOutput "Es necesario crear este endpoint para que Railway pueda verificar el despliegue." -ForegroundColor Yellow
    
    # Aquí podríamos agregar código para añadir automáticamente el endpoint
    # pero para mayor seguridad, solo proporcionamos instrucciones
    Write-ColorOutput "Por favor, agrega manualmente el siguiente código en api/index.js:" -ForegroundColor Yellow
    
    Write-ColorOutput @"
// Endpoint de health check para monitoreo
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'ok',
    version: process.env.VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    message: 'BACONFORT API running',
    environment: process.env.NODE_ENV || 'production',
    uptime: process.uptime()
  });
});
"@ -ForegroundColor Gray
}

# Instrucciones para desplegar a Railway
Write-ColorOutput "`nInstrucciones para desplegar a Railway:" -ForegroundColor Cyan
Write-ColorOutput "1. Asegúrate de tener Railway CLI instalado:" -ForegroundColor Yellow
Write-ColorOutput "   npm install -g @railway/cli" -ForegroundColor Gray
Write-ColorOutput "2. Inicia sesión en Railway:" -ForegroundColor Yellow
Write-ColorOutput "   railway login" -ForegroundColor Gray
Write-ColorOutput "3. Enlaza tu proyecto (si aún no lo has hecho):" -ForegroundColor Yellow
Write-ColorOutput "   railway link" -ForegroundColor Gray
Write-ColorOutput "4. Navega al directorio del backend:" -ForegroundColor Yellow
Write-ColorOutput "   cd baconfort-backend" -ForegroundColor Gray
Write-ColorOutput "5. Despliega a Railway:" -ForegroundColor Yellow
Write-ColorOutput "   railway up" -ForegroundColor Gray

Write-ColorOutput "`n¿Deseas intentar desplegar ahora? (S/N)" -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "S" -or $response -eq "s") {
    # Verificar si Railway CLI está instalado
    try {
        railway version | Out-Null
        $railwayInstalled = $true
    } catch {
        $railwayInstalled = $false
    }
    
    if (-not $railwayInstalled) {
        Write-ColorOutput "Railway CLI no está instalado. Instalando..." -ForegroundColor Yellow
        npm install -g @railway/cli
    }
    
    # Navegar al directorio del backend e intentar desplegar
    Write-ColorOutput "Navegando al directorio del backend..." -ForegroundColor Yellow
    Push-Location -Path ".\baconfort-backend"
    
    Write-ColorOutput "Desplegando a Railway..." -ForegroundColor Yellow
    try {
        railway up
        Write-ColorOutput "✅ Comando de despliegue ejecutado" -ForegroundColor Green
    } catch {
        Write-ColorOutput "❌ Error durante el despliegue: $_" -ForegroundColor Red
    }
    
    # Volver al directorio original
    Pop-Location
}

Write-ColorOutput "`n===== PROCESO COMPLETADO =====" -ForegroundColor Cyan
