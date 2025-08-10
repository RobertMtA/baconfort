# Script para realizar commit y despliegue a Firebase y Railway
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "🚀 BACONFORT - COMMIT Y DESPLIEGUE" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""

# Ejecutar primero el script de configuración
Write-Host "📝 Ejecutando script de configuración..." -ForegroundColor Cyan
.\deploy-firebase-railway.ps1

# Verificar que la compilación fue exitosa
$distFolder = Join-Path (Get-Location) "baconfort-react\dist"
if (!(Test-Path $distFolder)) {
    Write-Host "❌ La compilación falló. No se encuentra la carpeta dist." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Compilación exitosa" -ForegroundColor Green

# Preparar el commit
Write-Host ""
Write-Host "🔧 Preparando commit..." -ForegroundColor Yellow
$commitMessage = "Configuración para Firebase y Railway - " + (Get-Date -Format "yyyy-MM-dd HH:mm")

# Verificar si git está instalado
try {
    $gitVersion = git --version
    Write-Host "✓ Git detectado: $gitVersion" -ForegroundColor Gray
} catch {
    Write-Host "❌ Git no encontrado. Por favor instala Git para continuar." -ForegroundColor Red
    exit 1
}

# Verificar si estamos en un repositorio git
$isRepo = $false
try {
    $gitStatus = git rev-parse --is-inside-work-tree
    if ($gitStatus -eq "true") {
        $isRepo = $true
    }
} catch {
    $isRepo = $false
}

if (!$isRepo) {
    Write-Host "⚠️ No estás dentro de un repositorio Git. Inicializando..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Repositorio Git inicializado" -ForegroundColor Green
}

# Realizar commit
Write-Host "📦 Agregando archivos al commit..." -ForegroundColor Yellow
git add .

Write-Host "✍️ Realizando commit: '$commitMessage'" -ForegroundColor Yellow
git commit -m $commitMessage

# Verificar si hay un remote configurado
$hasRemote = $false
try {
    $remotes = git remote
    $hasRemote = $remotes.Length -gt 0
} catch {
    $hasRemote = $false
}

if ($hasRemote) {
    $branch = git branch --show-current
    
    Write-Host "🔄 Subiendo cambios al repositorio remoto (rama: $branch)..." -ForegroundColor Yellow
    git push origin $branch
    
    Write-Host "✅ Cambios subidos correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️ No hay repositorio remoto configurado. Solo se ha realizado el commit local." -ForegroundColor Yellow
    Write-Host "   Para configurar un repositorio remoto, ejecuta:" -ForegroundColor Yellow
    Write-Host "   git remote add origin URL_DE_TU_REPOSITORIO" -ForegroundColor Gray
    Write-Host "   git push -u origin main" -ForegroundColor Gray
}

# Desplegar a Firebase
Write-Host ""
Write-Host "🔥 ¿Deseas desplegar a Firebase ahora? (S/N)" -ForegroundColor Yellow
$deployFirebase = Read-Host
if ($deployFirebase -eq "S" -or $deployFirebase -eq "s") {
    Write-Host "🔥 Desplegando a Firebase..." -ForegroundColor Yellow
    firebase deploy
    
    Write-Host "✅ Despliegue a Firebase completado" -ForegroundColor Green
    
    # Obtener URL de Firebase
    Write-Host "📋 Verifica la URL de tu aplicación en Firebase Hosting:" -ForegroundColor Yellow
    Write-Host "   https://console.firebase.google.com/project/_/hosting/sites" -ForegroundColor Cyan
} else {
    Write-Host "⏭️ Despliegue a Firebase omitido" -ForegroundColor Gray
    Write-Host "   Para desplegar más tarde, ejecuta:" -ForegroundColor Gray
    Write-Host "   firebase deploy" -ForegroundColor Cyan
}

# Desplegar a Railway
Write-Host ""
Write-Host "🚂 ¿Deseas desplegar el backend a Railway ahora? (S/N)" -ForegroundColor Yellow
$deployRailway = Read-Host
if ($deployRailway -eq "S" -or $deployRailway -eq "s") {
    # Verificar si railway CLI está instalado
    $hasRailway = $false
    try {
        $railwayVersion = railway
        $hasRailway = $true
        Write-Host "✓ Railway CLI detectado: $railwayVersion" -ForegroundColor Gray
    } catch {
        $hasRailway = $false
    }
    
    if ($hasRailway) {
        Write-Host "🚂 Desplegando backend a Railway..." -ForegroundColor Yellow
        Set-Location -Path "baconfort-backend"
        railway up
        Set-Location -Path ".."
        
        Write-Host "✅ Despliegue a Railway completado" -ForegroundColor Green
    } else {
        Write-Host "❌ Railway CLI no encontrado. Instalalo con:" -ForegroundColor Red
        Write-Host "   npm i -g @railway/cli" -ForegroundColor Cyan
        Write-Host "   Luego inicia sesión con: railway login" -ForegroundColor Cyan
    }
} else {
    Write-Host "⏭️ Despliegue a Railway omitido" -ForegroundColor Gray
    Write-Host "   Para desplegar más tarde, ejecuta:" -ForegroundColor Gray
    Write-Host "   cd baconfort-backend && railway up" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✅ PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
