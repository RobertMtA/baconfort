# Script para actualizar cambios a GitHub y Railway
$ErrorActionPreference = "Stop"

# Comprobar que estamos en la ubicación correcta
if (-Not (Test-Path -Path "./baconfort-react")) {
    Write-Host "❌ Error: No se encuentra la carpeta baconfort-react. Ejecute este script desde el directorio raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Mensaje de inicio
Write-Host "🔄 Actualizando cambios en GitHub y Railway..." -ForegroundColor Cyan
Write-Host "----------------------------------------------------------" -ForegroundColor Cyan

# Comprobar dependencias
Write-Host "📋 Comprobando dependencias..." -ForegroundColor Yellow
$dependencies = @("node", "npm", "git", "railway")
$allDependenciesInstalled = $true

foreach ($dependency in $dependencies) {
    try {
        $null = & where.exe $dependency 2> $null
        Write-Host "✅ $dependency está instalado" -ForegroundColor Green
    } catch {
        if ($dependency -eq "railway") {
            Write-Host "⚠️ railway CLI no está instalado o no está en PATH. Se omitirá la actualización de Railway." -ForegroundColor Yellow
        } else {
            Write-Host "❌ $dependency no está instalado" -ForegroundColor Red
            $allDependenciesInstalled = $false
        }
    }
}

if (-Not $allDependenciesInstalled) {
    Write-Host "❌ Error: Faltan dependencias básicas. Por favor, instale las dependencias faltantes e inténtelo de nuevo." -ForegroundColor Red
    exit 1
}

# Paso 1: Hacer commit de los cambios
Write-Host "`n📤 [1/2] Guardando cambios en GitHub..." -ForegroundColor Cyan

# Solicitar mensaje de commit o usar uno predeterminado
$commitMessage = Read-Host "Introduce un mensaje para el commit (o presiona Enter para usar 'Actualización: implementación de diseño responsive')"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Actualización: implementación de diseño responsive"
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

# Paso 2: Actualizar Railway si está disponible
Write-Host "`n🚂 [2/2] Actualizando Railway..." -ForegroundColor Cyan

# Verificar si existe railway
$railwayExists = $null -ne (Get-Command railway -ErrorAction SilentlyContinue)

if ($railwayExists) {
    # Actualizando backend
    Write-Host "Actualizando backend en Railway..." -ForegroundColor Yellow
    Set-Location -Path "./baconfort-backend"
    railway up

    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Advertencia: Hubo problemas al actualizar Railway. Verifica manualmente." -ForegroundColor Yellow
    } else {
        Write-Host "✅ Backend actualizado en Railway correctamente" -ForegroundColor Green
    }
    Set-Location -Path ".."
} else {
    Write-Host "⚠️ La CLI de Railway no está disponible. No se pudo actualizar automáticamente." -ForegroundColor Yellow
    Write-Host "   Puedes actualizar Railway manualmente ejecutando 'railway up' dentro de la carpeta baconfort-backend" -ForegroundColor Yellow
}

# Mensaje final
Write-Host "`n🎉 ¡Proceso completado!" -ForegroundColor Green
Write-Host "--------------------------------" -ForegroundColor Green
Write-Host "Resumen:" -ForegroundColor Green
Write-Host "- ✅ Cambios guardados en GitHub" -ForegroundColor Green
if ($railwayExists) {
    Write-Host "- ✅ Backend actualizado en Railway" -ForegroundColor Green
} else {
    Write-Host "- ⚠️ Railway no pudo ser actualizado automáticamente" -ForegroundColor Yellow
}

Write-Host "`nSiguientes pasos:" -ForegroundColor Cyan
Write-Host "1. Para actualizar Firebase manualmente, puedes ejecutar: 'firebase deploy' desde el directorio principal" -ForegroundColor Cyan
Write-Host "2. Para actualizar Railway manualmente (si no se actualizó automáticamente), ejecuta: 'cd baconfort-backend && railway up'" -ForegroundColor Cyan

Write-Host "`nGracias por usar este script de actualización." -ForegroundColor Yellow
