# Script para actualizar los cambios y desplegarlos

# Actualizar el repositorio Git
Write-Host "📂 Actualizando el repositorio Git..." -ForegroundColor Cyan
git add .
git commit -m "Corregida la alineación del menú en las páginas de departamentos"
git push origin main

# Desplegar en Firebase
Write-Host "🔥 Desplegando en Firebase..." -ForegroundColor Yellow
cd baconfort-react
npm run build
firebase deploy --only hosting

# Volver al directorio principal
cd ..

# Desplegar en Railway 
Write-Host "🚂 Desplegando en Railway..." -ForegroundColor Green
cd baconfort-api-server
railway up

# Mensaje final
Write-Host "✅ Despliegue completo exitosamente!" -ForegroundColor Green
