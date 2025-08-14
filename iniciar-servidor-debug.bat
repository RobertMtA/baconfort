@echo off
REM Ejecutar servidor backend en modo debug con token flexibilizado

echo.
echo ===================================================
echo       SERVIDOR BACKEND EN MODO DEBUG
echo ===================================================
echo.

echo Iniciando servidor con autenticación flexibilizada...
node server-debug.js

echo.
echo Servidor detenido.
pause
