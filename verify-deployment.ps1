#!/usr/bin/env pwsh
# verify-deployment.ps1
# Script para verificar el estado del despliegue de BaconFort

# Función para mostrar mensajes con color
function Write-ColorOutput {
    param (
        [Parameter(Mandatory=$false)]
        [string]$Message = "",
        
        [Parameter(Mandatory=$false)]
        [string]$ForegroundColor = "White"
    )
    
    Write-Host $Message -ForegroundColor $ForegroundColor
}

function Check-Deployment {
    Write-ColorOutput "===== VERIFICACIÓN DE DESPLIEGUE BACONFORT =====" -ForegroundColor Cyan
    Write-ColorOutput "Fecha y hora: $(Get-Date)" -ForegroundColor Gray
    Write-ColorOutput ""
    
    # 1. Verificar frontend en Firebase
    Write-ColorOutput "Verificando Frontend (Firebase)..." -ForegroundColor Yellow
    try {
        $frontendResponse = Invoke-WebRequest -Uri "https://confort-ba.web.app" -Method Head -UseBasicParsing -ErrorAction SilentlyContinue
        if ($frontendResponse.StatusCode -eq 200) {
            Write-ColorOutput "✅ Frontend disponible en Firebase (Status: $($frontendResponse.StatusCode))" -ForegroundColor Green
        } else {
            Write-ColorOutput "❌ Frontend con respuesta anormal: $($frontendResponse.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-ColorOutput "❌ Error verificando frontend: $_" -ForegroundColor Red
    }
    Write-ColorOutput ""
    
    # 2. Verificar backend en Railway
    Write-ColorOutput "Verificando Backend (Railway)..." -ForegroundColor Yellow
    try {
        $backendResponse = Invoke-WebRequest -Uri "https://baconfort-production-084d.up.railway.app/api/health" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($backendResponse.StatusCode -eq 200) {
            Write-ColorOutput "✅ Backend respondiendo correctamente (Status: $($backendResponse.StatusCode))" -ForegroundColor Green
            
            # Intentar parsear la respuesta JSON
            try {
                $healthInfo = $backendResponse.Content | ConvertFrom-Json
                Write-ColorOutput "   - Estado: $($healthInfo.status)" -ForegroundColor Cyan
                Write-ColorOutput "   - Mensaje: $($healthInfo.message)" -ForegroundColor Cyan
                Write-ColorOutput "   - Tiempo: $($healthInfo.timestamp)" -ForegroundColor Cyan
            } catch {
                Write-ColorOutput "   - No se pudo parsear la respuesta JSON: $_" -ForegroundColor Yellow
            }
        } else {
            Write-ColorOutput "❌ Backend con respuesta anormal: $($backendResponse.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-ColorOutput "❌ Error verificando backend: $_" -ForegroundColor Red
    }
    Write-ColorOutput ""
    
    # 3. Verificar acceso a la base de datos
    Write-ColorOutput "Verificando acceso a base de datos..." -ForegroundColor Yellow
    try {
        $dbResponse = Invoke-WebRequest -Uri "https://baconfort-production-084d.up.railway.app/api/properties?limit=1" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($dbResponse.StatusCode -eq 200) {
            Write-ColorOutput "✅ API de propiedades respondiendo correctamente" -ForegroundColor Green
            
            # Intentar parsear la respuesta JSON
            try {
                $properties = $dbResponse.Content | ConvertFrom-Json
                $count = $properties.Count
                if ($count -gt 0) {
                    Write-ColorOutput "   - Base de datos accesible: $count propiedades encontradas" -ForegroundColor Green
                    Write-ColorOutput "   - Primera propiedad: $($properties[0].title)" -ForegroundColor Cyan
                } else {
                    Write-ColorOutput "⚠️ Base de datos accesible pero no se encontraron propiedades" -ForegroundColor Yellow
                }
            } catch {
                Write-ColorOutput "⚠️ No se pudo parsear la respuesta de propiedades: $_" -ForegroundColor Yellow
            }
        } else {
            Write-ColorOutput "❌ API de propiedades con respuesta anormal: $($dbResponse.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-ColorOutput "❌ Error verificando base de datos: $_" -ForegroundColor Red
    }
    Write-ColorOutput ""
    
    # 4. Verificar rutas críticas adicionales
    Write-ColorOutput "Verificando rutas críticas..." -ForegroundColor Yellow
    $criticalPaths = @(
        @{Uri="https://baconfort-production-084d.up.railway.app/api/users"; Name="API Usuarios"; AuthRequired=$true},
        @{Uri="https://baconfort-production-084d.up.railway.app/api/reviews"; Name="API Reviews"; AuthRequired=$false},
        @{Uri="https://baconfort-production-084d.up.railway.app/api/reservations"; Name="API Reservas"; AuthRequired=$true}
    )
    
    foreach ($path in $criticalPaths) {
        try {
            $response = Invoke-WebRequest -Uri $path.Uri -Method Head -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 204) {
                Write-ColorOutput "✅ $($path.Name) disponible (Status: $($response.StatusCode))" -ForegroundColor Green
            } else {
                Write-ColorOutput "⚠️ $($path.Name) responde con código: $($response.StatusCode)" -ForegroundColor Yellow
            }
        } catch {
            # Capturar el código de estado si es un error HTTP
            $statusCode = $_.Exception.Response.StatusCode.value__
            
            # Si es 401 y la ruta requiere autenticación, esto es esperado
            if ($statusCode -eq 401 -and $path.AuthRequired) {
                Write-ColorOutput "✅ $($path.Name) requiere autenticación (Status: $statusCode) - Comportamiento esperado" -ForegroundColor Cyan
            } else {
                Write-ColorOutput "❌ Error verificando $($path.Name): $_ (Status: $statusCode)" -ForegroundColor Red
            }
        }
    }
    
    Write-ColorOutput ""
    Write-ColorOutput "===== RESUMEN DE VERIFICACIÓN =====" -ForegroundColor Cyan
    Write-ColorOutput "Frontend: https://confort-ba.web.app" -ForegroundColor White
    Write-ColorOutput "Backend: https://baconfort-production-084d.up.railway.app/api" -ForegroundColor White
    Write-ColorOutput ""
    Write-ColorOutput "Para verificar manualmente:" -ForegroundColor White
    Write-ColorOutput "1. Abrir https://confort-ba.web.app en el navegador" -ForegroundColor White
    Write-ColorOutput "2. Verificar que se muestren las propiedades correctamente" -ForegroundColor White
    Write-ColorOutput "3. Intentar acceder al panel de administración" -ForegroundColor White
    Write-ColorOutput ""
}

# Ejecutar verificación
Check-Deployment
