# Script para redeploy después de las correcciones finales

Write-Host "🛠️ Iniciando proceso de despliegue con correcciones adicionales..." -ForegroundColor Cyan

# 1. Ir al directorio del proyecto React
Set-Location -Path .\baconfort-react

# 2. Construir la aplicación con Vite
Write-Host "📦 Construyendo la aplicación con npm run build..." -ForegroundColor Yellow
npm run build

# 3. Desplegar a Firebase
Write-Host "🚀 Desplegando a Firebase..." -ForegroundColor Green
firebase deploy --only hosting

# 4. Volver al directorio principal para hacer commit
Set-Location -Path ..

# 5. Hacer commit de los cambios
Write-Host "📝 Realizando commit de los cambios en GitHub..." -ForegroundColor Magenta
git add .
git commit -m "Fix: Corregida doble declaración de AdminContext y useAdmin"

# 6. Hacer push a GitHub
Write-Host "🔼 Subiendo cambios a GitHub..." -ForegroundColor Blue
git push origin main

Write-Host "✅ ¡Proceso completado! La aplicación ha sido corregida y desplegada correctamente." -ForegroundColor Green
