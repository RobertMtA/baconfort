# Test simple de unsubscribe
Write-Host "Probando endpoint de unsubscribe..." -ForegroundColor Cyan

$testEmail = "robertogaona1985%40gmail.com"

Write-Host "Email codificado a probar: $testEmail" -ForegroundColor Yellow

# Probar GET
Write-Host "`nProbando GET unsubscribe..." -ForegroundColor Yellow

try {
    $getResponse = Invoke-WebRequest -Uri "http://localhost:5005/api/subscribers/unsubscribe/$testEmail" -Method GET
    Write-Host "✅ GET exitoso - Status: $($getResponse.StatusCode)" -ForegroundColor Green
    
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "⚠️ GET retorna 404 - Endpoint no encontrado o usuario no existe" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error en GET: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== RESUMEN ===" -ForegroundColor Cyan
Write-Host "✅ Problema de formulario RESUELTO:" -ForegroundColor Green
Write-Host "   - Agregado id='profileVisibility' al select" -ForegroundColor White
Write-Host "   - Agregado name='profileVisibility' al select" -ForegroundColor White
Write-Host "   - Agregado values apropiados a las opciones" -ForegroundColor White

Write-Host "`n⚠️ Error 500 en Railway:" -ForegroundColor Yellow
Write-Host "   - Puede ser problema de conexión a MongoDB" -ForegroundColor White
Write-Host "   - O configuración de variables de entorno" -ForegroundColor White
Write-Host "   - Los logs del backend local pueden dar más info" -ForegroundColor White
