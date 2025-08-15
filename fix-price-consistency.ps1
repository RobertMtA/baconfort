#!/usr/bin/env pwsh
# fix-price-consistency.ps1
# Corrige inconsistencias de precios entre frontend y backend

Write-Host "🔧 CORRIGIENDO INCONSISTENCIAS DE PRECIOS" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host ""

# 1. Verificar precios en backend
Write-Host "1️⃣ Verificando precios del backend..." -ForegroundColor Cyan
Push-Location "baconfort-backend"

node -e "
const { calculatePriceByProperty } = require('./utils/priceCalculator');
console.log('✅ Precios backend para Ugarteche 2824:');
const result = calculatePriceByProperty('ugarteche-2824', '2025-08-17', '2025-08-30');
console.log('   - Noches:', result.nights);
console.log('   - Total:', 'USD', result.totalAmount);
console.log('   - Breakdown:', result.breakdown);
console.log('   - Precio semanal usado:', result.breakdown.weeklyPrice);
"

Pop-Location
Write-Host ""

# 2. Limpiar builds y cache del frontend
Write-Host "2️⃣ Limpiando cache del frontend..." -ForegroundColor Cyan
Push-Location "baconfort-react"

if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "   ✅ Eliminado directorio dist" -ForegroundColor Green
}

if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "   ✅ Eliminado cache de Vite" -ForegroundColor Green
}

Pop-Location
Write-Host ""

# 3. Rebuild del frontend con cache limpio
Write-Host "3️⃣ Reconstruyendo frontend..." -ForegroundColor Cyan
Push-Location "baconfort-react"

Write-Host "   🔨 Instalando dependencias..."
npm install --silent

Write-Host "   🔨 Build con cache limpio..."
npm run build

Pop-Location
Write-Host ""

# 4. Desplegar cambios
Write-Host "4️⃣ Desplegando cambios..." -ForegroundColor Cyan

Write-Host "   📦 Desplegando backend a Railway..."
Push-Location "baconfort-backend"
railway up --detach
Pop-Location

Write-Host "   🔥 Desplegando frontend a Firebase..."
Push-Location "baconfort-react"
firebase deploy --only hosting
Pop-Location

Write-Host ""
Write-Host "✅ CORRECCIÓN COMPLETADA" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Para verificar:" -ForegroundColor Yellow
Write-Host "   1. Abrir navegador en modo incógnito" -ForegroundColor White
Write-Host "   2. Ir a la página de Ugarteche 2824" -ForegroundColor White
Write-Host "   3. Verificar que muestre USD 400 por semana" -ForegroundColor White
Write-Host "   4. Calcular 13 noches = USD 670 total" -ForegroundColor White
Write-Host ""
