@echo off
REM Script para instalar dependencias y ejecutar el proxy de autenticación

echo.
echo ===================================================
echo    PROXY DE AUTENTICACIÓN PARA BACKEND LOCAL
echo ===================================================
echo.

echo Instalando dependencias necesarias...
call npm install --no-save http-proxy

echo.
echo Iniciando servidor proxy...
echo.
node proxy-auth-backend.js

echo.
pause
