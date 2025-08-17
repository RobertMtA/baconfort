#!/usr/bin/env pwsh
# Script para corregir todas las URLs hardcodeadas incorrectas

Write-Host "🔧 Corrigiendo URLs hardcodeadas en el código fuente..." -ForegroundColor Yellow

$oldUrl = "https://baconfort-production.up.railway.app"
$newUrl = "https://baconfort-production.up.railway.app"

# Lista de archivos a corregir
$files = @(
    "baconfort-react\src\utils\adminTokenManager.js",
    "baconfort-react\src\security\adminTokenManager.js", 
    "baconfort-react\src\pages\VerifyEmail.jsx",
    "baconfort-react\src\components\VerifyEmail.jsx",
    "baconfort-react\src\components\UserReservations\UserReservations.jsx",
    "baconfort-react\src\components\SubscriptionForm\SubscriptionForm.jsx",
    "baconfort-react\src\context\AuthContextAPI.jsx",
    "baconfort-react\src\context\AdminContext-STATEFUL.jsx"
)

$totalFixed = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  📝 Procesando: $file" -ForegroundColor Cyan
        
        $content = Get-Content $file -Raw
        $originalContent = $content
        $content = $content -replace [regex]::Escape($oldUrl), $newUrl
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            $matches = ([regex]::Matches($originalContent, [regex]::Escape($oldUrl))).Count
            Write-Host "    ✅ Corregidas $matches URLs" -ForegroundColor Green
            $totalFixed += $matches
        } else {
            Write-Host "    ℹ️ Sin cambios necesarios" -ForegroundColor Gray
        }
    } else {
        Write-Host "    ⚠️ Archivo no encontrado: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Proceso completado!" -ForegroundColor Green
Write-Host "   Total de URLs corregidas: $totalFixed" -ForegroundColor Cyan
Write-Host "   URL antigua: $oldUrl" -ForegroundColor Red
Write-Host "   URL nueva:   $newUrl" -ForegroundColor Green

Write-Host "`n▶️ Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. npm run build" -ForegroundColor Gray
Write-Host "   2. firebase deploy --only hosting" -ForegroundColor Gray
