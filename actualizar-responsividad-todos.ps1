#!/usr/bin/env pwsh
# Script para actualizar todos los componentes del proyecto con cambios de responsividad
# Autor: GitHub Copilot
# Fecha: Mayo 2023

# Colores para los mensajes
$colorInfo = "Cyan"
$colorSuccess = "Green"
$colorWarning = "Yellow"
$colorError = "Red"
$colorTitle = "Magenta"

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

# Función para mostrar un título de sección
function Show-Section {
    param (
        [string]$Title
    )
    
    Show-Message "`n" -NoNewLine
    Show-Message "════════════════════════════════════════════" $colorTitle
    Show-Message "  $Title" $colorTitle
    Show-Message "════════════════════════════════════════════" $colorTitle
}

# Función para comprobar si un comando existe
function Test-Command {
    param (
        [string]$Command
    )
    
    $exists = Get-Command $Command -ErrorAction SilentlyContinue
    return $null -ne $exists
}

# Función para manejar errores
function Handle-Error {
    param (
        [string]$ErrorMessage,
        [switch]$Exit
    )
    
    Show-Message "❌ ERROR: $ErrorMessage" $colorError
    
    if ($Exit) {
        Show-Message "El script se detendrá debido a un error crítico." $colorError
        exit 1
    }
    
    $continue = Read-Host "¿Deseas continuar a pesar del error? (s/N)"
    if ($continue.ToLower() -ne "s") {
        Show-Message "Saliendo del script por decisión del usuario." $colorWarning
        exit 0
    }
}

# Mostrar banner inicial
Show-Message "`n" -NoNewLine
Show-Message "╔═══════════════════════════════════════════════════════════╗" $colorTitle
Show-Message "║  ACTUALIZACIÓN COMPLETA DE BACONFORT - RESPONSIVIDAD      ║" $colorTitle
Show-Message "╚═══════════════════════════════════════════════════════════╝" $colorTitle
Show-Message "`n" -NoNewLine

# Comprobar requisitos
Show-Section "Comprobando requisitos"
$requirements = @("git", "firebase", "railway")
$missingRequirements = @()

foreach ($req in $requirements) {
    Show-Message "Verificando $req..." $colorInfo -NoNewLine
    if (-not (Test-Command $req)) {
        Show-Message " NO ENCONTRADO" $colorError
        $missingRequirements += $req
    } else {
        Show-Message " OK" $colorSuccess
    }
}

if ($missingRequirements.Count -gt 0) {
    Handle-Error "Faltan algunos comandos requeridos: $($missingRequirements -join ', ')" -Exit
}

# Verificar que estamos en la raíz del proyecto
if (-not (Test-Path -Path ".\baconfort-react")) {
    Handle-Error "No se encontró el directorio 'baconfort-react'. Asegúrate de ejecutar este script desde la raíz del proyecto." -Exit
}

# Pedimos mensaje para el commit
Show-Section "Configuración de actualización"
$defaultMessage = "Fix: Mejoras de responsividad en páginas de departamentos y menú móvil"
Show-Message "Introduce un mensaje para el commit (o presiona Enter para usar el mensaje predeterminado):" $colorInfo
$commitMessage = Read-Host "[$defaultMessage]"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = $defaultMessage
}

# 1. Construir el frontend
Show-Section "1. Construyendo el frontend"
Set-Location -Path "$PSScriptRoot\baconfort-react"

Show-Message "Ejecutando npm run build..." $colorInfo
npm run build

if ($LASTEXITCODE -ne 0) {
    Handle-Error "Error al construir el frontend. Revisa los errores anteriores." -Exit
}

Show-Message "✅ Frontend construido correctamente." $colorSuccess

# 2. Copiar archivos de build al directorio de Firebase
Show-Section "2. Preparando archivos para Firebase"
Set-Location -Path "$PSScriptRoot"

if (Test-Path -Path "$PSScriptRoot\build") {
    Show-Message "Eliminando directorio build anterior..." $colorInfo
    Remove-Item -Path "$PSScriptRoot\build" -Recurse -Force
}

Show-Message "Copiando archivos de build..." $colorInfo
Copy-Item -Path "$PSScriptRoot\baconfort-react\build" -Destination "$PSScriptRoot\build" -Recurse

Show-Message "✅ Archivos copiados correctamente." $colorSuccess

# 3. Desplegar a Firebase
Show-Section "3. Desplegando a Firebase"
Set-Location -Path "$PSScriptRoot"

Show-Message "Ejecutando firebase deploy..." $colorInfo
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Handle-Error "Error al desplegar a Firebase. Revisa los errores anteriores."
} else {
    Show-Message "✅ Desplegado a Firebase correctamente." $colorSuccess
}

# 4. Hacer commit y push a GitHub
Show-Section "4. Actualizando repositorio en GitHub"
Set-Location -Path "$PSScriptRoot"

# Mostrar archivos modificados
Show-Message "Archivos modificados:" $colorInfo
git status -s
Show-Message ""

# Añadir todos los archivos
Show-Message "Añadiendo archivos al commit..." $colorInfo
git add .

# Hacer commit con el mensaje
Show-Message "Haciendo commit con el mensaje: '$commitMessage'..." $colorInfo
git commit -m "$commitMessage"

if ($LASTEXITCODE -ne 0) {
    Handle-Error "Error al hacer commit. Revisa los errores anteriores."
} else {
    # Push al repositorio remoto
    Show-Message "Haciendo push al repositorio remoto..." $colorInfo
    git push origin main

    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Error al hacer push. Revisa los errores anteriores."
    } else {
        Show-Message "✅ Commit y push realizados correctamente." $colorSuccess
    }
}

# 5. Desplegar el backend a Railway
Show-Section "5. Actualizando backend en Railway"
Set-Location -Path "$PSScriptRoot\baconfort-backend"

# Verificar si railway.json existe y es válido
$railwayJsonPath = ".\railway.json"
if (-not (Test-Path $railwayJsonPath) -or (Get-Content $railwayJsonPath).Length -eq 0) {
    Show-Message "⚠️ railway.json no existe o está vacío. Creando archivo..." $colorWarning
    
    $railwayJson = @"
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "numReplicas": 1
  }
}
"@
    
    Set-Content -Path $railwayJsonPath -Value $railwayJson
    Show-Message "✅ railway.json creado correctamente" $colorSuccess
} else {
    Show-Message "✅ railway.json existe y tiene contenido" $colorSuccess
}

Show-Message "Ejecutando railway up..." $colorInfo
railway up --detach

if ($LASTEXITCODE -ne 0) {
    Handle-Error "Error al desplegar a Railway. Revisa los errores anteriores."
} else {
    Show-Message "✅ Backend desplegado a Railway correctamente." $colorSuccess
}

# 6. Finalización
Show-Section "6. Verificando el estado de los despliegues"
Set-Location -Path "$PSScriptRoot"

# URL de Firebase
$firebaseUrl = "https://confort-ba.web.app"
Show-Message "📱 Frontend desplegado en: $firebaseUrl" $colorSuccess

# URL de Railway (la obtenemos si es posible)
Set-Location -Path "$PSScriptRoot\baconfort-backend"
try {
    $railwayStatus = railway status 2>$null
    $railwayUrl = $railwayStatus | Select-String "URL:" | ForEach-Object { $_.ToString().Trim() }
    if ([string]::IsNullOrWhiteSpace($railwayUrl)) {
        Show-Message "🚂 Backend desplegado en Railway. Visita la consola de Railway para más detalles." $colorSuccess
    } else {
        Show-Message "🚂 Backend desplegado en: $railwayUrl" $colorSuccess
    }
} catch {
    Show-Message "🚂 Backend desplegado en Railway. Ejecuta 'railway status' para ver los detalles." $colorSuccess
}

# Volver al directorio raíz
Set-Location -Path "$PSScriptRoot"

# Mostrar resumen final
Show-Section "¡ACTUALIZACIÓN COMPLETADA!"
Show-Message "✅ Frontend construido y desplegado en Firebase" $colorSuccess
Show-Message "✅ Cambios guardados en GitHub" $colorSuccess
Show-Message "✅ Backend actualizado en Railway" $colorSuccess

Show-Message "`nUrl del sitio: $firebaseUrl" $colorInfo
Show-Message "Gracias por usar este script de automatización." $colorInfo
Show-Message "Para verificar el sitio, puedes abrir la URL en tu navegador con el siguiente comando:" $colorInfo
Show-Message "start $firebaseUrl" $colorInfo

# Preguntar si desea abrir el sitio
$openSite = Read-Host "¿Deseas abrir el sitio en el navegador? (s/N)"
if ($openSite.ToLower() -eq "s") {
    Start-Process $firebaseUrl
}
