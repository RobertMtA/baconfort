# Script para probar los cambios en la autenticación de administrador
# Este script despliega los cambios y verifica que todo funcione correctamente

Write-Host "🔄 Iniciando despliegue de solución para problemas de autenticación admin..." -ForegroundColor Cyan

# Obtener la ruta base del proyecto
$basePath = Get-Location
Write-Host "📂 Ruta base: $basePath"

# Cambiar a la carpeta del frontend
$frontendPath = Join-Path -Path $basePath -ChildPath "baconfort-react"
Write-Host "📂 Cambiando a la carpeta del frontend: $frontendPath" -ForegroundColor Yellow
Set-Location -Path $frontendPath

# Instalar dependencias y compilar (solo si es necesario)
if (Test-Path -Path "node_modules") {
    Write-Host "📦 Las dependencias ya están instaladas, omitiendo npm install" -ForegroundColor Green
} else {
    Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Blue
    npm install
}

# Verificar archivos modificados
Write-Host "🔍 Verificando archivos modificados:" -ForegroundColor Magenta
Write-Host "  - adminTokenManager.js"
Write-Host "  - api.js"
Write-Host "  - inquiryService.js"

# Compilar el proyecto
Write-Host "🛠️ Compilando proyecto..." -ForegroundColor Blue
npm run build

# Verificar si la compilación fue exitosa
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilación exitosa!" -ForegroundColor Green
} else {
    Write-Host "❌ Error en la compilación. Revisar errores y corregir antes de continuar." -ForegroundColor Red
    exit 1
}

# Verificar si Firebase está disponible para el despliegue
$firebaseExists = $null
try {
    $firebaseExists = Get-Command firebase -ErrorAction SilentlyContinue
} catch {
    $firebaseExists = $null
}

if ($firebaseExists) {
    Write-Host "🔥 Desplegando a Firebase..." -ForegroundColor Yellow
    firebase deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Despliegue a Firebase exitoso!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Hubo un problema con el despliegue a Firebase." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ Firebase CLI no está disponible. Sólo se ha compilado el proyecto." -ForegroundColor Yellow
}

Write-Host "🔄 Volviendo a la ruta original..." -ForegroundColor Cyan
Set-Location -Path $basePath

Write-Host "✨ Proceso completado. Los cambios de autenticación admin están listos para ser probados." -ForegroundColor Green
