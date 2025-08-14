Param(
    [string]$url = "localhost:5005"
)

# Crear un archivo BAT temporal para ejecutar las pruebas
$tempFile = [System.IO.Path]::GetTempFileName() -replace "\.tmp$", ".bat"

@"
@echo off
echo ==============================================
echo Verificando tokens de autenticacion
echo ==============================================
echo.
echo === Probando token estatico ===
curl -H "Authorization: Bearer admin_static_20250812_17300_baconfort" "http://$url/api/auth/verify-token"
echo.
echo.
echo === Probando token de emergencia ===
curl -H "Authorization: Bearer ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS" -H "X-Admin-Emergency-Token: ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS" "http://$url/api/auth/verify-token?emergency=true&bypass=true"
echo.
echo.
echo === Probando acceso a inquiries con token de emergencia ===
curl -H "Authorization: Bearer ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS" -H "X-Admin-Emergency-Token: ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS" "http://$url/api/inquiries/admin/all?emergency=true&bypass=true&token=ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS"
echo.
echo.
echo === Probando acceso a reviews con token de emergencia ===
curl -H "Authorization: Bearer ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS" -H "X-Admin-Emergency-Token: ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS" "http://$url/api/reviews/admin?emergency=true&bypass=true&token=ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS"
echo.
echo ==============================================
echo Pruebas completas
echo ==============================================
pause
"@ | Out-File -FilePath $tempFile -Encoding ascii

# Ejecutar el archivo BAT
Write-Host "Ejecutando pruebas de token desde: $tempFile" -ForegroundColor Cyan
Start-Process -FilePath $tempFile -Wait -NoNewWindow

# Limpieza
Remove-Item -Path $tempFile -Force
