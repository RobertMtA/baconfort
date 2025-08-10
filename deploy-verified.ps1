# Script de despliegue mejorado para BaconFort con verificación de estado
# Este script despliega la aplicación y verifica que todo esté funcionando correctamente

Write-Host "===== INICIANDO DESPLIEGUE MEJORADO BACONFORT =====" -ForegroundColor Cyan
Write-Host ""

# Variables para tracking
$deploymentSuccess = $true
$frontendDeployed = $false
$backendDeployed = $false

# 1. Compilar la aplicación React
Write-Host "🔨 Compilando la aplicación React..." -ForegroundColor Yellow
cd baconfort-react
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar React. Abortando." -ForegroundColor Red
    exit 1
}
Write-Host "✅ React compilado exitosamente." -ForegroundColor Green

# 2. Desplegar a Firebase
Write-Host "🔥 Desplegando a Firebase Hosting..." -ForegroundColor Yellow
cd ..
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Advertencia al desplegar a Firebase." -ForegroundColor Yellow
    $deploymentSuccess = $false
} else {
    Write-Host "✅ Firebase desplegado exitosamente." -ForegroundColor Green
    $frontendDeployed = $true
}

# 3. Desplegar a Railway
Write-Host "🚂 Desplegando backend a Railway..." -ForegroundColor Yellow
cd baconfort-backend
railway up

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Advertencia al desplegar a Railway." -ForegroundColor Yellow
} else {
    Write-Host "✅ Railway desplegado exitosamente." -ForegroundColor Green
    $backendDeployed = $true
}

# 4. Verificar que la API esté funcionando
Write-Host "🔍 Verificando el estado de la API..." -ForegroundColor Yellow
try {
    $apiCheck = Invoke-RestMethod -Uri "https://baconfort-production-084d.up.railway.app/api/properties" -Method GET -ErrorAction Stop
    
    if ($apiCheck.success -eq $true) {
        Write-Host "✅ API verificada correctamente - devuelve datos de propiedades." -ForegroundColor Green
        $backendDeployed = $true
        
        # Mostrar número de propiedades encontradas
        $propCount = $apiCheck.data.Length
        Write-Host "   📊 Propiedades disponibles: $propCount" -ForegroundColor Cyan
        
        # Mostrar nombres de propiedades (máximo 5)
        if ($propCount -gt 0) {
            Write-Host "   🏠 Propiedades:" -ForegroundColor Cyan
            $displayCount = [Math]::Min(5, $propCount)
            for ($i = 0; $i -lt $displayCount; $i++) {
                $prop = $apiCheck.data[$i]
                Write-Host "      • $($prop.title)" -ForegroundColor White
            }
            if ($propCount -gt 5) {
                Write-Host "      • ... y $($propCount - 5) más" -ForegroundColor White
            }
        }
    }
    else {
        Write-Host "⚠️ La API responde pero con formato inesperado." -ForegroundColor Yellow
        $backendDeployed = $false
    }
}
catch {
    Write-Host "❌ Error al verificar la API: $_" -ForegroundColor Red
    $backendDeployed = $false
    $deploymentSuccess = $false
}

# 5. Volver a directorio principal
cd ..

# 6. Resumen
Write-Host ""
if ($deploymentSuccess -and $frontendDeployed -and $backendDeployed) {
    Write-Host "===== 🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE =====" -ForegroundColor Green
} elseif ($frontendDeployed -or $backendDeployed) {
    Write-Host "===== ⚠️ DESPLIEGUE PARCIAL =====" -ForegroundColor Yellow
} else {
    Write-Host "===== ❌ DESPLIEGUE FALLIDO =====" -ForegroundColor Red
}

Write-Host "📱 Frontend: https://confort-ba.web.app" -ForegroundColor Cyan
Write-Host "🖥️ Backend: https://baconfort-production-084d.up.railway.app/api" -ForegroundColor Cyan

# 7. Sugerencias finales
Write-Host ""
Write-Host "📝 Resultados:" -ForegroundColor White
if ($frontendDeployed) {
    Write-Host "   ✓ Frontend desplegado correctamente" -ForegroundColor Green
} else {
    Write-Host "   ✗ Frontend no desplegado completamente" -ForegroundColor Red
}

if ($backendDeployed) {
    Write-Host "   ✓ Backend desplegado y verificado" -ForegroundColor Green
} else {
    Write-Host "   ✗ Backend no desplegado o no verificado" -ForegroundColor Red
}

Write-Host ""
Write-Host "Para verificar manualmente:" -ForegroundColor White
Write-Host "   • Abrir https://confort-ba.web.app" -ForegroundColor White
Write-Host "   • API Test: https://baconfort-production-084d.up.railway.app/api/properties" -ForegroundColor White
Write-Host ""
