@echo off
echo Preparando archivos para despliegue manual...
PowerShell -ExecutionPolicy Bypass -File "%~dp0preparar-despliegue-manual.ps1"
pause
