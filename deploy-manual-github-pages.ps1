#!/usr/bin/env pwsh
# Script para deploy directo a GitHub Pages sin GitHub Actions

Write-Host "🚀 DEPLOY DIRECTO A GITHUB PAGES" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Verificar si estamos en el directorio correcto
if (!(Test-Path "baconfort-react\package.json")) {
    Write-Host "❌ Error: No se encuentra baconfort-react/package.json" -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 1. Instalando dependencias..." -ForegroundColor Yellow
Set-Location baconfort-react
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
    exit 1
}

Write-Host "`n🏗️ 2. Construyendo el proyecto..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Build completado exitosamente!" -ForegroundColor Green
Write-Host "📁 Archivos generados en dist/:" -ForegroundColor Cyan
Get-ChildItem dist\ | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }

Set-Location ..

Write-Host "`n🌐 3. Desplegando a GitHub Pages..." -ForegroundColor Yellow

# Verificar si gh-pages branch existe
git branch -r | Select-String "gh-pages" | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Creando branch gh-pages..." -ForegroundColor Yellow
    git checkout --orphan gh-pages
    git rm -rf .
    git commit --allow-empty -m "Initial gh-pages commit"
    git push origin gh-pages
    git checkout main
}

# Deploy usando git subtree
Write-Host "🚀 Desplegando archivos..." -ForegroundColor Yellow
git subtree push --prefix baconfort-react/dist origin gh-pages

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 ¡Deploy completado exitosamente!" -ForegroundColor Green
    Write-Host "🌐 Tu sitio estará disponible en: https://robertmta.github.io/baconfort/" -ForegroundColor Cyan
    Write-Host "⏰ Puede tardar unos minutos en estar disponible" -ForegroundColor Yellow
} else {
    Write-Host "❌ Error en el deploy" -ForegroundColor Red
    exit 1
}
