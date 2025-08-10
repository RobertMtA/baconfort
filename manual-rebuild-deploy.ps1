$ErrorActionPreference = "Stop"

Write-Host "🔄 Ejecutando reconstrucción y redespliegue manual..." -ForegroundColor Cyan

# Navegar al directorio de React
Push-Location -Path "C:\Users\rober\Desktop\baconfort5- copia\baconfort-react"

try {
    # Ejecutar build
    Write-Host "🔨 Ejecutando npm run build..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        throw "❌ Error en el proceso de build"
    }
    
    Write-Host "✅ Build completado exitosamente" -ForegroundColor Green
}
finally {
    Pop-Location
}

# Desplegar a Firebase
Write-Host "🚀 Desplegando a Firebase..." -ForegroundColor Yellow
Push-Location -Path "C:\Users\rober\Desktop\baconfort5- copia"

try {
    firebase deploy --only hosting
    
    if ($LASTEXITCODE -ne 0) {
        throw "❌ Error en el despliegue a Firebase"
    }
    
    Write-Host "✅ Despliegue completado exitosamente" -ForegroundColor Green
}
finally {
    Pop-Location
}

# Crear commit
Write-Host "📝 Realizando commit de los cambios..." -ForegroundColor Yellow

git add .
git commit -m "Fix: Corregidas importaciones de useAdmin en hooks"

# Push a GitHub
git push origin main

Write-Host "✅ Cambios subidos a GitHub" -ForegroundColor Green
Write-Host "✅ Proceso completado" -ForegroundColor Green
