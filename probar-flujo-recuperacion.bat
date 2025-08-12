@echo off
echo ===============================================
echo   Prueba Completa: Recuperación de Contraseña
echo ===============================================
echo.

echo Esta herramienta facilita la prueba del sistema de recuperación de contraseña.
echo.

set /p EMAIL="Ingresa el email para probar la recuperación: "
if "%EMAIL%"=="" (
    echo ERROR: Debes ingresar un email válido.
    goto :fin
)

echo.
echo [1/4] Verificando si el servidor backend está en ejecución...
curl -s http://localhost:5004/api/health >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ El servidor backend no está respondiendo en http://localhost:5004
    echo Iniciando el servidor backend automáticamente...
    start cmd /c "cd /d "%~dp0baconfort-backend" && npm start"
    timeout /t 10 /nobreak >nul
) else (
    echo ✅ Servidor backend detectado en http://localhost:5004
)

echo.
echo [2/4] Verificando si el frontend está en ejecución...
curl -s http://localhost:3001 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ El frontend no está respondiendo en http://localhost:3001
    echo Iniciando el frontend automáticamente...
    start cmd /c "%~dp0iniciar-frontend-puerto-3001-mejorado.bat"
    timeout /t 15 /nobreak >nul
) else (
    echo ✅ Frontend detectado en http://localhost:3001
)

echo.
echo [3/4] Enviando solicitud de recuperación de contraseña para: %EMAIL%
echo.
node "%~dp0test-reset-password.js" "%EMAIL%" request
echo.

echo [4/4] Instrucciones finales:
echo ---------------------------------
echo 1. Revisa el correo electrónico en: %EMAIL%
echo 2. Abre el enlace de recuperación de contraseña en el correo
echo 3. Ingresa una nueva contraseña y confirma
echo 4. Intenta iniciar sesión con la nueva contraseña
echo.
echo Si no recibes el correo, verifica:
echo - Los registros del servidor backend
echo - Si la cuenta de correo está configurada correctamente
echo - Si hay errores CORS (revisa la consola del navegador)
echo.

:fin
pause
