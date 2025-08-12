@echo off
echo ===============================================
echo   Iniciando Frontend (React) en Puerto 3001
echo   [Versión Mejorada]
echo ===============================================
echo.

echo Navegando al directorio del frontend...
cd /d "%~dp0baconfort-react"

echo.
echo Verificando node_modules...
if not exist node_modules (
  echo No se encontró node_modules, ejecutando npm install primero...
  call npm install
  if %ERRORLEVEL% neq 0 (
    echo ERROR: Falló la instalación de dependencias.
    echo Por favor, ejecuta instalar-frontend-con-limpieza.bat y vuelve a intentar.
    pause
    exit /b 1
  )
)

echo.
echo Configurando variables de entorno...
(
  echo REACT_APP_API_URL=http://localhost:5004/api
  echo REACT_APP_ENV=development
  echo REACT_APP_SITE_URL=http://localhost:3001
) > .env.local
echo ✅ Variables de entorno configuradas correctamente

echo.
echo Configurando puerto...
set PORT=3001

echo.
echo Iniciando servidor de desarrollo en puerto 3001...
echo ⚠️ Presiona Ctrl+C para detener el servidor cuando termines
echo.
call npm start

if %ERRORLEVEL% neq 0 (
  echo.
  echo ERROR: No se pudo iniciar el frontend.
  echo Prueba ejecutar verificar-node-npm.bat para diagnosticar el problema.
  pause
)
