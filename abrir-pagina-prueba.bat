@echo off
echo ====================================================
echo Abriendo pagina de prueba de recuperacion de contrasena
echo ====================================================
echo.
echo Esta pagina HTML es una implementacion simplificada
echo del formulario de recuperacion de contrasena que se
echo conecta al servidor de prueba en puerto 5005.
echo.
echo IMPORTANTE: Asegurate de haber iniciado el servidor
echo de prueba con el archivo "iniciar-servidor-pruebas.bat"
echo.
echo Presiona cualquier tecla para abrir la pagina...
pause > nul
start "" test-recuperacion-password.html
