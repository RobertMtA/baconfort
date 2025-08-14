# Script para aplicar y probar los cambios a la autenticación de admin
# Versión con tokens fijos específicos para cada endpoint

Write-Host "🔄 Implementando solución de token fijo para API de consultas..." -ForegroundColor Cyan

# Obtener la ruta base del proyecto
$basePath = Get-Location
Write-Host "📂 Ruta base: $basePath"

# Cambiar a la carpeta del frontend
$frontendPath = Join-Path -Path $basePath -ChildPath "baconfort-react"
Write-Host "📂 Cambiando a la carpeta del frontend: $frontendPath" -ForegroundColor Yellow
Set-Location -Path $frontendPath

# Verificar archivos modificados
Write-Host "🔍 Cambios realizados:" -ForegroundColor Magenta
Write-Host "  - inquiryService.js: Implementado token fijo para consultas" -ForegroundColor Green
Write-Host "  - inquiryService.js: Mejorado sistema de fallback con token de emergencia" -ForegroundColor Green 
Write-Host "  - api.js: Actualizado getAllInquiries para usar token fijo" -ForegroundColor Green

# Reiniciar el servidor de desarrollo (si está ejecutándose)
Write-Host "🔄 Deteniendo procesos de desarrollo existentes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    foreach ($process in $nodeProcesses) {
        try {
            # Solo detener procesos relacionados con Vite o desarrollo
            $cmdLine = (Get-Process -Id $process.Id).CommandLine
            if ($cmdLine -match "vite|dev") {
                Stop-Process -Id $process.Id -Force
                Write-Host "✅ Proceso detenido: $($process.Id)" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️ No se pudo detener el proceso: $($process.Id)" -ForegroundColor Yellow
        }
    }
}

Write-Host "🧪 Iniciando servidor de desarrollo para pruebas..." -ForegroundColor Blue
Write-Host "✅ Accede a http://localhost:3000/admin para probar el acceso a consultas" -ForegroundColor Green
Write-Host "⚠️ NOTA IMPORTANTE: Estos tokens están configurados exclusivamente para desarrollo local" -ForegroundColor Yellow

# Iniciar el servidor de desarrollo
npm run dev

# Este comando mantendrá el proceso en ejecución hasta que el usuario lo detenga manualmente
