# Script para desplegar los cambios del backend a Railway
# Con enfoque específico en actualizar la API para persistencia de perfil

Write-Host "🚄 Iniciando despliegue del backend a Railway..." -ForegroundColor Cyan

# Ir al directorio del backend
Set-Location -Path "c:\Users\rober\Desktop\baconfort5- copia\baconfort-backend"

# Verificar si hay cambios pendientes
Write-Host "📊 Verificando cambios en el repositorio..." -ForegroundColor Yellow
$hasChanges = git status --porcelain

if ($hasChanges) {
    Write-Host "📦 Hay cambios en el repositorio, haciendo commit..." -ForegroundColor Cyan
    git add .
    git commit -m "fix: Actualizar rutas de API para persistencia de perfil"
}

# Instalar dependencias si es necesario
if (-not (Test-Path "node_modules")) {
    Write-Host "📚 Instalando dependencias..." -ForegroundColor Magenta
    npm install
}

# Asegurarse de que el servidor no esté corriendo
$processName = "node"
$processArgs = "server.js"
$runningProcesses = Get-WmiObject Win32_Process -Filter "name='$processName.exe'" | 
    Where-Object { $_.CommandLine -like "*$processArgs*" }

if ($runningProcesses) {
    Write-Host "🛑 Deteniendo servidor Node.js existente..." -ForegroundColor Yellow
    foreach ($process in $runningProcesses) {
        Stop-Process -Id $process.ProcessId -Force
    }
    Start-Sleep -Seconds 2
}

# Verificar que estamos usando el comando correcto para Railway CLI
$railwayCommand = "railway"

# Comprobar que Railway CLI está instalado
try {
    $railwayVersion = Invoke-Expression "$railwayCommand version"
    Write-Host "✅ Railway CLI detectado: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI no encontrado. Instalando globalmente..." -ForegroundColor Red
    npm install -g @railway/cli
}

# Desplegar a Railway
Write-Host "🚀 Desplegando backend a Railway..." -ForegroundColor Green

try {
    # Primero intentar con el comando railway up
    Invoke-Expression "$railwayCommand up"
    Write-Host "✅ Despliegue completado con éxito" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Error usando 'railway up', intentando con 'railway deploy'..." -ForegroundColor Yellow
    try {
        Invoke-Expression "$railwayCommand deploy"
        Write-Host "✅ Despliegue completado con éxito usando 'railway deploy'" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error desplegando a Railway. Intentando despliegue manual..." -ForegroundColor Red
        
        # Crear un archivo .railway.toml si no existe
        if (-not (Test-Path ".railway.toml")) {
            $railwayConfig = @"
[build]
builder = "NIXPACKS"
buildCommand = "npm install"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
"@
            Set-Content -Path ".railway.toml" -Value $railwayConfig
            Write-Host "✅ Archivo .railway.toml creado" -ForegroundColor Green
        }
        
        # Intentar con la URL directa de Railway
        try {
            Invoke-Expression "git push railway main"
            Write-Host "✅ Despliegue completado con 'git push railway main'" -ForegroundColor Green
        } catch {
            Write-Host "❌ Todos los métodos de despliegue fallaron" -ForegroundColor Red
            Write-Host "Por favor, inicia sesión en Railway manualmente: railway login" -ForegroundColor Yellow
            exit 1
        }
    }
}

# Volver al directorio principal
Set-Location -Path "c:\Users\rober\Desktop\baconfort5- copia\"

Write-Host "✅ Proceso de despliegue completado." -ForegroundColor Green
Write-Host "La ruta /auth/update-profile-direct debería estar disponible ahora." -ForegroundColor Green
