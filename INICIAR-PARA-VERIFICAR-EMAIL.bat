@echo off
echo ==========================================================
echo    INICIAR SERVIDOR PARA VERIFICACION DE EMAIL
echo ==========================================================
echo.
echo Este script inicia el servidor backend para que la
echo verificacion de email funcione correctamente.
echo.
echo IMPORTANTE: Mantener esta ventana abierta mientras
echo             verificas tu email.
echo.
echo ==========================================================

cd /d "%~dp0baconfort-backend"
echo Directorio: %CD%
echo.
echo Iniciando el servidor backend...
echo.
echo El servidor estara disponible en: http://localhost:5004
echo.
echo Cuando termines, puedes cerrar esta ventana con Ctrl+C
echo.
echo ==========================================================

node server.js

pause
