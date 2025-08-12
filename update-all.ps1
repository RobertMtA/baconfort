#!/bin/pwsh
# Script para actualizar Firebase, hacer commit en GitHub y actualizar Railway

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

# Construir el proyecto React
Write-ColoredMessage "Construyendo el proyecto React..." Cyan
npm run build

# Comprobar si la construcción fue exitosa
if ($LASTEXITCODE -ne 0) {
    Write-ColoredMessage "Error durante la construcción del proyecto React!" Red
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

# Hacer commit en Git
Write-ColoredMessage "Haciendo commit de los cambios en Git..." Cyan
cd $projectDir
git add .
git commit -m "Fix: Corregido problema con menú móvil en Header.jsx"

# Push a GitHub
Write-ColoredMessage "Subiendo cambios a GitHub..." Green
git push origin main

# Comprobar si el push fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-ColoredMessage "Error durante el push a GitHub! Resolviendo conflictos..." Red
    # Intentar arreglar posibles conflictos
    git pull
    git add .
    git commit -m "Fix: Corregido problema con menú móvil en Header.jsx (merge)"
    git push origin main
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColoredMessage "Error persistente durante el push a GitHub!" Red
        exit 1
    }
}

# Desplegar en Firebase
Write-ColoredMessage "Desplegando en Firebase..." Cyan
cd $projectDir
firebase deploy --only hosting

# Verificar si el despliegue de Firebase fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-ColoredMessage "Error durante el despliegue en Firebase!" Red
    exit 1
}

# Ejecutar el script de despliegue de Railway
Write-ColoredMessage "Ejecutando despliegue en Railway..." Cyan
cd $projectDir
./deploy-to-railway.ps1

# Finalización
Write-ColoredMessage "🎉 Proceso completado exitosamente!" Green
Write-ColoredMessage "✅ Cambios en GitHub actualizados" Green
Write-ColoredMessage "✅ Firebase actualizado" Green
Write-ColoredMessage "✅ Railway actualizado" Green
