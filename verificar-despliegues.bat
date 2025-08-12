@echo off
echo ===============================================
echo   Verificar estado de despliegues
echo ===============================================
echo.

echo [1/3] Verificando Firebase...
firebase hosting:channel:list
echo.

echo [2/3] Verificando GitHub...
git log -1 --oneline
echo.
git status
echo.

echo [3/3] Verificando Railway...
cd /d "%~dp0baconfort-backend"
railway status
echo.

echo ===============================================
echo Verificación completada.
echo ===============================================

pause
