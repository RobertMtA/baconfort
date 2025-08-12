@echo off
echo ===============================================
echo   Actualizar Firebase, GitHub y Railway
echo ===============================================
echo.

echo [1/6] Construyendo el frontend...
cd /d "%~dp0baconfort-react"
call npm run build
if %ERRORLEVEL% neq 0 (
  echo ERROR: Fallo al construir el frontend.
  pause
  exit /b 1
)

echo.
echo [2/6] Copiando archivos al directorio de Firebase...
cd /d "%~dp0"
if exist build rmdir /s /q build
xcopy /s /e /i /y "baconfort-react\build" "build"

echo.
echo [3/6] Desplegando a Firebase...
cd /d "%~dp0"
call firebase deploy --only hosting
if %ERRORLEVEL% neq 0 (
  echo ERROR: Fallo al desplegar a Firebase.
  pause
  exit /b 1
)

echo.
echo [4/6] Haciendo commit y push a GitHub...
cd /d "%~dp0"
set /p COMMIT_MSG="Introduce un mensaje para el commit (o presiona Enter para usar 'Actualización: mejoras en sistema de recuperación de contraseña'): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Actualización: mejoras en sistema de recuperación de contraseña

git add .
git commit -m "%COMMIT_MSG%"
if %ERRORLEVEL% neq 0 (
  echo ERROR: Fallo al hacer commit.
  pause
  exit /b 1
)

git push origin main
if %ERRORLEVEL% neq 0 (
  echo ERROR: Fallo al hacer push.
  pause
  exit /b 1
)

echo.
echo [5/6] Desplegando el backend a Railway...
cd /d "%~dp0baconfort-backend"
call railway up --detach
if %ERRORLEVEL% neq 0 (
  echo ERROR: Fallo al desplegar a Railway.
  pause
  exit /b 1
)

echo.
echo [6/6] Proceso completado correctamente.
echo Frontend desplegado en: https://confort-ba.web.app
echo Backend desplegado en Railway.
echo.
echo Todo el proceso ha finalizado correctamente.

pause
