@echo off
REM Este script restaura la URL original de la API en el archivo .env.development

echo.
echo ===================================================
echo    RESTAURAR URL ORIGINAL DE LA API
echo ===================================================
echo.

echo Restaurando archivo de configuración...

powershell -Command "(Get-Content baconfort-react\.env.development) -replace 'http://localhost:5005/api', 'http://localhost:5004/api' | Set-Content baconfort-react\.env.development"

echo.
echo ✅ Configuración restaurada correctamente.
echo.
echo La URL de la API ahora apunta a: http://localhost:5004/api
echo.
pause
