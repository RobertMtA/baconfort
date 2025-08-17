#!/usr/bin/env pwsh

# Script para configurar MongoDB en Railway

Write-Host "🗃️ Configurando MongoDB para Railway..." -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Pasos para configurar MongoDB:" -ForegroundColor Yellow
Write-Host "1. Ve a tu proyecto en Railway: https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. En tu servicio backend, ve a 'Variables'" -ForegroundColor White
Write-Host "3. Haz clic en '+ New Variable'" -ForegroundColor White
Write-Host "4. Agrega la variable MONGODB_URI" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Opciones para MongoDB:" -ForegroundColor Green
Write-Host ""

Write-Host "📦 OPCIÓN 1 - MongoDB Atlas (Recomendado):" -ForegroundColor Cyan
Write-Host "  1. Ve a https://cloud.mongodb.com/" -ForegroundColor Gray
Write-Host "  2. Crea una cuenta gratuita" -ForegroundColor Gray
Write-Host "  3. Crea un nuevo cluster (gratis M0)" -ForegroundColor Gray
Write-Host "  4. Crea un usuario de base de datos" -ForegroundColor Gray
Write-Host "  5. Agrega 0.0.0.0/0 a Network Access (para Railway)" -ForegroundColor Gray
Write-Host "  6. Copia la connection string" -ForegroundColor Gray
Write-Host "  7. Ejemplo: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/baconfort" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚂 OPCIÓN 2 - MongoDB en Railway:" -ForegroundColor Cyan
Write-Host "  1. En tu proyecto Railway, haz clic en '+ New Service'" -ForegroundColor Gray
Write-Host "  2. Selecciona 'Database > MongoDB'" -ForegroundColor Gray
Write-Host "  3. Railway creará automáticamente las variables de conexión" -ForegroundColor Gray
Write-Host "  4. Conecta el servicio MongoDB a tu backend" -ForegroundColor Gray
Write-Host ""

Write-Host "🔗 OPCIÓN 3 - Usar variable de Railway:" -ForegroundColor Cyan
Write-Host "  En Variables de tu servicio backend, agrega:" -ForegroundColor Gray
Write-Host "  MONGODB_URI=mongodb+srv://tu-usuario:tu-password@tu-cluster.mongodb.net/baconfort" -ForegroundColor Yellow
Write-Host ""

Write-Host "💡 RECOMENDACIÓN:" -ForegroundColor Green
Write-Host "Usa MongoDB Atlas (Opción 1) - es gratuito hasta 512MB y muy confiable" -ForegroundColor White

Write-Host ""
Write-Host "🧪 Para probar la conexión después:" -ForegroundColor Cyan
Write-Host "Ejecuta: .\test-mongodb-connection.ps1" -ForegroundColor White
