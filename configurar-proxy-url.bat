@echo off
REM Este script actualiza la URL de la API en el archivo .env.development
REM para usar el proxy de autenticación local

echo.
echo ===================================================
echo    CONFIGURAR FRONTEND PARA USAR PROXY LOCAL
echo ===================================================
echo.

echo Modificando archivo de configuración...

powershell -Command "(Get-Content baconfort-react\.env.development) -replace 'http://localhost:5004/api', 'http://localhost:5005/api' | Set-Content baconfort-react\.env.development"

echo.
echo ✅ Configuración actualizada correctamente.
echo.
echo La URL de la API ahora apunta a: http://localhost:5005/api
echo.
echo IMPORTANTE: Para revertir este cambio, ejecuta "restaurar-api-url.bat"
echo.
pause
