@echo off
REM Script para corregir automáticamente los problemas de autenticación

echo.
echo ===================================================
echo     CORRECCIÓN AUTOMÁTICA DE AUTENTICACIÓN
echo ===================================================
echo.

echo Ejecutando script de corrección...
node fix-autenticacion-completo.js

echo.
echo Presione cualquier tecla para salir...
pause > nul
