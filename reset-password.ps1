# Script para resetear contraseña de usuario
$resetUrl = "http://localhost:5005/api/auth/reset-password-admin"

Write-Host "🔐 Reseteando contraseña para robertogaona1985@gmail.com..." -ForegroundColor Cyan

# Datos para resetear la contraseña
$resetData = @{
    email = "robertogaona1985@gmail.com"
    newPassword = "roberto123"
    adminAction = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $resetUrl -Method POST -Body $resetData -ContentType "application/json" -Headers @{Authorization="Bearer admin_static_20250812_17300_baconfort"}
    Write-Host "✅ Contraseña reseteada exitosamente!" -ForegroundColor Green
    Write-Host "Nueva contraseña: roberto123" -ForegroundColor Yellow
    
    # Probar login con nueva contraseña
    Write-Host "`n🔄 Probando login con nueva contraseña..." -ForegroundColor Cyan
    
    $loginData = @{
        email = "robertogaona1985@gmail.com"
        password = "roberto123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5005/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login exitoso!" -ForegroundColor Green
    Write-Host "Usuario: $($loginResponse.user.name)" -ForegroundColor Green
    Write-Host "Token: $($loginResponse.token.Substring(0,20))..." -ForegroundColor Yellow
    
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorDetails) {
        Write-Host "❌ Error: $($errorDetails.error)" -ForegroundColor Red
    } else {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`n⚠️  El endpoint de reset puede no existir. Vamos a intentar actualizar directamente..." -ForegroundColor Yellow
}
