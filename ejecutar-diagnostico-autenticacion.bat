@echo off
REM Ejecutar diagnóstico de autenticación
echo.
echo ===================================================
echo       DIAGNÓSTICO DE AUTENTICACIÓN BACONFORT
echo ===================================================
echo.

echo Instalando dependencias necesarias...
call npm install --no-save node-fetch@2

echo.
echo Ejecutando script de diagnóstico...
node diagnostico-autenticacion.js

echo.
echo Presione cualquier tecla para salir...
pause > nul
