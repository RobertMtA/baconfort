# Script para verificar la autenticación del token
Write-Host "🔍 Verificando token de autenticación..." -ForegroundColor Cyan

# Tokens a probar
$token1 = "admin_static_20250812_17300_baconfort"
$token2 = "ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS"

# Realizar peticiones con curl para verificar
Write-Host "🔄 Probando token estático: $token1" -ForegroundColor Yellow
Write-Host "-------------------------------------"
curl -H "Authorization: Bearer $token1" "http://localhost:5005/api/auth/verify-token" -v

Write-Host "`n"
Write-Host "🔄 Probando token de emergencia: $token2" -ForegroundColor Yellow
Write-Host "-------------------------------------"
curl -H "Authorization: Bearer $token2" -H "X-Admin-Emergency-Token: $token2" 'http://localhost:5005/api/auth/verify-token?emergency=true&bypass=true' -v

Write-Host "`n"
Write-Host "🔄 Probando acceso a inquiries con token de emergencia" -ForegroundColor Yellow
Write-Host "-------------------------------------"
curl -H "Authorization: Bearer $token2" -H "X-Admin-Emergency-Token: $token2" 'http://localhost:5005/api/inquiries/admin/all?emergency=true&bypass=true&token=ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS' -v

Write-Host "`n"
Write-Host "🔄 Probando acceso a reviews con token de emergencia" -ForegroundColor Yellow
Write-Host "-------------------------------------"
curl -H "Authorization: Bearer $token2" -H "X-Admin-Emergency-Token: $token2" 'http://localhost:5005/api/reviews/admin?emergency=true&bypass=true&token=ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS' -v
