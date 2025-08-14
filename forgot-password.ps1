# Script para recuperar contraseña usando forgot-password
$forgotUrl = "http://localhost:5005/api/auth/forgot-password"

Write-Host "📧 Iniciando recuperación de contraseña para robertogaona1985@gmail.com..." -ForegroundColor Cyan

# Solicitar reseteo de contraseña
$forgotData = @{
    email = "robertogaona1985@gmail.com"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $forgotUrl -Method POST -Body $forgotData -ContentType "application/json"
    Write-Host "✅ Solicitud de recuperación enviada!" -ForegroundColor Green
    Write-Host "Respuesta: $($response | ConvertTo-Json)" -ForegroundColor Yellow
    
    if ($response.success) {
        Write-Host "`n📝 Si hay un resetToken en la respuesta, podrás usarlo para cambiar la contraseña" -ForegroundColor Cyan
        if ($response.resetToken) {
            Write-Host "🔑 Reset Token: $($response.resetToken)" -ForegroundColor Yellow
            
            # Si tenemos el token, intentar resetear la contraseña inmediatamente
            Write-Host "`n🔄 Intentando resetear contraseña con el token..." -ForegroundColor Cyan
            
            $resetData = @{
                token = $response.resetToken
                newPassword = "roberto123"
            } | ConvertTo-Json
            
            try {
                $resetResponse = Invoke-RestMethod -Uri "http://localhost:5005/api/auth/reset-password" -Method POST -Body $resetData -ContentType "application/json"
                Write-Host "✅ Contraseña cambiada exitosamente!" -ForegroundColor Green
                Write-Host "Nueva contraseña: roberto123" -ForegroundColor Yellow
                
                # Probar login
                Write-Host "`n🔐 Probando login con nueva contraseña..." -ForegroundColor Cyan
                $loginData = @{
                    email = "robertogaona1985@gmail.com"
                    password = "roberto123"
                } | ConvertTo-Json
                
                $loginResponse = Invoke-RestMethod -Uri "http://localhost:5005/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
                Write-Host "✅ Login exitoso!" -ForegroundColor Green
                Write-Host "Usuario: $($loginResponse.user.name)" -ForegroundColor Green
                
            } catch {
                Write-Host "❌ Error al resetear: $($_.ErrorDetails.Message)" -ForegroundColor Red
            }
        }
    }
    
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorDetails) {
        Write-Host "❌ Error: $($errorDetails.error)" -ForegroundColor Red
    } else {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
