# Script para preparar la aplicación para despliegue en Firebase y Railway
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "🚀 BACONFORT - DESPLIEGUE FIREBASE+RAILWAY" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""

# Verificar archivos de entorno
$reactEnvPath = Join-Path (Get-Location) "baconfort-react\.env"
$reactEnvProductionPath = Join-Path (Get-Location) "baconfort-react\.env.production"
$firebaseJsonPath = Join-Path (Get-Location) "firebase.json"

Write-Host "🔍 Verificando archivos de configuración..." -ForegroundColor Cyan
$filesExist = $true

if (!(Test-Path $reactEnvPath)) {
    Write-Host "❌ Archivo .env no encontrado" -ForegroundColor Red
    $filesExist = $false
}

if (!(Test-Path $reactEnvProductionPath)) {
    Write-Host "❌ Archivo .env.production no encontrado" -ForegroundColor Red
    $filesExist = $false
}

if (!(Test-Path $firebaseJsonPath)) {
    Write-Host "❌ Archivo firebase.json no encontrado" -ForegroundColor Red
    $filesExist = $false
}

if (!$filesExist) {
    Write-Host "❌ Faltan archivos de configuración. No se puede continuar." -ForegroundColor Red
    exit 1
}

# Configurar el archivo .env para usar la URL de Railway
Write-Host "📝 Actualizando configuración para Railway..." -ForegroundColor Yellow
$envContent = Get-Content $reactEnvPath -Raw

# Asegurar que VITE_API_URL apunte a Railway
if ($envContent -match "VITE_API_URL=") {
    $envContent = $envContent -replace "VITE_API_URL=.*", "VITE_API_URL=https://baconfort-production-084d.up.railway.app/api"
} else {
    $envContent += "`nVITE_API_URL=https://baconfort-production-084d.up.railway.app/api"
}

Set-Content -Path $reactEnvPath -Value $envContent
Write-Host "✅ .env actualizado correctamente" -ForegroundColor Green

# Configurar el archivo .env.production para usar la URL de Railway
Write-Host "📝 Actualizando configuración de producción..." -ForegroundColor Yellow
$envProdContent = Get-Content $reactEnvProductionPath -Raw

# Asegurar que VITE_API_URL apunte a Railway en producción
if ($envProdContent -match "VITE_API_URL=") {
    $envProdContent = $envProdContent -replace "VITE_API_URL=.*", "VITE_API_URL=https://baconfort-production-084d.up.railway.app/api"
} else {
    $envProdContent += "`nVITE_API_URL=https://baconfort-production-084d.up.railway.app/api"
}

Set-Content -Path $reactEnvProductionPath -Value $envProdContent
Write-Host "✅ .env.production actualizado correctamente" -ForegroundColor Green

# Verificar si hay un archivo firebase.json y actualizarlo si es necesario
if (Test-Path $firebaseJsonPath) {
    Write-Host "📝 Verificando configuración de Firebase..." -ForegroundColor Yellow
    $firebaseJson = Get-Content $firebaseJsonPath | ConvertFrom-Json
    
    # Verificar si tiene configuración de hosting
    if ($firebaseJson.hosting) {
        # Asegurar que tiene las redirecciones correctas para SPA
        $hasRewrite = $false
        
        if ($firebaseJson.hosting.rewrites) {
            foreach ($rewrite in $firebaseJson.hosting.rewrites) {
                if ($rewrite.source -eq "**" -and $rewrite.destination -eq "/index.html") {
                    $hasRewrite = $true
                    break
                }
            }
        }
        
        if (!$hasRewrite) {
            Write-Host "📝 Agregando regla de reescritura para SPA en Firebase..." -ForegroundColor Yellow
            
            # Crear objeto JSON manualmente porque ConvertTo-Json puede tener problemas
            $firebaseContent = Get-Content $firebaseJsonPath -Raw
            
            # Verificar si ya tiene un array de rewrites o necesitamos crearlo
            if ($firebaseContent -match '"rewrites"\s*:\s*\[') {
                # Ya tiene un array de rewrites, agregar nueva regla
                $firebaseContent = $firebaseContent -replace '("rewrites"\s*:\s*\[)', '$1{"source":"**","destination":"/index.html"},'
            } else {
                # No tiene rewrites, agregar nueva sección
                $firebaseContent = $firebaseContent -replace '("hosting"\s*:\s*\{)', '$1"rewrites":[{"source":"**","destination":"/index.html"}],'
            }
            
            Set-Content -Path $firebaseJsonPath -Value $firebaseContent
            Write-Host "✅ firebase.json actualizado con regla de reescritura SPA" -ForegroundColor Green
        } else {
            Write-Host "✅ firebase.json ya tiene configuración SPA correcta" -ForegroundColor Green
        }
        
        # Verificar si tiene configuración de headers para CORS
        $hasCorsHeaders = $false
        
        if ($firebaseJson.hosting.headers) {
            foreach ($header in $firebaseJson.hosting.headers) {
                if ($header.source -eq "/api/**") {
                    $hasCorsHeaders = $true
                    break
                }
            }
        }
        
        if (!$hasCorsHeaders) {
            Write-Host "📝 Agregando headers CORS para API en Firebase..." -ForegroundColor Yellow
            
            # Crear los headers manualmente
            $firebaseContent = Get-Content $firebaseJsonPath -Raw
            
            # Verificar si ya tiene un array de headers o necesitamos crearlo
            if ($firebaseContent -match '"headers"\s*:\s*\[') {
                # Ya tiene un array de headers, agregar nuevas reglas
                $corsHeaders = @'
{"source": "/api/**", "headers": [
  {"key": "Access-Control-Allow-Origin", "value": "*"},
  {"key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS"},
  {"key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization"}
]},
'@
                $firebaseContent = $firebaseContent -replace '("headers"\s*:\s*\[)', "$1$corsHeaders"
            } else {
                # No tiene headers, agregar nueva sección
                $corsHeaders = @'
"headers": [
  {"source": "/api/**", "headers": [
    {"key": "Access-Control-Allow-Origin", "value": "*"},
    {"key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS"},
    {"key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization"}
  ]}
],
'@
                $firebaseContent = $firebaseContent -replace '("hosting"\s*:\s*\{)', "$1$corsHeaders"
            }
            
            Set-Content -Path $firebaseJsonPath -Value $firebaseContent
            Write-Host "✅ firebase.json actualizado con headers CORS" -ForegroundColor Green
        } else {
            Write-Host "✅ firebase.json ya tiene configuración CORS correcta" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️ firebase.json no tiene configuración de hosting" -ForegroundColor Yellow
        
        # Crear configuración básica de hosting
        $firebaseContent = Get-Content $firebaseJsonPath -Raw
        $firebaseContent = $firebaseContent -replace '(\s*\}\s*)$', @'
,
  "hosting": {
    "public": "baconfort-react/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/api/**",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          },
          {
            "key": "Access-Control-Allow-Methods",
            "value": "GET, POST, PUT, DELETE, OPTIONS"
          },
          {
            "key": "Access-Control-Allow-Headers",
            "value": "Content-Type, Authorization"
          }
        ]
      }
    ]
  }
}
'@
        
        Set-Content -Path $firebaseJsonPath -Value $firebaseContent
        Write-Host "✅ Configuración de hosting agregada a firebase.json" -ForegroundColor Green
    }
} else {
    Write-Host "❌ No se encontró firebase.json" -ForegroundColor Red
}

# Compilar la aplicación React
Write-Host ""
Write-Host "🏗️ Compilando la aplicación React..." -ForegroundColor Yellow
Set-Location -Path "baconfort-react"
npm run build

# Volver al directorio raíz
Set-Location -Path ".."

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✅ CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para desplegar la aplicación, ejecuta los siguientes comandos:"
Write-Host ""
Write-Host "🔥 Firebase:" -ForegroundColor Yellow
Write-Host "firebase deploy" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚂 Railway:" -ForegroundColor Yellow
Write-Host "cd baconfort-backend && railway up" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Recuerda hacer commit de los cambios:" -ForegroundColor Yellow
Write-Host "git add ." -ForegroundColor Cyan
Write-Host "git commit -m 'Configuración para Firebase y Railway'" -ForegroundColor Cyan
Write-Host "git push origin main" -ForegroundColor Cyan
