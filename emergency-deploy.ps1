# Script para desplegar la aplicación con cambios de emergencia

Write-Host "🛠️ Construyendo la aplicación con los cambios de emergencia..." -ForegroundColor Cyan
Set-Location -Path .\baconfort-react

# Construir la aplicación con Vite
Write-Host "📦 Ejecutando npm run build..." -ForegroundColor Yellow
npm run build

# Desplegar la aplicación a Firebase
Write-Host "🚀 Desplegando a Firebase..." -ForegroundColor Green
firebase deploy --only hosting

Write-Host "✅ Despliegue completado!" -ForegroundColor Magenta
Set-Location -Path ..
