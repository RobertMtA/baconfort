# Script para compilar y desplegar la versión responsive de BAconfort
$ErrorActionPreference = "Stop"

# Comprobar que estamos en la ubicación correcta
if (-Not (Test-Path -Path "./baconfort-react")) {
    Write-Host "❌ Error: No se encuentra la carpeta baconfort-react. Ejecute este script desde el directorio raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Mensaje de inicio
Write-Host "🔄 Compilando y desplegando la versión responsive de BAconfort..." -ForegroundColor Cyan
Write-Host "----------------------------------------------------------" -ForegroundColor Cyan

# Comprobar dependencias
Write-Host "📋 Comprobando dependencias..." -ForegroundColor Yellow
$dependencies = @("node", "npm", "firebase", "git")
$allDependenciesInstalled = $true

foreach ($dependency in $dependencies) {
    try {
        $null = & where.exe $dependency 2> $null
        Write-Host "✅ $dependency está instalado" -ForegroundColor Green
    } catch {
        Write-Host "❌ $dependency no está instalado" -ForegroundColor Red
        $allDependenciesInstalled = $false
    }
}

if (-Not $allDependenciesInstalled) {
    Write-Host "❌ Error: Faltan dependencias. Por favor, instale las dependencias faltantes e inténtelo de nuevo." -ForegroundColor Red
    exit 1
}

# Paso 1: Construir la aplicación React con las nuevas mejoras responsive
Write-Host "`n📱 [1/4] Construyendo la aplicación React con mejoras responsive..." -ForegroundColor Cyan
Set-Location -Path "./baconfort-react"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Falló la compilación de la aplicación React." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Aplicación React compilada correctamente" -ForegroundColor Green
Set-Location -Path ".."

# Paso 2: Copiar archivos al directorio de Firebase
Write-Host "`n📂 [2/4] Copiando archivos para despliegue en Firebase..." -ForegroundColor Cyan

if (Test-Path -Path "./baconfort-react/dist") {
    # Si la carpeta build no existe, copiar dist
    Write-Host "Usando carpeta dist para despliegue..." -ForegroundColor Yellow
    Copy-Item -Path "./baconfort-react/dist" -Destination "./build" -Force -Recurse
} else {
    Write-Host "❌ Error: No se encuentra la carpeta dist. La compilación puede haber fallado." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Archivos copiados correctamente" -ForegroundColor Green

# Paso 3: Desplegar a Firebase
Write-Host "`n🔥 [3/4] Desplegando a Firebase..." -ForegroundColor Cyan
firebase deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Falló el despliegue a Firebase." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Despliegue a Firebase completado correctamente" -ForegroundColor Green

# Paso 4: Hacer commit y push de los cambios
Write-Host "`n📤 [4/4] Guardando cambios en GitHub..." -ForegroundColor Cyan

# Solicitar mensaje de commit o usar uno predeterminado
$commitMessage = Read-Host "Introduce un mensaje para el commit (o presiona Enter para usar 'Actualización: mejoras de responsividad')"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Actualización: mejoras de responsividad"
}

git add .
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Falló al hacer commit de los cambios." -ForegroundColor Red
    exit 1
}

git push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Falló al hacer push de los cambios." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Cambios guardados y subidos a GitHub correctamente" -ForegroundColor Green

# Mensaje final
Write-Host "`n🎉 ¡Todo el proceso se ha completado correctamente!" -ForegroundColor Green
Write-Host "--------------------------------" -ForegroundColor Green
Write-Host "Resumen:" -ForegroundColor Green
Write-Host "- ✅ Aplicación con mejoras responsive compilada" -ForegroundColor Green
Write-Host "- ✅ Versión responsive desplegada en Firebase" -ForegroundColor Green
Write-Host "- ✅ Cambios guardados en GitHub" -ForegroundColor Green
Write-Host "`nPuedes ver la aplicación en: https://confort-ba.web.app" -ForegroundColor Cyan
Write-Host "`nGracias por usar este script de despliegue responsive." -ForegroundColor Yellow
