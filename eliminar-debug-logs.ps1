# Script para eliminar todos los console.log de debug del frontend
Write-Host "🧹 Eliminando mensajes de debug del frontend..." -ForegroundColor Cyan

# Archivos principales con debug logs
$files = @(
    "baconfort-react\src\services\api.js",
    "baconfort-react\src\components\Auth\AuthModal.jsx",
    "baconfort-react\src\components\AvailabilityInquiryForm\AvailabilityInquiryForm.jsx",
    "baconfort-react\src\components\VideoPlayer\VideoPlayer.jsx",
    "baconfort-react\src\components\ReservationForm\ReservationForm.jsx",
    "baconfort-react\src\hooks\useProperty.js",
    "baconfort-react\src\hooks\useAllOccupiedDates.js",
    "baconfort-react\src\hooks\useOccupiedDates.js",
    "baconfort-react\src\pages\Convencion-1994.jsx",
    "baconfort-react\src\services\priceService.js",
    "baconfort-react\src\context\AdminContext-STATEFUL.jsx",
    "baconfort-react\src\context\AdminContext-FUNCIONAL.jsx",
    "baconfort-react\src\components\AdminDebugger.jsx"
)

foreach ($file in $files) {
    $fullPath = "c:\Users\rober\Desktop\baconfort5- copia\$file"
    if (Test-Path $fullPath) {
        Write-Host "📁 Procesando: $file" -ForegroundColor Yellow
        
        # Leer contenido del archivo
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        
        # Eliminar líneas completas con console.log que contengan emojis
        $content = $content -replace '(?m)^\s*console\.log\(.*?[🌐🏠🎯🔍📹🔑💰📊⚠️🔄✅🏗️📹🔒🧹🔄📁].*?\);?\r?$\r?\n?', ''
        
        # Eliminar console.log con emojis en líneas que pueden tener más código
        $content = $content -replace 'console\.log\(.*?[🌐🏠🎯🔍📹🔑💰📊⚠️🔄✅🏗️📹🔒🧹🔄📁].*?\);?\s*', ''
        
        # Escribir contenido limpio
        Set-Content $fullPath -Value $content -Encoding UTF8
        Write-Host "✅ Limpiado: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ No encontrado: $file" -ForegroundColor Red
    }
}

Write-Host "`n🔨 Recompilando frontend..." -ForegroundColor Cyan
Set-Location "c:\Users\rober\Desktop\baconfort5- copia\baconfort-react"

# Construir producción
npm run build

Write-Host "`n✅ Frontend recompilado sin mensajes de debug" -ForegroundColor Green
Write-Host "🔗 Ahora la aplicación estará limpia de logs de debug en producción" -ForegroundColor Cyan
