@echo off
REM Script para arreglar la configuración de tokens en el backend local

echo.
echo ===================================================
echo     AJUSTE DE CONFIGURACIÓN DE TOKEN BACKEND LOCAL
echo ===================================================
echo.

echo Ejecutando script de corrección...
node fix-token-local.js

echo.
echo Presione cualquier tecla para salir...
pause > nul
