# Script para redeploy después de las correcciones

Write-Host "🛠️ Iniciando proceso completo de corrección y despliegue..." -ForegroundColor Cyan

# 1. Actualizar el archivo AdminContext-FIXED.jsx con todas las funciones necesarias
Write-Host "Paso 1: Actualizando AdminContext-FIXED.jsx con todas las funciones necesarias..." -ForegroundColor Yellow
.\update-admin-context.ps1

# 2. Actualizar todas las importaciones para usar AdminContext-FIXED
Write-Host "Paso 2: Actualizando importaciones en los componentes..." -ForegroundColor Yellow
.\update-imports.ps1

# 3. Ir al directorio del proyecto React
Set-Location -Path .\baconfort-react

# 4. Construir la aplicación con Vite
Write-Host "Paso 3: Construyendo la aplicación con npm run build..." -ForegroundColor Yellow
npm run build

# 5. Desplegar a Firebase
Write-Host "Paso 4: Desplegando a Firebase..." -ForegroundColor Green
firebase deploy --only hosting

# 6. Volver al directorio principal para hacer commit
Set-Location -Path ..

# 7. Hacer commit de los cambios
Write-Host "Paso 5: Realizando commit de los cambios en GitHub..." -ForegroundColor Magenta
git add .
git commit -m "Fix: Corregido error 'useAdmin must be used within an AdminProvider' unificando uso de AdminContext"

# 8. Hacer push a GitHub
Write-Host "Paso 6: Subiendo cambios a GitHub..." -ForegroundColor Blue
git push origin main

Write-Host "✅ ¡Proceso completado! La aplicación ha sido corregida y desplegada correctamente." -ForegroundColor Green
