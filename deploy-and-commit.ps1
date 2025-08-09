# Script para desplegar la aplicación en Firebase y hacer commit en GitHub

Write-Host "🛠️ Iniciando proceso de despliegue y commit..." -ForegroundColor Cyan

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
git commit -m "Fix: Corregido error de duplicación de función logout en AdminContext-STATEFUL"

# 6. Hacer push a GitHub
Write-Host "🔼 Subiendo cambios a GitHub..." -ForegroundColor Blue
git push origin main

Write-Host "✅ ¡Proceso completado! La aplicación ha sido desplegada y los cambios han sido guardados en GitHub." -ForegroundColor Green
