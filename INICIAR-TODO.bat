echo off
cls
echo ============================================
echo 🚀 BACONFORT - Iniciando Sistema Completo
echo ============================================
echo.

echo 🔄 Paso 1: Limpiando procesos existentes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Procesos Node.js detenidos
) else (
    echo ℹ️  No hay procesos Node.js ejecutándose
)

echo.
echo 🔄 Paso 2: Iniciando Backend...
cd /d "%~dp0baconfort-backend"
echo 📂 Directorio actual: %CD%

if not exist "node_modules" (
    echo 📦 Instalando dependencias del backend...
    npm install
)

echo 🚀 Iniciando servidor backend en puerto 5001...
echo ⏳ Espera unos segundos para que inicie completamente...
echo.
echo 🌐 Backend estará disponible en: http://localhost:5001
echo 📊 Frontend debería estar en: http://localhost:3000
echo.
echo ⚡ Para detener el servidor: Ctrl+C
echo ============================================
echo.

start "" npm start

echo.
echo 🔄 Paso 3: Esperando que el backend inicie...
timeout /t 5 /nobreak >nul

echo.
echo 🔄 Paso 4: Iniciando Frontend...
cd /d "%~dp0baconfort-react"
echo 📂 Directorio frontend: %CD%

if not exist "node_modules" (
    echo 📦 Instalando dependencias del frontend...
    npm install
)

echo 🚀 Iniciando frontend en modo desarrollo...
echo 🌐 Frontend estará disponible en: http://localhost:3000
echo.

start "" npm run dev

echo.
echo ============================================
echo ✅ SISTEMA INICIADO COMPLETAMENTE
echo ============================================
echo.
echo 🎯 URLs para probar:
echo    Backend:  http://localhost:5001
echo    Frontend: http://localhost:3000
echo.
echo 🔧 Para probar las mejoras:
echo    1. Ve a: http://localhost:3000/my-reservations
echo    2. Ve a: http://localhost:3000/admin (PropertyEditor)
echo    3. Haz una reserva completa con pago
echo.
echo 📋 Archivos de ayuda:
echo    - GUIA-INICIO-RAPIDO.md
echo    - SOLUCION-TOKEN-RESERVAS.md
echo    - MEJORAS-PROPERTY-EDITOR-Y-PAGOS.md
echo.
pause
