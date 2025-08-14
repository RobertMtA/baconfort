# Test de login de admin
Write-Host "Probando login de admin..." -ForegroundColor Cyan

$loginData = @{
    email = "baconfort.centro@gmail.com"
    password = "roccosa226"
}

$jsonBody = $loginData | ConvertTo-Json

Write-Host "Enviando solicitud a: http://localhost:5005/api/auth/login" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5005/api/auth/login" -Method POST -Body $jsonBody -ContentType "application/json"
    
    Write-Host "EXITO: Login de admin funcionando!" -ForegroundColor Green
    Write-Host "Token recibido: $($response.token.Substring(0,20))..." -ForegroundColor Yellow
    Write-Host "Usuario: $($response.user.email)" -ForegroundColor White
    Write-Host "Rol: $($response.user.role)" -ForegroundColor White
    
} catch {
    Write-Host "ERROR en login de admin:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
