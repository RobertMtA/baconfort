# Script para desplegar los cambios de autenticación de admin
Write-Host "🔒 Actualizando administración de tokens y permisos de administrador..." -ForegroundColor Yellow

# Primero verificamos si hay cambios en el repo
Set-Location -Path "c:\Users\rober\Desktop\baconfort5- copia\"
$hasChanges = git status --porcelain

if ($hasChanges) {
    Write-Host "📦 Hay cambios en el repositorio, haciendo commit..." -ForegroundColor Cyan
    git add .
    git commit -m "fix: Mejorar manejo de tokens de administrador y permisos"
}

# Desplegar frontend
Write-Host "🚀 Desplegando frontend..." -ForegroundColor Green
Set-Location -Path "c:\Users\rober\Desktop\baconfort5- copia\baconfort-react"

# Hacer build del frontend
Write-Host "🏗️ Construyendo aplicación React..." -ForegroundColor Cyan
npm run build

# Desplegar a Firebase
Write-Host "🔥 Desplegando a Firebase..." -ForegroundColor Magenta
firebase deploy --only hosting

# Volver al directorio principal
Set-Location -Path "c:\Users\rober\Desktop\baconfort5- copia\"

Write-Host "✅ Despliegue completo." -ForegroundColor Green
Write-Host "La solución para mejorar el manejo de tokens de administrador ha sido implementada." -ForegroundColor Green
Write-Host "Aspectos mejorados:" -ForegroundColor Cyan
Write-Host "  1. Mejor verificación de tokens administrativos" -ForegroundColor White
Write-Host "  2. Almacenamiento seguro de tokens verificados" -ForegroundColor White
Write-Host "  3. Uso de tokens verificados para operaciones administrativas" -ForegroundColor White
Write-Host "  4. Headers adicionales para mejorar la seguridad de las peticiones" -ForegroundColor White
Write-Host "  5. Persistencia de la información de administración" -ForegroundColor White

Write-Host "`n🔍 Para verificar, accede al panel de administración." -ForegroundColor Yellow
