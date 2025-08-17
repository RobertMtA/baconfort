#!/usr/bin/env pwsh

Write-Host "🗃️ Configuración rápida de MongoDB Atlas..." -ForegroundColor Cyan
Write-Host ""

Write-Host "OPCIÓN 1 - MongoDB Atlas Gratuito (RECOMENDADO):" -ForegroundColor Green
Write-Host ""
Write-Host "1. Ve a: https://cloud.mongodb.com/" -ForegroundColor White
Write-Host "2. Haz clic en 'Try Free' o 'Sign Up'" -ForegroundColor White
Write-Host "3. Crea una cuenta con tu email" -ForegroundColor White
Write-Host "4. Selecciona 'M0 Sandbox' (GRATIS - 512MB)" -ForegroundColor Yellow
Write-Host "5. Elige 'AWS' como proveedor" -ForegroundColor White
Write-Host "6. Selecciona una región cercana (ej: Virginia)" -ForegroundColor White
Write-Host "7. Nombra tu cluster 'baconfort'" -ForegroundColor White
Write-Host "8. Haz clic en 'Create Deployment'" -ForegroundColor White
Write-Host ""

Write-Host "DESPUÉS DE CREAR EL CLUSTER:" -ForegroundColor Cyan
Write-Host ""
Write-Host "9. En 'Security > Database Access':" -ForegroundColor White
Write-Host "   - Haz clic 'Add New Database User'" -ForegroundColor Gray
Write-Host "   - Usuario: baconfort" -ForegroundColor Gray
Write-Host "   - Contraseña: (genera una segura)" -ForegroundColor Gray
Write-Host "   - Rol: 'Read and write to any database'" -ForegroundColor Gray
Write-Host ""

Write-Host "10. En 'Security > Network Access':" -ForegroundColor White
Write-Host "    - Haz clic 'Add IP Address'" -ForegroundColor Gray
Write-Host "    - Selecciona 'Allow access from anywhere' (0.0.0.0/0)" -ForegroundColor Gray
Write-Host "    - Esto es necesario para Railway" -ForegroundColor Yellow
Write-Host ""

Write-Host "11. En 'Deployment > Database':" -ForegroundColor White
Write-Host "    - Haz clic en 'Connect' en tu cluster" -ForegroundColor Gray
Write-Host "    - Selecciona 'Connect your application'" -ForegroundColor Gray
Write-Host "    - Copia la connection string" -ForegroundColor Gray
Write-Host ""

Write-Host "12. La connection string se ve así:" -ForegroundColor White
Write-Host "    mongodb+srv://baconfort:<password>@baconfort.xxxxx.mongodb.net/?retryWrites=true&w=majority" -ForegroundColor Yellow
Write-Host ""

Write-Host "13. Reemplaza <password> con tu contraseña real" -ForegroundColor White
Write-Host "14. Agrega /baconfort al final antes de los parámetros:" -ForegroundColor White
Write-Host "    mongodb+srv://baconfort:tupassword@baconfort.xxxxx.mongodb.net/baconfort?retryWrites=true&w=majority" -ForegroundColor Green
Write-Host ""

Write-Host "✋ CUANDO TENGAS LA CONNECTION STRING COMPLETA:" -ForegroundColor Red
Write-Host "Ejecuta: railway variables --set `"MONGODB_URI=tu-connection-string-completa`"" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 LUEGO REDESPLIEGA:" -ForegroundColor Green
Write-Host ".\deploy-to-railway.ps1" -ForegroundColor Cyan
