#!/usr/bin/env pwsh
# Deploy directo a GitHub Pages usando npm gh-pages

Write-Host "🚀 DEPLOY DIRECTO CON GH-PAGES" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Navegar al directorio de React
Set-Location baconfort-react

# Verificar si gh-pages está instalado
Write-Host "`n📦 Verificando gh-pages..." -ForegroundColor Yellow
if (!(Get-Command "npx" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ NPX no está disponible" -ForegroundColor Red
    exit 1
}

# Build del proyecto
Write-Host "`n🏗️ Construyendo proyecto..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}

# Deploy con gh-pages
Write-Host "`n🌐 Desplegando a GitHub Pages..." -ForegroundColor Yellow
npx gh-pages -d dist -b gh-pages

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 ¡Deploy completado exitosamente!" -ForegroundColor Green
    Write-Host "🌐 Tu sitio estará disponible en: https://robertmta.github.io/baconfort/" -ForegroundColor Cyan
    Write-Host "⏰ Puede tardar unos minutos en estar disponible" -ForegroundColor Yellow
} else {
    Write-Host "❌ Error en el deploy" -ForegroundColor Red
}

Set-Location ..
