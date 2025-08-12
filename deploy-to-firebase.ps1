#!/bin/pwsh
# Script para construir el proyecto React y desplegarlo en Firebase

# Mensajes coloridos para mejor visibilidad
function Write-ColoredMessage($message, $color) {
    Write-Host $message -ForegroundColor $color
}

# Directorio del proyecto
$projectDir = "c:\Users\rober\Desktop\baconfort5- copia"
$reactDir = "$projectDir\baconfort-react"

# Ir al directorio del proyecto React
Write-ColoredMessage "Cambiando al directorio de React: $reactDir" Yellow
cd $reactDir

# Instalar dependencias si es necesario
if (!(Test-Path "node_modules")) {
    Write-ColoredMessage "Instalando dependencias..." Yellow
    npm install
}

# Construir el proyecto
Write-ColoredMessage "Construyendo el proyecto..." Cyan
npm run build

# Comprobar si la construcción fue exitosa
if ($LASTEXITCODE -ne 0) {
    Write-ColoredMessage "Error durante la construcción del proyecto!" Red
    exit 1
}

# Copiar archivos a la carpeta build de Firebase
Write-ColoredMessage "Copiando archivos a la carpeta build de Firebase..." Green
$firebaseBuildDir = "$projectDir\build"
if (Test-Path $firebaseBuildDir) {
    Write-ColoredMessage "Limpiando carpeta de build anterior..." Yellow
    Remove-Item -Path "$firebaseBuildDir\*" -Recurse -Force
}
else {
    New-Item -Path $firebaseBuildDir -ItemType Directory -Force
}

# Copiar archivos de build de React a carpeta de Firebase
Copy-Item -Path "$reactDir\build\*" -Destination $firebaseBuildDir -Recurse -Force

# Desplegar en Firebase
Write-ColoredMessage "Desplegando en Firebase..." Cyan
cd $projectDir
firebase deploy --only hosting

# Verificar si el despliegue fue exitoso
if ($LASTEXITCODE -eq 0) {
    Write-ColoredMessage "¡Despliegue en Firebase completado exitosamente!" Green
}
else {
    Write-ColoredMessage "Error durante el despliegue en Firebase!" Red
    exit 1
}

Write-ColoredMessage "Proceso completado. La aplicación está ahora disponible en Firebase." Green
