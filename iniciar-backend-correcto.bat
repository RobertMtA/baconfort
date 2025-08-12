@echo off
echo 🚀 Iniciando Backend BACONFORT...
cd /d "c:\Users\rober\Desktop\baconfort5- copia\baconfort-backend"
echo 📁 Directorio: %cd%
echo 🔍 Verificando Node.js...
node --version
echo 🔍 Verificando package.json...
if exist package.json (
    echo ✅ package.json encontrado
) else (
    echo ❌ package.json NO encontrado
    pause
    exit /b 1
)

echo 🔍 Verificando server.js...
if exist server.js (
    echo ✅ server.js encontrado
) else (
    echo ❌ server.js NO encontrado
    pause
    exit /b 1
)

echo.
echo 🚀 Iniciando servidor en puerto 5004...
echo 🌍 Servidor disponible en: http://localhost:5004
echo 📸 Imágenes disponibles en: http://localhost:5004/uploads/
echo 🔌 API disponible en: http://localhost:5004/api/
echo.

set PORT=5004
node server.js
pause
