# Script para actualizar la persistencia del perfil de usuario
Write-Host "🔄 Actualizando código para solucionar problema de persistencia de datos de perfil..." -ForegroundColor Yellow

# Primero verificamos si hay cambios en el repo
Set-Location -Path "c:\Users\rober\Desktop\baconfort5- copia\"
$hasChanges = git status --porcelain

if ($hasChanges) {
    Write-Host "📦 Hay cambios en el repositorio, haciendo commit..." -ForegroundColor Cyan
    git add .
    git commit -m "fix: Solucionar problema de persistencia de datos de perfil de usuario"
}

# Desplegar backend
Write-Host "🚀 Desplegando backend..." -ForegroundColor Green
Set-Location -Path "c:\Users\rober\Desktop\baconfort5- copia\baconfort-backend"

# Detener el servicio existente si está corriendo
$processName = "node"
$processArgs = "server.js"
$runningProcesses = Get-WmiObject Win32_Process -Filter "name='$processName.exe'" | 
    Where-Object { $_.CommandLine -like "*$processArgs*" }

if ($runningProcesses) {
    Write-Host "🛑 Deteniendo servidor Node.js existente..." -ForegroundColor Yellow
    foreach ($process in $runningProcesses) {
        Stop-Process -Id $process.ProcessId -Force
    }
}

# Esperar a que el proceso se detenga
Start-Sleep -Seconds 2

# Iniciar nuevo servidor en segundo plano
Write-Host "🌐 Iniciando servidor backend..." -ForegroundColor Green
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden

# Desplegar frontend
Write-Host "🚀 Desplegando frontend..." -ForegroundColor Green
Set-Location -Path "c:\Users\rober\Desktop\baconfort5- copia\baconfort-react"

# Hacer build del frontend
Write-Host "🏗️ Construyendo aplicación React..." -ForegroundColor Cyan
npm run build

# Desplegar a Firebase
Write-Host "🔥 Desplegando a Firebase..." -ForegroundColor Magenta
firebase deploy --only hosting

# Volver al directorio principal
Set-Location -Path "c:\Users\rober\Desktop\baconfort5- copia\"

Write-Host "✅ Despliegue completo." -ForegroundColor Green
Write-Host "La solución del problema de persistencia de datos de perfil ha sido implementada." -ForegroundColor Green
Write-Host "Aspectos mejorados:" -ForegroundColor Cyan
Write-Host "  1. Actualización local inmediata para mejorar la experiencia de usuario" -ForegroundColor White
Write-Host "  2. Comunicación directa con MongoDB para garantizar la persistencia" -ForegroundColor White
Write-Host "  3. Sistema de fallback en caso de problemas con la base de datos" -ForegroundColor White
Write-Host "  4. Mejor manejo de errores y depuración" -ForegroundColor White
Write-Host "  5. Optimización del flujo de autenticación" -ForegroundColor White

Write-Host "`n🔍 Para verificar, accede a la aplicación e intenta actualizar tu perfil." -ForegroundColor Yellow
