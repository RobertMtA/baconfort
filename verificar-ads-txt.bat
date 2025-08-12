@echo off
echo Verificando archivo ads.txt para Google AdSense...
PowerShell -ExecutionPolicy Bypass -File "%~dp0verificar-ads-txt.ps1"
pause
