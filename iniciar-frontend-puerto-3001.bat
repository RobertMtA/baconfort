@echo off
echo ===============================================
echo    Iniciando React en puerto 3001
echo ===============================================
echo.
echo Asegurate de tener las siguientes lineas en el
echo archivo .env de baconfort-react:
echo.
echo VITE_FRONTEND_URL=http://localhost:3001
echo.
echo Presiona cualquier tecla para continuar...
pause > nul
echo.
echo Iniciando servidor de desarrollo...
cd baconfort-react
set PORT=3001
npm run dev -- --port=3001 --host
