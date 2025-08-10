@echo off
echo ====================================
echo 🚀 INICIANDO SERVIDORES BACONFORT
echo ====================================
echo.

echo 📍 PASO 1: Iniciando Backend en puerto 5004...
start "BACONFORT Backend" cmd /k "cd /d c:\Users\rober\Desktop\baconfort5- copia\baconfort-backend && npm start"

echo ⏳ Esperando 3 segundos para que el backend se inicie...
timeout /t 3 /nobreak >nul

echo 📍 PASO 2: Iniciando Frontend en Puerto 3000...
start "BACONFORT Frontend" cmd /k "cd /d c:\Users\rober\Desktop\baconfort5- copia\baconfort-react && npm run dev"

echo.
echo ✅ SERVIDORES INICIADOS:
echo 🔗 Backend:  http://localhost:5004
echo 🔗 Frontend: http://localhost:3000
echo 🔗 Admin:    http://localhost:3000/admin
echo.
echo 💡 Presiona cualquier tecla para cerrar...
pause >nul

