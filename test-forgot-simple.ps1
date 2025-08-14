# Test de forgot password
Write-Host "🔐 Probando forgot-password para robertogaona1985@gmail.com..." -ForegroundColor Cyan

$forgotData = @{
    email = "robertogaona1985@gmail.com"
}

$jsonBody = $forgotData | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5005/api/auth/forgot-password" -Method POST -Body $jsonBody -ContentType "application/json"
    
    Write-Host "✅ Solicitud enviada exitosamente!" -ForegroundColor Green
    Write-Host "Respuesta:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
    
    Write-Host "`n✨ Forgot-password funcionando correctamente!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error en forgot-password:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Message -like "*500*") {
        Write-Host "`n💡 El error 500 es normal si no hay configuración de email." -ForegroundColor Yellow
        Write-Host "Puedes usar las credenciales de admin como alternativa." -ForegroundColor Yellow
    }
}
