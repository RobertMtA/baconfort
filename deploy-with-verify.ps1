#!/usr/bin/env pwsh
# deploy-with-verify.ps1
# Script mejorado para desplegar BaconFort con verificación automática

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

# 1. Compilar React
Write-ColorOutput "===== INICIANDO DESPLIEGUE BACONFORT =====" -ForegroundColor Cyan
Write-ColorOutput "Fecha y hora: $(Get-FormattedDateTime)" -ForegroundColor Gray
Write-ColorOutput ""

Write-ColorOutput "Compilando la aplicación React..." -ForegroundColor Yellow
Set-Location -Path "$projectPath\baconfort-react"

# Ejecutar npm run build
npm run build
$reactBuildSuccess = $?

if ($reactBuildSuccess) {
    Write-ColorOutput "React compilado exitosamente." -ForegroundColor Green
} else {
    Write-ColorOutput "Error compilando React. Abortando despliegue." -ForegroundColor Red
    exit 1
}

# 2. Desplegar a Firebase
Write-ColorOutput "Desplegando a Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting
$firebaseDeploySuccess = $?

if ($firebaseDeploySuccess) {
    Write-ColorOutput "Firebase desplegado exitosamente." -ForegroundColor Green
    
    # Guardar información del despliegue en un archivo para referencia
    $deployInfo = @{
        timestamp = Get-FormattedDateTime
        service = "firebase"
        success = $true
        url = "https://confort-ba.web.app"
    } | ConvertTo-Json
    
    $deployInfo | Out-File -FilePath "$projectPath\deploy-firebase-latest.json" -Encoding utf8
} else {
    Write-ColorOutput "Error desplegando a Firebase. Continuando con despliegue de backend..." -ForegroundColor Red
}

# 3. Desplegar backend a Railway
Write-ColorOutput "Desplegando backend a Railway..." -ForegroundColor Yellow
Set-Location -Path "$projectPath\baconfort-backend"

railway up
$railwayDeploySuccess = $?

if ($railwayDeploySuccess) {
    Write-ColorOutput "Backend desplegado exitosamente a Railway." -ForegroundColor Green
    
    # Guardar información del despliegue de backend
    $deployInfoBackend = @{
        timestamp = Get-FormattedDateTime
        service = "railway"
        success = $true
        url = "https://baconfort-production-084d.up.railway.app"
    } | ConvertTo-Json
    
    $deployInfoBackend | Out-File -FilePath "$projectPath\deploy-railway-latest.json" -Encoding utf8
} else {
    Write-ColorOutput "Error desplegando a Railway." -ForegroundColor Red
}

# 4. Verificar despliegue
Write-ColorOutput ""
Write-ColorOutput "===== VERIFICANDO DESPLIEGUE =====" -ForegroundColor Cyan

# Esperar un momento para que los servicios se inicialicen completamente
Write-ColorOutput "Esperando 10 segundos para que los servicios se inicialicen completamente..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 4.1 Verificar Frontend
Write-ColorOutput "Verificando Frontend (Firebase)..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "https://confort-ba.web.app" -Method Head -UseBasicParsing -ErrorAction SilentlyContinue
    if ($frontendResponse.StatusCode -eq 200) {
        Write-ColorOutput "✅ Frontend disponible en Firebase (Status: $($frontendResponse.StatusCode))" -ForegroundColor Green
        $frontendSuccess = $true
    } else {
        Write-ColorOutput "❌ Frontend con respuesta anormal: $($frontendResponse.StatusCode)" -ForegroundColor Red
        $frontendSuccess = $false
    }
} catch {
    Write-ColorOutput "❌ Error verificando frontend: $_" -ForegroundColor Red
    $frontendSuccess = $false
}

# 4.2 Verificar Backend
Write-ColorOutput "Verificando Backend (Railway)..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "https://baconfort-production-084d.up.railway.app/api/health" -UseBasicParsing -ErrorAction SilentlyContinue
    if ($backendResponse.StatusCode -eq 200) {
        Write-ColorOutput "✅ Backend respondiendo correctamente (Status: $($backendResponse.StatusCode))" -ForegroundColor Green
        $backendSuccess = $true
        
        # Intentar parsear la respuesta JSON
        try {
            $healthInfo = $backendResponse.Content | ConvertFrom-Json
            Write-ColorOutput "   - Estado: $($healthInfo.status)" -ForegroundColor Cyan
            Write-ColorOutput "   - Mensaje: $($healthInfo.message)" -ForegroundColor Cyan
        } catch {
            Write-ColorOutput "   - No se pudo parsear la respuesta JSON" -ForegroundColor Yellow
        }
    } else {
        Write-ColorOutput "❌ Backend con respuesta anormal: $($backendResponse.StatusCode)" -ForegroundColor Red
        $backendSuccess = $false
    }
} catch {
    Write-ColorOutput "❌ Error verificando backend: $_" -ForegroundColor Red
    $backendSuccess = $false
}

# 5. Generar resumen del despliegue
Write-ColorOutput ""
Write-ColorOutput "===== RESUMEN DE DESPLIEGUE =====" -ForegroundColor Cyan
Write-ColorOutput "Fecha y hora: $(Get-FormattedDateTime)" -ForegroundColor Gray
Write-ColorOutput ""

$overallSuccess = $frontendSuccess -and $backendSuccess

if ($overallSuccess) {
    Write-ColorOutput "✅ DESPLIEGUE EXITOSO" -ForegroundColor Green
} else {
    Write-ColorOutput "⚠️ DESPLIEGUE CON PROBLEMAS" -ForegroundColor Yellow
}

Write-ColorOutput "Frontend (Firebase): $(if ($frontendSuccess) { "✅ OK" } else { "❌ Error" })" -ForegroundColor $(if ($frontendSuccess) { "Green" } else { "Red" })
Write-ColorOutput "Backend (Railway): $(if ($backendSuccess) { "✅ OK" } else { "❌ Error" })" -ForegroundColor $(if ($backendSuccess) { "Green" } else { "Red" })

# 6. Guardar información completa del despliegue
$deploymentSummary = @{
    timestamp = Get-FormattedDateTime
    success = $overallSuccess
    frontend = @{
        success = $frontendSuccess
        url = "https://confort-ba.web.app"
    }
    backend = @{
        success = $backendSuccess
        url = "https://baconfort-production-084d.up.railway.app"
    }
    buildTimestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
} | ConvertTo-Json

$deploymentSummary | Out-File -FilePath "$projectPath\deployment-latest.json" -Encoding utf8

Write-ColorOutput ""
Write-ColorOutput "URLs de acceso:" -ForegroundColor Cyan
Write-ColorOutput "- Frontend: https://confort-ba.web.app" -ForegroundColor White
Write-ColorOutput "- Backend: https://baconfort-production-084d.up.railway.app/api" -ForegroundColor White
Write-ColorOutput ""
Write-ColorOutput "Para verificación completa del sistema, ejecute:" -ForegroundColor Cyan
Write-ColorOutput ".\verify-deployment.ps1" -ForegroundColor White
Write-ColorOutput ""

# Volver a la ruta original del proyecto
Set-Location -Path $projectPath
