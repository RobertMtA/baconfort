# Test de forgot password
Write-Host "🔐 Probando forgot-password para robertogaona1985@gmail.com..." -ForegroundColor Cyan

$forgotData = @{
    email = "robertogaona1985@gmail.com"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5005/api/auth/forgot-password" -Method POST -Body $forgotData -ContentType "application/json"
    Write-Host "✅ Solicitud enviada exitosamente!" -ForegroundColor Green
    Write-Host "Respuesta:" -ForegroundColor Yellow
    $response | ConvertTo-Json
    
    if ($response.resetToken) {
        Write-Host "`n🔑 Token de reset disponible: $($response.resetToken)" -ForegroundColor Yellow
        Write-Host "Ahora puedes resetear la contraseña usando este token" -ForegroundColor Cyan
    }
    
} catch {
    $errorResponse = $_.ErrorDetails.Message
    Write-Host "❌ Error en forgot-password:" -ForegroundColor Red
    Write-Host $errorResponse -ForegroundColor Red
    
    if ($errorResponse -like "*500*" -or $errorResponse -like "*Error procesando*") {
        Write-Host "`n💡 El error 500 sugiere un problema con el envío de email." -ForegroundColor Yellow
        Write-Host "Esto es normal si no está configurado el servicio de email." -ForegroundColor Yellow
        Write-Host "El usuario puede usar directamente las credenciales de admin." -ForegroundColor Yellow
    }
}
