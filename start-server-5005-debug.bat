@echo off
echo 🚀 Iniciando servidor BaconFort en puerto 5005 con debugging...
cd /d "c:\Users\rober\Desktop\baconfort5- copia\baconfort-backend"
echo 📁 Directorio actual: %cd%
set PORT=5005
set NODE_ENV=development
set DEBUG=*
echo 🔧 Variables configuradas:
echo    - PORT=%PORT%
echo    - NODE_ENV=%NODE_ENV%
echo    - DEBUG=%DEBUG%
echo 🚀 Iniciando servidor con debugging...
node server.js --trace-warnings
pause
