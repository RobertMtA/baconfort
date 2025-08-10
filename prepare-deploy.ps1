# Script simple para actualizar configuración y compilar para Firebase y Railway
Write-Host "=====================================" 
Write-Host "BACONFORT - PREPARACION PARA DESPLIEGUE" 
Write-Host "=====================================" 
Write-Host ""

# Configurar el archivo .env.production
Write-Host "Actualizando archivo .env.production..."
$envProdPath = ".\baconfort-react\.env.production"
$envProdContent = @"
# CONFIGURACION RAILWAY PRODUCTION 
VITE_API_URL=https://baconfort-production-084d.up.railway.app/api
REACT_APP_API_URL=https://baconfort-production-084d.up.railway.app/api
REACT_APP_SOCKET_URL=https://baconfort-production-084d.up.railway.app 
REACT_APP_ENVIRONMENT=production 
REACT_APP_DEBUG=false 
"@

Set-Content -Path $envProdPath -Value $envProdContent
Write-Host "Archivo .env.production actualizado correctamente"

# Compilar la aplicación React
Write-Host ""
Write-Host "Compilando la aplicacion React para produccion..."
Set-Location -Path ".\baconfort-react"
npm run build
Set-Location -Path ".."

# Verificar si la compilación fue exitosa
if (!(Test-Path ".\baconfort-react\dist")) {
    Write-Host "Error: La compilacion fallo. No se encuentra la carpeta dist."
    exit 1
}

Write-Host ""
Write-Host "Compilacion exitosa!"
Write-Host "La aplicacion esta lista para ser desplegada a Firebase."
Write-Host ""
Write-Host "Para desplegar a Firebase, ejecuta: firebase deploy"
Write-Host "Para desplegar el backend a Railway, ejecuta: cd baconfort-backend && railway up"
