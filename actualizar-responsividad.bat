@echo off
echo Actualizando cambios responsive para departamentos y admin...
PowerShell -ExecutionPolicy Bypass -File "%~dp0actualizar-cambios.ps1"
pause
