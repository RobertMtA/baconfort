@echo off
echo 🚀 Iniciando servidor BaconFort en puerto 5005...
echo 📍 Directorio actual: %cd%
cd /d "baconfort-backend"
echo 📍 Directorio backend: %cd%
echo 📊 Variables configuradas:
echo    - PORT=5005
echo    - NODE_ENV=development
set PORT=5005
set NODE_ENV=development
echo 🚀 Iniciando servidor...
node server.js
pause
