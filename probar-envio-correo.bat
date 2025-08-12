@echo off
echo ==============================================
echo   Prueba de envío de correo electrónico
echo ==============================================
echo.
echo Esta herramienta verifica si la configuración de 
echo correo electrónico está funcionando correctamente
echo para la recuperación de contraseña.
echo.
echo Por favor, edita el archivo test-email-sending.js
echo y cambia TEST_EMAIL por tu dirección de correo.
echo.
echo Presiona cualquier tecla para comenzar la prueba...
pause > nul
cd baconfort-backend
node test-email-sending.js
echo.
pause
