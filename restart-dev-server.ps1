# Script para reiniciar el entorno de desarrollo después de cambios

Write-Host "🔄 Reiniciando entorno de desarrollo para probar cambios CORS y require..." -ForegroundColor Cyan

# Obtener la ruta base del proyecto
$basePath = Get-Location
Write-Host "📂 Ruta base: $basePath"

# Cambiar a la carpeta del frontend
$frontendPath = Join-Path -Path $basePath -ChildPath "baconfort-react"
Write-Host "📂 Cambiando a la carpeta del frontend: $frontendPath" -ForegroundColor Yellow
Set-Location -Path $frontendPath

# Verificar archivos modificados
Write-Host "🔍 Cambios realizados:" -ForegroundColor Magenta
Write-Host "  - api.js: Eliminado require() y usa generación de token directa" -ForegroundColor Green
Write-Host "  - api.js: Eliminados headers personalizados para evitar CORS" -ForegroundColor Green 
Write-Host "  - inquiryService.js: Implementado generador de token local" -ForegroundColor Green
Write-Host "  - inquiryService.js: Eliminados headers CORS problemáticos" -ForegroundColor Green

# Reiniciar el servidor de desarrollo (si está ejecutándose)
Write-Host "🔄 Deteniendo procesos de desarrollo existentes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    foreach ($process in $nodeProcesses) {
        $cmdLine = wmic process where "ProcessId=$($process.Id)" get CommandLine
        if ($cmdLine -like "*vite*") {
            try {
                Stop-Process -Id $process.Id -Force
                Write-Host "✅ Proceso detenido: $($process.Id)" -ForegroundColor Green
            } catch {
                Write-Host "⚠️ No se pudo detener el proceso: $($process.Id)" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "🧪 Iniciando servidor de desarrollo para pruebas..." -ForegroundColor Blue
Write-Host "✅ Accede a http://localhost:3000/admin para probar los cambios" -ForegroundColor Green

# Iniciar el servidor de desarrollo
npm run dev

# Este comando mantendrá el proceso en ejecución hasta que el usuario lo detenga manualmente
