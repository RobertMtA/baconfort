# Test de endpoint unsubscribe
Write-Host "Probando endpoint de unsubscribe..." -ForegroundColor Cyan

$testEmail = "robertogaona1985@gmail.com"
$encodedEmail = [System.Web.HttpUtility]::UrlEncode($testEmail)

Write-Host "Email a probar: $testEmail" -ForegroundColor Yellow
Write-Host "Email codificado: $encodedEmail" -ForegroundColor Yellow

# Probar GET (página de unsubscribe)
Write-Host "`nProbando GET /api/subscribers/unsubscribe/$encodedEmail" -ForegroundColor Yellow

try {
    $getResponse = Invoke-WebRequest -Uri "http://localhost:5005/api/subscribers/unsubscribe/$encodedEmail" -Method GET
    Write-Host "✅ GET exitoso - Status: $($getResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Contenido contiene formulario: $($getResponse.Content -like '*form*')" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error en GET: $($_.Exception.Message)" -ForegroundColor Red
}

# Esperar un poco
Start-Sleep -Seconds 2

# Probar POST (procesamiento de unsubscribe)
Write-Host "`nProbando POST /api/subscribers/unsubscribe/$encodedEmail" -ForegroundColor Yellow

try {
    $postResponse = Invoke-WebRequest -Uri "http://localhost:5005/api/subscribers/unsubscribe/$encodedEmail" -Method POST
    Write-Host "✅ POST exitoso - Status: $($postResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Contenido contiene confirmación: $($postResponse.Content -like '*confirmada*')" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error en POST: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Es posible que el usuario no esté suscrito o ya esté dado de baja" -ForegroundColor Yellow
}

Write-Host "`n=== NOTAS ===" -ForegroundColor Cyan
Write-Host "- El endpoint funciona en local si no hay errores de conexión" -ForegroundColor White
Write-Host "- El error 500 en Railway puede ser por:" -ForegroundColor White
Write-Host "  * Problema de conexión a la base de datos" -ForegroundColor White
Write-Host "  * Usuario ya dado de baja" -ForegroundColor White
Write-Host "  * Problema de configuración en Railway" -ForegroundColor White

Write-Host "`n=== PROBLEMA DE FORMULARIO RESUELTO ===" -ForegroundColor Green
Write-Host "✅ Agregado id y name al select de visibilidad del perfil" -ForegroundColor White
