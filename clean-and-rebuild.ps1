# clean-and-rebuild.ps1
# Script para limpiar caché y reconstruir la aplicación completamente

Write-Host "🧹 Iniciando limpieza completa y reconstrucción..." -ForegroundColor Cyan

# Navegar al directorio frontend
Write-Host "📁 Navegando al directorio frontend..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\baconfort-react"

# Limpiar cache de npm
Write-Host "🧹 Limpiando caché de npm..." -ForegroundColor Yellow
npm cache clean --force

# Eliminar node_modules
Write-Host "🧹 Eliminando node_modules..." -ForegroundColor Yellow
if (Test-Path -Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}

# Eliminar dist
Write-Host "🧹 Eliminando directorio dist..." -ForegroundColor Yellow
if (Test-Path -Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

# Eliminar archivos de caché
Write-Host "🧹 Eliminando archivos de caché..." -ForegroundColor Yellow
if (Test-Path -Path ".vite") {
    Remove-Item -Recurse -Force ".vite"
}

# Reinstalar dependencias
Write-Host "📦 Reinstalando dependencias..." -ForegroundColor Yellow
npm install

# Verificar que las variables de entorno estén configuradas correctamente
Write-Host "🔍 Verificando variables de entorno..." -ForegroundColor Yellow

$envFile = ".env"
$envContent = Get-Content -Path $envFile -Raw
if (-not ($envContent -match "VITE_API_URL=https://baconfort-production-084d.up.railway.app/api")) {
    Write-Host "⚠️ Corrigiendo VITE_API_URL en .env..." -ForegroundColor Yellow
    $envContent = $envContent -replace "VITE_API_URL=.*", "VITE_API_URL=https://baconfort-production-084d.up.railway.app/api"
    $envContent | Out-File -FilePath $envFile -Encoding utf8
}

# Construir la aplicación
Write-Host "🏗️ Reconstruyendo el proyecto..." -ForegroundColor Yellow
npm run build

# Verificar si la construcción fue exitosa
if (Test-Path -Path "dist") {
    Write-Host "✅ Construcción exitosa!" -ForegroundColor Green
    
    # Crear archivo .env.local para desarrollo si no existe
    if (-not (Test-Path -Path ".env.local")) {
        Write-Host "📄 Creando archivo .env.local para desarrollo..." -ForegroundColor Yellow
        @"
# Archivo .env.local para desarrollo
# Este archivo no se sube a git y tiene prioridad sobre .env

# URL de la API para desarrollo local
# VITE_API_URL=http://localhost:5004/api

# Usar API de producción para evitar problemas
VITE_API_URL=https://baconfort-production-084d.up.railway.app/api
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    }
    
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
Write-Host "✨ Proceso completado! La aplicación ha sido limpiada y reconstruida." -ForegroundColor Cyan
Write-Host "📝 Se ha configurado la URL de API a: https://baconfort-production-084d.up.railway.app/api" -ForegroundColor Green
Write-Host "💡 Consejo: Si sigues viendo errores, limpia el caché del navegador presionando Ctrl+F5" -ForegroundColor Yellow
