@echo off
echo ==============================================
echo   Prueba directa de recuperacion de contrasena
echo ==============================================
echo.
echo Esta prueba envia una solicitud directamente a la API
echo sin pasar por el frontend de React.
echo.
echo Asegurate de que el servidor backend este en ejecucion.
echo.
echo Presiona cualquier tecla para iniciar la prueba...
pause > nul
node test-directo-recuperacion.js
echo.
echo Prueba finalizada.
pause
