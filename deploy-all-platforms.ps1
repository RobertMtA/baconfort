#!/usr/bin/env pwsh
# deploy-all-platforms.ps1
# Script para desplegar a todas las plataformas: Firebase, GitHub y Railway

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

# Función para obtener la fecha y hora formateada
function Get-FormattedDateTime {
    return Get-Date -Format "dd/MM/yyyy HH:mm:ss"
}

# Ruta base del proyecto (usando la ruta absoluta para evitar problemas)
$projectPath = "C:\Users\rober\Desktop\baconfort5- copia"

# Solicitar mensaje de commit
Write-ColorOutput "===== DESPLIEGUE COMPLETO BACONFORT =====" -ForegroundColor Cyan
Write-ColorOutput "Fecha y hora: $(Get-FormattedDateTime)" -ForegroundColor Gray
$commitMessage = Read-Host -Prompt "Ingrese mensaje para el commit (obligatorio)"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    Write-ColorOutput "Error: El mensaje de commit es obligatorio. Abortando." -ForegroundColor Red
    exit 1
}

# 1. COMPILAR FRONTEND
Write-ColorOutput "1. Compilando la aplicación React..." -ForegroundColor Yellow
Set-Location -Path "$projectPath\baconfort-react"
npm run build
$reactBuildSuccess = $?

if (-not $reactBuildSuccess) {
    Write-ColorOutput "Error compilando React. Abortando despliegue." -ForegroundColor Red
    exit 1
}
Write-ColorOutput "✅ React compilado exitosamente." -ForegroundColor Green

# 2. DESPLEGAR A FIREBASE
Write-ColorOutput "2. Desplegando a Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting
$firebaseDeploySuccess = $?

if ($firebaseDeploySuccess) {
    Write-ColorOutput "✅ Firebase desplegado exitosamente." -ForegroundColor Green
    
    # Guardar información del despliegue en un archivo para referencia
    $deployInfo = @{
        timestamp = Get-FormattedDateTime
        service = "firebase"
        success = $true
        url = "https://confort-ba.web.app"
    } | ConvertTo-Json
    
    $deployInfo | Out-File -FilePath "$projectPath\deploy-firebase-latest.json" -Encoding utf8
} else {
    Write-ColorOutput "❌ Error desplegando a Firebase. Continuando con el resto del despliegue..." -ForegroundColor Red
}

# 3. DESPLEGAR BACKEND A RAILWAY
Write-ColorOutput "3. Desplegando backend a Railway..." -ForegroundColor Yellow
Set-Location -Path "$projectPath\baconfort-backend"
railway up
$railwayDeploySuccess = $?

if ($railwayDeploySuccess) {
    Write-ColorOutput "✅ Backend desplegado exitosamente a Railway." -ForegroundColor Green
    
    # Guardar información del despliegue de backend
    $deployInfoBackend = @{
        timestamp = Get-FormattedDateTime
        service = "railway"
        success = $true
        url = "https://baconfort-production-084d.up.railway.app"
    } | ConvertTo-Json
    
    $deployInfoBackend | Out-File -FilePath "$projectPath\deploy-railway-latest.json" -Encoding utf8
} else {
    Write-ColorOutput "❌ Error desplegando a Railway." -ForegroundColor Red
}

# 4. COMMIT Y PUSH A GITHUB
Write-ColorOutput "4. Guardando cambios en GitHub..." -ForegroundColor Yellow
Set-Location -Path "$projectPath"

# Añadir todos los archivos
git add .
$gitAddSuccess = $?

if (-not $gitAddSuccess) {
    Write-ColorOutput "❌ Error añadiendo archivos a Git. Continuando..." -ForegroundColor Red
}

# Crear commit
git commit -m "$commitMessage"
$gitCommitSuccess = $?

if (-not $gitCommitSuccess) {
    Write-ColorOutput "❌ Error creando commit. Verifica el estado de Git y continúa manualmente." -ForegroundColor Red
} else {
    Write-ColorOutput "✅ Commit creado exitosamente." -ForegroundColor Green
}

# Push a repositorio remoto
git push origin main
$gitPushSuccess = $?

if ($gitPushSuccess) {
    Write-ColorOutput "✅ Cambios subidos a GitHub exitosamente." -ForegroundColor Green
} else {
    Write-ColorOutput "❌ Error subiendo cambios a GitHub." -ForegroundColor Red
}

# 5. VERIFICAR DESPLIEGUE
Write-ColorOutput ""
Write-ColorOutput "===== VERIFICANDO DESPLIEGUE COMPLETO =====" -ForegroundColor Cyan

# Esperar un momento para que los servicios se inicialicen completamente
Write-ColorOutput "Esperando 10 segundos para que los servicios se inicialicen completamente..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Ejecutar script de verificación
Write-ColorOutput "Ejecutando verificación completa..." -ForegroundColor Yellow
& "$projectPath\verify-deployment.ps1"
$verifySuccess = $?

# 6. GENERAR RESUMEN DEL DESPLIEGUE
Write-ColorOutput ""
Write-ColorOutput "===== RESUMEN DE DESPLIEGUE COMPLETO =====" -ForegroundColor Cyan
Write-ColorOutput "Fecha y hora: $(Get-FormattedDateTime)" -ForegroundColor Gray
Write-ColorOutput ""

# Evaluar éxito general
$overallSuccess = $firebaseDeploySuccess -and $railwayDeploySuccess -and $gitPushSuccess

if ($overallSuccess) {
    Write-ColorOutput "✅ DESPLIEGUE COMPLETO EXITOSO" -ForegroundColor Green
} else {
    Write-ColorOutput "⚠️ DESPLIEGUE COMPLETADO CON ADVERTENCIAS" -ForegroundColor Yellow
}

Write-ColorOutput "Firebase (Frontend): $(if ($firebaseDeploySuccess) { "✅ OK" } else { "❌ Error" })" -ForegroundColor $(if ($firebaseDeploySuccess) { "Green" } else { "Red" })
Write-ColorOutput "Railway (Backend): $(if ($railwayDeploySuccess) { "✅ OK" } else { "❌ Error" })" -ForegroundColor $(if ($railwayDeploySuccess) { "Green" } else { "Red" })
Write-ColorOutput "GitHub: $(if ($gitPushSuccess) { "✅ OK" } else { "❌ Error" })" -ForegroundColor $(if ($gitPushSuccess) { "Green" } else { "Red" })

# Guardar información completa del despliegue
$deploymentSummary = @{
    timestamp = Get-FormattedDateTime
    success = $overallSuccess
    commitMessage = $commitMessage
    frontend = @{
        success = $firebaseDeploySuccess
        url = "https://confort-ba.web.app"
    }
    backend = @{
        success = $railwayDeploySuccess
        url = "https://baconfort-production-084d.up.railway.app"
    }
    github = @{
        success = $gitPushSuccess
    }
} | ConvertTo-Json

$deploymentSummary | Out-File -FilePath "$projectPath\deployment-all-platforms-latest.json" -Encoding utf8

Write-ColorOutput ""
Write-ColorOutput "URLs de acceso:" -ForegroundColor Cyan
Write-ColorOutput "- Frontend: https://confort-ba.web.app" -ForegroundColor White
Write-ColorOutput "- Backend: https://baconfort-production-084d.up.railway.app/api" -ForegroundColor White
Write-ColorOutput "- Repositorio: https://github.com/RobertMtA/baconfort" -ForegroundColor White
Write-ColorOutput ""
Write-ColorOutput "Commit Message: '$commitMessage'" -ForegroundColor White
Write-ColorOutput ""

# Volver a la ruta original del proyecto
Set-Location -Path $projectPath
