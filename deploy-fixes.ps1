# deploy-fixes.ps1
# Script para construir y desplegar la aplicación con correcciones de URLs

Write-Host "🚀 Iniciando despliegue con correcciones de URLs de API..." -ForegroundColor Cyan

# Navegamos al directorio frontend
Write-Host "📁 Navegando al directorio frontend..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\baconfort-react"

# Instalamos dependencias si es necesario
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Verificamos que las variables de entorno estén configuradas correctamente
Write-Host "🔍 Verificando variables de entorno..." -ForegroundColor Yellow

$envFile = ".env"
$envContent = Get-Content -Path $envFile -ErrorAction SilentlyContinue

if ($null -eq $envContent) {
    Write-Host "⚠️ No se encontró archivo .env, creándolo..." -ForegroundColor Yellow
    "VITE_API_URL=https://baconfort-production-084d.up.railway.app/api" | Out-File -FilePath $envFile
    Write-Host "✅ Archivo .env creado correctamente" -ForegroundColor Green
} else {
    $hasApiUrl = $false
    foreach ($line in $envContent) {
        if ($line -match "VITE_API_URL=") {
            $hasApiUrl = $true
            if (-not ($line -match "https://baconfort-production-084d.up.railway.app/api")) {
                Write-Host "⚠️ VITE_API_URL incorrecto, corrigiendo..." -ForegroundColor Yellow
                $envContent = $envContent -replace "VITE_API_URL=.*", "VITE_API_URL=https://baconfort-production-084d.up.railway.app/api"
                $envContent | Out-File -FilePath $envFile
            }
            break
        }
    }
    
    if (-not $hasApiUrl) {
        Write-Host "⚠️ VITE_API_URL no encontrado, añadiéndolo..." -ForegroundColor Yellow
        $envContent += "`nVITE_API_URL=https://baconfort-production-084d.up.railway.app/api"
        $envContent | Out-File -FilePath $envFile
    }
}

# Construir la aplicación
Write-Host "🏗️ Construyendo el proyecto..." -ForegroundColor Yellow
npm run build

# Verificar si la construcción fue exitosa
if (Test-Path -Path "dist") {
    Write-Host "✅ Construcción exitosa!" -ForegroundColor Green
    
    # Copiar el archivo _redirects si no existe
    if (-not (Test-Path -Path "dist\_redirects")) {
        Write-Host "📄 Copiando archivo _redirects para SPA routing..." -ForegroundColor Yellow
        "/* /index.html 200" | Out-File -FilePath "dist\_redirects"
    }
    
    # Opcionalmente, desplegar a Firebase u otro servicio aquí
    # Ejemplo: firebase deploy
    
    # Opcionalmente, podemos previsualizar el resultado
    $previewOption = Read-Host "¿Deseas previsualizar el resultado? (s/n)"
    if ($previewOption -eq "s") {
        Write-Host "🔍 Iniciando vista previa..." -ForegroundColor Yellow
        npm run preview
    }
} else {
    Write-Host "❌ Error en la construcción. Verifica los errores anteriores." -ForegroundColor Red
    exit 1
}

# Volver al directorio raíz
Set-Location -Path $PSScriptRoot
Write-Host "✨ Proceso completado! La aplicación está lista para despliegue." -ForegroundColor Cyan
Write-Host "📝 Se han corregido todas las URLs de API para usar 'https://baconfort-production-084d.up.railway.app/api'" -ForegroundColor Green
