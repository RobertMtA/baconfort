# Script para corregir configuraciones inconsistentes de puertos en el proyecto Baconfort
Write-Host "====================================" -ForegroundColor Yellow
Write-Host "🚀 BACONFORT - CORRECCIÓN DE PUERTOS" -ForegroundColor Yellow 
Write-Host "====================================" -ForegroundColor Yellow
Write-Host ""

# PASO 1: Verificar en qué puerto está configurado el backend
$backendServerFile = Join-Path (Get-Location) "baconfort-backend\server.js"
$backendServerContent = Get-Content $backendServerFile -Raw
$backendPortMatch = [regex]::Match($backendServerContent, 'const PORT = process\.env\.PORT \|\| (\d+)')

if ($backendPortMatch.Success) {
    $backendPort = $backendPortMatch.Groups[1].Value
    Write-Host "✅ Puerto encontrado en server.js: $backendPort" -ForegroundColor Green
} else {
    Write-Host "❌ No se pudo determinar el puerto en server.js" -ForegroundColor Red
    exit 1
}

# PASO 2: Verificar y actualizar scripts de inicio si es necesario
$scripts = @(
    "INICIAR-SERVIDORES.bat",
    "iniciar-todo.sh",
    "iniciar-backend.bat",
    "start-both-servers.bat"
)

foreach ($script in $scripts) {
    $scriptPath = Join-Path (Get-Location) $script
    if (Test-Path $scriptPath) {
        $content = Get-Content $scriptPath -Raw
        
        # Verificar si hay referencias a otros puertos
        if ($content -match "localhost:5001" -or $content -match "puerto 5001") {
            Write-Host "📝 Actualizando puerto incorrecto en $script..." -ForegroundColor Yellow
            $updatedContent = $content -replace "localhost:5001", "localhost:$backendPort" `
                                      -replace "puerto 5001", "puerto $backendPort"
            Set-Content -Path $scriptPath -Value $updatedContent
            Write-Host "  ✅ $script actualizado" -ForegroundColor Green
        } else {
            Write-Host "  ✓ $script parece estar correcto" -ForegroundColor Gray
        }
    }
}

# PASO 3: Actualizar scripts que usen localhost:5004 hardcodeado
$scriptsToCheck = @(
    "simple-verification-test.js",
    "confirm-reservation.js", 
    "check-properties.js",
    "check-users-via-api.js",
    "check-and-create-subscribers.js"
)

foreach ($script in $scriptsToCheck) {
    $scriptPath = Join-Path (Get-Location) $script
    if (Test-Path $scriptPath) {
        $content = Get-Content $scriptPath -Raw
        
        if ($content -match "localhost:5004") {
            Write-Host "📝 Actualizando URLs hardcodeadas en $script..." -ForegroundColor Yellow
            
            # Verificar si debemos usar la URL de producción o local
            $useProduction = $false
            $response = Read-Host "¿Deseas actualizar $script para usar la URL de producción? (S/N)"
            if ($response -eq "S" -or $response -eq "s") {
                $useProduction = $true
            }
            
            if ($useProduction) {
                $updatedContent = $content -replace "http://localhost:5004/api", "https://baconfort-production-084d.up.railway.app/api"
                Set-Content -Path $scriptPath -Value $updatedContent
                Write-Host "  ✅ $script actualizado para usar URL de producción" -ForegroundColor Green
            } else {
                $updatedContent = $content -replace "http://localhost:5004/api", "http://localhost:$backendPort/api"
                Set-Content -Path $scriptPath -Value $updatedContent
                Write-Host "  ✅ $script actualizado para usar URL local: puerto $backendPort" -ForegroundColor Green
            }
        }
    }
}

# PASO 4: Verificar archivos de rutas en el backend que puedan tener URLs hardcodeadas
$routeFiles = Get-ChildItem -Path (Join-Path (Get-Location) "baconfort-backend\routes") -Filter "*.js"
$updatedFiles = 0

foreach ($file in $routeFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "localhost:5004") {
        Write-Host "📝 Actualizando URLs hardcodeadas en $($file.Name)..." -ForegroundColor Yellow
        $updatedContent = $content -replace "http://localhost:5004/api", "https://baconfort-production-084d.up.railway.app/api"
        Set-Content -Path $file.FullName -Value $updatedContent
        $updatedFiles++
        Write-Host "  ✅ $($file.Name) actualizado" -ForegroundColor Green
    }
}

Write-Host "📊 Archivos de rutas actualizados: $updatedFiles" -ForegroundColor Cyan

# PASO 5: Verificar que .env tiene la URL correcta
$envFile = Join-Path (Get-Location) "baconfort-react\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    $envApiUrlMatch = [regex]::Match($envContent, 'VITE_API_URL=(.+)')
    
    if ($envApiUrlMatch.Success) {
        $currentApiUrl = $envApiUrlMatch.Groups[1].Value
        Write-Host "📝 API URL actual en .env: $currentApiUrl" -ForegroundColor Cyan
        
        # Preguntar si desea cambiar la URL
        $changeUrl = Read-Host "¿Deseas actualizar la URL de la API en .env? (S/N)"
        
        if ($changeUrl -eq "S" -or $changeUrl -eq "s") {
            $useProduction = $false
            $response = Read-Host "¿Usar URL de producción? (S/N). Si respondes N, se usará localhost:$backendPort"
            
            if ($response -eq "S" -or $response -eq "s") {
                $newApiUrl = "https://baconfort-production-084d.up.railway.app/api"
            } else {
                $newApiUrl = "http://localhost:$backendPort/api"
            }
            
            $updatedEnvContent = $envContent -replace "VITE_API_URL=.+", "VITE_API_URL=$newApiUrl"
            Set-Content -Path $envFile -Value $updatedEnvContent
            Write-Host "✅ URL de API en .env actualizada a: $newApiUrl" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️ No se encontró configuración VITE_API_URL en .env" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Yellow
Write-Host "✅ CORRECCIÓN DE PUERTOS FINALIZADA" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Recomendaciones:"
Write-Host "1. Detén todos los servidores en ejecución"
Write-Host "2. Ejecuta INICIAR-SERVIDORES.bat para iniciar los servidores con la configuración corregida"
Write-Host "3. Asegúrate de que el frontend esté usando la URL de API correcta"
Write-Host ""
Write-Host "Si continúas viendo errores de conexión, asegúrate de que:"
Write-Host "1. El backend esté en ejecución en el puerto $backendPort"
Write-Host "2. Verifica si hay algún firewall bloqueando la conexión"
Write-Host "3. Revisa si la API está configurada para aceptar conexiones CORS desde tu cliente"
