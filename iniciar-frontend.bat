@echo off
echo 🚀 Iniciando Frontend BACONFORT...
cd /d "c:\Users\rober\Desktop\baconfort3\baconfort-react"
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

echo 🚀 Iniciando servidor de desarrollo...
npm run dev
pause
