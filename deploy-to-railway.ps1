#!/usr/bin/env pwsh

# Script de despliegue para Railway
# Este script prepara y verifica el archivo railway.json antes del despliegue

$ErrorActionPreference = "Stop"

Write-Host "🚄 Iniciando despliegue a Railway..." -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "baconfort-backend")) {
    Write-Host "❌ Error: No se encontró el directorio 'baconfort-backend'" -ForegroundColor Red
    exit 1
}

# Verificar y crear railway.json si no existe o está vacío
$railwayJsonPath = ".\baconfort-backend\railway.json"
if (-not (Test-Path $railwayJsonPath) -or (Get-Content $railwayJsonPath).Length -eq 0) {
    Write-Host "⚠️ railway.json no existe o está vacío. Creando archivo..." -ForegroundColor Yellow
    
    $railwayJson = @"
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
    
    Set-Content -Path $railwayJsonPath -Value $railwayJson
    Write-Host "✅ railway.json creado correctamente" -ForegroundColor Green
} else {
    Write-Host "✅ railway.json existe y tiene contenido" -ForegroundColor Green
}

# Verificar package.json
$packageJsonPath = ".\baconfort-backend\package.json"
if (-not (Test-Path $packageJsonPath)) {
    Write-Host "❌ Error: No se encontró package.json en el backend" -ForegroundColor Red
    exit 1
}

# Comprobar que la ruta de health check existe
$apiIndexPath = ".\baconfort-backend\api\index.js"
$serverPath = ".\baconfort-backend\server.js"

$healthCheckExists = $false

if (Test-Path $apiIndexPath) {
    $apiContent = Get-Content $apiIndexPath -Raw
    if ($apiContent -match "/api/health") {
        $healthCheckExists = $true
        Write-Host "✅ Ruta de health check encontrada en api/index.js" -ForegroundColor Green
    }
}

if (Test-Path $serverPath) {
    $serverContent = Get-Content $serverPath -Raw
    if ($serverContent -match "/api/health") {
        $healthCheckExists = $true
        Write-Host "✅ Ruta de health check encontrada en server.js" -ForegroundColor Green
    }
}

if (-not $healthCheckExists) {
    Write-Host "⚠️ No se encontró una ruta de health check. Agregando a server.js..." -ForegroundColor Yellow
    
    # Leer el contenido actual del server.js
    $serverContent = Get-Content $serverPath -Raw
    
    # Buscar el punto donde se configura la aplicación express
    if ($serverContent -match "const app = express\(\);") {
        # Insertar la ruta de health check después de la configuración de cors
        $healthCheckRoute = @"

// Endpoint de health check para Railway
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'ok',
    version: process.env.VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

"@
        
        # Encontrar la posición donde insertar el código
        $position = $serverContent.IndexOf("app.use(cors(") 
        if ($position -ne -1) {
            # Encontrar el final del bloque cors
            $endPosition = $serverContent.IndexOf("});", $position)
            if ($endPosition -ne -1) {
                $endPosition += 3  # Incluir "});"
                
                # Insertar la ruta de health check
                $newServerContent = $serverContent.Substring(0, $endPosition) + $healthCheckRoute + $serverContent.Substring($endPosition)
                Set-Content -Path $serverPath -Value $newServerContent
                
                Write-Host "✅ Ruta de health check agregada a server.js" -ForegroundColor Green
            }
        }
    }
}

# Intentar desplegar a Railway usando el CLI
Write-Host "🚀 Desplegando a Railway..." -ForegroundColor Cyan

try {
    # Verificar si Railway CLI está instalado
    $railwayInstalled = $null
    try {
        $railwayInstalled = Invoke-Expression "railway version" -ErrorAction SilentlyContinue
    } catch {
        $railwayInstalled = $null
    }
    
    if ($null -eq $railwayInstalled) {
        Write-Host "⚠️ Railway CLI no encontrado. Instalando..." -ForegroundColor Yellow
        Invoke-Expression "npm install -g @railway/cli"
    }
    
    # Navegar al directorio del backend
    Push-Location -Path ".\baconfort-backend"
    
    # Desplegar a Railway
    Invoke-Expression "railway up"
    
    # Volver al directorio original
    Pop-Location
    
    Write-Host "✅ Despliegue a Railway completado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error desplegando a Railway: $_" -ForegroundColor Red
    
    # Mostrar instrucciones para despliegue manual
    Write-Host "📝 Para desplegar manualmente a Railway:" -ForegroundColor Yellow
    Write-Host "1. Navega a 'baconfort-backend'" -ForegroundColor Yellow
    Write-Host "2. Ejecuta 'railway login' si no has iniciado sesión" -ForegroundColor Yellow
    Write-Host "3. Ejecuta 'railway link' para vincular el proyecto" -ForegroundColor Yellow
    Write-Host "4. Ejecuta 'railway up' para desplegar" -ForegroundColor Yellow
}

# Verificar el estado de despliegue
Write-Host "🔍 Puedes verificar el estado de tu despliegue en: https://railway.app/dashboard" -ForegroundColor Cyan
