@echo off
echo 🚀 Iniciando Backend BACONFORT...
cd /d "c:\Users\rober\Desktop\baconfort3\baconfort-backend"
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
echo 🚀 Iniciando servidor en puerto 3001...
echo 🌍 Servidor disponible en: http://localhost:3001
echo 📸 Imágenes disponibles en: http://localhost:3001/uploads/
echo 🔌 API disponible en: http://localhost:3001/api/
echo.
node server.js
pause
