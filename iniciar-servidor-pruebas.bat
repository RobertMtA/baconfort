@echo off
echo ==================================
echo Iniciando servidor de prueba CORS
echo ==================================
echo.
echo Este servidor tiene configuraciones CORS permisivas para
echo facilitar la depuracion de problemas de recuperacion de contrasena.
echo.
echo Puerto: 5005
echo Ruta para recuperacion: /auth/forgot-password
echo.
echo Presiona Ctrl+C para detener el servidor.
echo.
node test-server.js
pause
