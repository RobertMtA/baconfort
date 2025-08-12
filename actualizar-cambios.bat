@echo off
echo Actualizando cambios en GitHub y Railway...
PowerShell -ExecutionPolicy Bypass -File "%~dp0actualizar-cambios.ps1"
pause
