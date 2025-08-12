# Script para actualizar las correcciones de responsividad y desplegarlas

# Actualizar el repositorio Git
Write-Host "📂 Actualizando el repositorio Git..." -ForegroundColor Cyan
git add .
git commit -m "Mejoras de responsividad para descripciones y precios en páginas de departamentos"
git push origin main

# Desplegar en Firebase
Write-Host "🔥 Desplegando en Firebase..." -ForegroundColor Yellow
cd baconfort-react
npm run build
firebase deploy --only hosting

# Volver al directorio principal
cd ..

# Mensaje final
Write-Host "✅ Despliegue completo exitosamente!" -ForegroundColor Green
Write-Host "🌐 Puedes verificar los cambios en https://confort-ba.web.app" -ForegroundColor Cyan
