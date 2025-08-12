@echo off
echo ===============================================
echo 🚀 BACONFORT - Iniciar servidor API (backend)
echo ===============================================
cd /d "c:\Users\rober\Desktop\baconfort5- copia\baconfort-backend"
echo 📁 Directorio actual: %cd%

echo.
echo 🔍 Verificando servidor...
if not exist server.js (
    echo ❌ ERROR: No se encontró server.js
    pause
    exit /b 1
)

echo.
echo 🔧 Configurando variables de entorno...
set PORT=5004
set NODE_ENV=development
set CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173

echo.
echo 📡 Información del servidor:
echo    🌐 URL del servidor: http://localhost:5004
echo    🔌 API disponible en: http://localhost:5004/api
echo    🏥 Health check: http://localhost:5004/api/health
echo    🧪 Test endpoint: http://localhost:5004/api/test
echo.

echo 🚀 Iniciando servidor en puerto %PORT%...
echo ===============================================
node server.js
echo ===============================================

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR: El servidor no pudo iniciarse correctamente.
    echo 🔍 Es posible que el puerto %PORT% ya esté en uso.
    echo.
    echo 💡 Intenta lo siguiente:
    echo    1. Cierra otras instancias del servidor
    echo    2. Cambia la variable PORT a otro valor como 5005
    echo    3. Ejecuta el script start-server.ps1 con PowerShell
    echo.
)

pause
