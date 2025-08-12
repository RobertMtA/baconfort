@echo off
echo ==============================================
echo   Iniciando Backend y Frontend para pruebas
echo ==============================================
echo.

echo [1/2] Iniciando el servidor backend...
start cmd /k "cd baconfort-backend && npm start"

timeout /t 5 /nobreak > nul

echo [2/2] Iniciando la aplicacion React...
start cmd /k "cd baconfort-react && npm start"

echo.
echo Ambos servidores se han iniciado en ventanas separadas.
echo Para probar la recuperacion de contrasena:
echo 1. Abre http://localhost:3001 en tu navegador
echo 2. Haz clic en "Iniciar Sesion"
echo 3. Haz clic en "¿Olvidaste tu contrasena?"
echo 4. Ingresa un correo y prueba el boton "Enviar Instrucciones"
echo.
echo Revisa las ventanas de los servidores para ver los logs.
echo.
