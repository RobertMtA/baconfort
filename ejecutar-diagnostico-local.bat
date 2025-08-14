@echo off
REM Ejecutar diagnóstico específico para backend local

echo.
echo ===================================================
echo       DIAGNÓSTICO DE BACKEND LOCAL
echo ===================================================
echo.

echo Instalando dependencias necesarias...
call npm install --no-save node-fetch@2

echo.
echo Ejecutando script de diagnóstico...
node diagnostico-backend-local.js

echo.
echo Presione cualquier tecla para salir...
pause > nul
