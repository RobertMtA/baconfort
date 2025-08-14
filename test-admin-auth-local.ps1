# Script para probar los cambios en modo de desarrollo local

Write-Host "🔄 Iniciando entorno de desarrollo para probar cambios de autenticación admin..." -ForegroundColor Cyan

# Obtener la ruta base del proyecto
$basePath = Get-Location
Write-Host "📂 Ruta base: $basePath"

# Cambiar a la carpeta del frontend
$frontendPath = Join-Path -Path $basePath -ChildPath "baconfort-react"
Write-Host "📂 Cambiando a la carpeta del frontend: $frontendPath" -ForegroundColor Yellow
Set-Location -Path $frontendPath

# Verificar archivos modificados
Write-Host "🔍 Archivos modificados:" -ForegroundColor Magenta
Write-Host "  - adminTokenManager.js: Nueva función generateStaticAdminToken" -ForegroundColor Green
Write-Host "  - api.js: Uso de token estático para llamadas de administrador" -ForegroundColor Green 
Write-Host "  - inquiryService.js: Implementación de mecanismo de fallback" -ForegroundColor Green

Write-Host "🧪 Iniciando servidor de desarrollo para pruebas..." -ForegroundColor Blue
Write-Host "✅ Accede a http://localhost:3000/admin para probar los cambios" -ForegroundColor Green

# Iniciar el servidor de desarrollo
npm run dev

# Este comando mantendrá el proceso en ejecución hasta que el usuario lo detenga manualmente
