@echo off
echo ==============================================
echo   Iniciando servidor con CORS permisivo
echo ==============================================
echo.
echo Este script inicia el servidor backend con una
echo configuracion CORS que permite solicitudes desde
echo cualquier origen, util para depurar problemas
echo de comunicacion entre frontend y backend.
echo.
echo IMPORTANTE: Esta configuracion solo debe usarse
echo durante el desarrollo y la depuracion.
echo.
cd baconfort-backend
node start-with-cors-fix.js
pause
