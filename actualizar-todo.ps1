# Script para actualizar Firebase, hacer commit en GitHub y actualizar Railway
# Autor: GitHub Copilot
# Fecha: 11 de agosto de 2025

# Colores para los mensajes
$colorInfo = "Cyan"
$colorSuccess = "Green"
$colorWarning = "Yellow"
$colorError = "Red"

# Función para mostrar mensajes con formato
function Show-Message {
    param (
        [string]$Message,
        [string]$Color = "White",
        [switch]$NoNewLine
    )
    
    if ($NoNewLine) {
        Write-Host $Message -ForegroundColor $Color -NoNewline
    } else {
        Write-Host $Message -ForegroundColor $Color
    }
}

# Función para comprobar si un comando existe
function Test-Command {
    param (
        [string]$Command
    )
    
    $exists = Get-Command $Command -ErrorAction SilentlyContinue
    return $null -ne $exists
}

# Comprobar requisitos
Show-Message "Comprobando requisitos..." $colorInfo
$requirements = @("git", "firebase", "railway")
$missingRequirements = @()

foreach ($req in $requirements) {
    if (-not (Test-Command $req)) {
        $missingRequirements += $req
    }
}

if ($missingRequirements.Count -gt 0) {
    Show-Message "Faltan algunos comandos requeridos: $($missingRequirements -join ', ')" $colorError
    Show-Message "Por favor, instala los comandos faltantes e inténtalo de nuevo." $colorError
    exit 1
}

Show-Message "✓ Todos los requisitos están instalados." $colorSuccess

# Pedimos mensaje para el commit
$commitMessage = Read-Host "Introduce un mensaje para el commit (o presiona Enter para usar 'Actualización: mejoras en sistema de recuperación de contraseña')"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Actualización: mejoras en sistema de recuperación de contraseña"
}

# 1. Construir el frontend
Show-Message "`n[1/6] Construyendo el frontend..." $colorInfo
Set-Location -Path "$PSScriptRoot\baconfort-react"

Show-Message "Ejecutando npm run build..." $colorInfo
npm run build

if ($LASTEXITCODE -ne 0) {
    Show-Message "Error al construir el frontend. Revisa los errores anteriores." $colorError
    exit 1
}

Show-Message "✓ Frontend construido correctamente." $colorSuccess

# 2. Copiar archivos de build al directorio de Firebase
Show-Message "`n[2/6] Copiando archivos al directorio de Firebase..." $colorInfo
Set-Location -Path "$PSScriptRoot"

if (Test-Path -Path "$PSScriptRoot\build") {
    Remove-Item -Path "$PSScriptRoot\build" -Recurse -Force
}

Copy-Item -Path "$PSScriptRoot\baconfort-react\build" -Destination "$PSScriptRoot\build" -Recurse

Show-Message "✓ Archivos copiados correctamente." $colorSuccess

# 3. Desplegar a Firebase
Show-Message "`n[3/6] Desplegando a Firebase..." $colorInfo
Set-Location -Path "$PSScriptRoot"

Show-Message "Ejecutando firebase deploy..." $colorInfo
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Show-Message "Error al desplegar a Firebase. Revisa los errores anteriores." $colorError
    exit 1
}

Show-Message "✓ Desplegado a Firebase correctamente." $colorSuccess

# 4. Hacer commit y push a GitHub
Show-Message "`n[4/6] Haciendo commit y push a GitHub..." $colorInfo
Set-Location -Path "$PSScriptRoot"

# Añadir todos los archivos
Show-Message "Añadiendo archivos al commit..." $colorInfo
git add .

# Hacer commit con el mensaje
Show-Message "Haciendo commit con el mensaje: '$commitMessage'..." $colorInfo
git commit -m "$commitMessage"

if ($LASTEXITCODE -ne 0) {
    Show-Message "Error al hacer commit. Revisa los errores anteriores." $colorError
    exit 1
}

# Push al repositorio remoto
Show-Message "Haciendo push al repositorio remoto..." $colorInfo
git push origin main

if ($LASTEXITCODE -ne 0) {
    Show-Message "Error al hacer push. Revisa los errores anteriores." $colorError
    exit 1
}

Show-Message "✓ Commit y push realizados correctamente." $colorSuccess

# 5. Desplegar el backend a Railway
Show-Message "`n[5/6] Desplegando el backend a Railway..." $colorInfo
Set-Location -Path "$PSScriptRoot\baconfort-backend"

Show-Message "Ejecutando railway up..." $colorInfo
railway up --detach

if ($LASTEXITCODE -ne 0) {
    Show-Message "Error al desplegar a Railway. Revisa los errores anteriores." $colorError
    exit 1
}

Show-Message "✓ Backend desplegado a Railway correctamente." $colorSuccess

# 6. Finalización
Show-Message "`n[6/6] Verificando el estado de los despliegues..." $colorInfo
Set-Location -Path "$PSScriptRoot"

# URL de Firebase
$firebaseUrl = "https://confort-ba.web.app"
Show-Message "Frontend desplegado en: $firebaseUrl" $colorSuccess

# URL de Railway (la obtenemos si es posible)
Set-Location -Path "$PSScriptRoot\baconfort-backend"
$railwayUrl = railway status 2>$null | Select-String "URL:" | ForEach-Object { $_.ToString().Trim() }
if ([string]::IsNullOrWhiteSpace($railwayUrl)) {
    Show-Message "Backend desplegado en Railway. Visita la consola de Railway para más detalles." $colorSuccess
} else {
    Show-Message "Backend desplegado en: $railwayUrl" $colorSuccess
}

# Volver al directorio raíz
Set-Location -Path "$PSScriptRoot"

Show-Message "`n¡Todo el proceso se ha completado correctamente!" $colorSuccess
Show-Message "Resumen:" $colorInfo
Show-Message "- Frontend construido y desplegado en Firebase" $colorInfo
Show-Message "- Cambios guardados en GitHub" $colorInfo
Show-Message "- Backend desplegado en Railway" $colorInfo

Show-Message "`nGracias por usar este script de automatización." $colorInfo
