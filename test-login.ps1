# Script para probar login
$loginUrl = "http://localhost:5005/api/auth/login"

$loginData = @{
    email = "robertogaona1985@gmail.com"
    password = "123456"  # Contraseña común
} | ConvertTo-Json

Write-Host "🔐 Probando login para robertogaona1985@gmail.com..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $loginUrl -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login exitoso!" -ForegroundColor Green
    Write-Host "Usuario: $($response.user.name)" -ForegroundColor Green
    Write-Host "Token recibido: $($response.token.Substring(0,20))..." -ForegroundColor Yellow
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorDetails) {
        Write-Host "❌ Error de login: $($errorDetails.error)" -ForegroundColor Red
    } else {
        Write-Host "❌ Error de login: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Probar con otra contraseña común
    Write-Host "`n🔄 Probando con contraseña alternativa..." -ForegroundColor Yellow
    
    $loginData2 = @{
        email = "robertogaona1985@gmail.com"
        password = "password"
    } | ConvertTo-Json
    
    try {
        $response2 = Invoke-RestMethod -Uri $loginUrl -Method POST -Body $loginData2 -ContentType "application/json"
        Write-Host "✅ Login exitoso con contraseña alternativa!" -ForegroundColor Green
        Write-Host "Usuario: $($response2.user.name)" -ForegroundColor Green
    } catch {
        $errorDetails2 = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorDetails2) {
            Write-Host "❌ Error con contraseña alternativa: $($errorDetails2.error)" -ForegroundColor Red
        } else {
            Write-Host "❌ Error con contraseña alternativa: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}
