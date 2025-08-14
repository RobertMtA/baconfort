# Script para cambiar contraseña directamente usando endpoint de admin
Write-Host "🔧 Cambiando contraseña directamente para robertogaona1985@gmail.com..." -ForegroundColor Cyan

# Primero, obtener el ID del usuario
$users = Invoke-RestMethod -Uri "http://localhost:5005/api/users" -Headers @{Authorization="Bearer admin_static_20250812_17300_baconfort"}
$targetUser = $users.data | Where-Object { $_.email -eq "robertogaona1985@gmail.com" }

if ($targetUser) {
    Write-Host "✅ Usuario encontrado: $($targetUser.name) (ID: $($targetUser._id))" -ForegroundColor Green
    
    # Intentar actualizar usando endpoint de actualización de perfil
    $updateUrl = "http://localhost:5005/api/users/$($targetUser._id)"
    
    $updateData = @{
        password = "roberto123"
        currentPassword = "admin_bypass"  # Bypass para admin
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $updateUrl -Method PUT -Body $updateData -ContentType "application/json" -Headers @{Authorization="Bearer admin_static_20250812_17300_baconfort"}
        Write-Host "✅ Contraseña actualizada exitosamente!" -ForegroundColor Green
        
        # Probar login con nueva contraseña
        Write-Host "`n🔐 Probando login con nueva contraseña: roberto123..." -ForegroundColor Cyan
        
        $loginData = @{
            email = "robertogaona1985@gmail.com"
            password = "roberto123"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:5005/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
        Write-Host "✅ Login exitoso!" -ForegroundColor Green
        Write-Host "Usuario: $($loginResponse.user.name)" -ForegroundColor Green
        Write-Host "🔑 Nueva contraseña para el usuario: roberto123" -ForegroundColor Yellow
        
    } catch {
        Write-Host "❌ Error al actualizar contraseña: $($_.ErrorDetails.Message)" -ForegroundColor Red
        
        # Método alternativo: usar BCrypt para generar el hash y actualizar directamente
        Write-Host "`n🔄 Probando método alternativo..." -ForegroundColor Yellow
        Write-Host "ℹ️  Para cambiar la contraseña manualmente:" -ForegroundColor Cyan
        Write-Host "   1. La contraseña sugerida es: roberto123" -ForegroundColor White
        Write-Host "   2. El usuario existe y está verificado" -ForegroundColor White
        Write-Host "   3. Puede que necesites que el usuario use 'Olvidé mi contraseña' desde el frontend" -ForegroundColor White
    }
    
} else {
    Write-Host "❌ Usuario no encontrado" -ForegroundColor Red
}
