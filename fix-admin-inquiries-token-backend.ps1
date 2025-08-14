# fix-admin-inquiries-token-backend.ps1
# Script para actualizar la configuración del backend para aceptar tokens dinámicos

Write-Host "🔧 Modificando backend para aceptar tokens dinámicos..." -ForegroundColor Yellow

# Encontrar la ruta del API
$apiPath = Join-Path -Path $PSScriptRoot -ChildPath "baconfort-express-api"

if (-not (Test-Path -Path $apiPath)) {
    Write-Host "❌ No se encontró la carpeta del backend en $apiPath" -ForegroundColor Red
    
    # Buscar carpetas potenciales del backend
    Write-Host "🔍 Buscando carpetas potenciales del backend..." -ForegroundColor Cyan
    $potentialFolders = Get-ChildItem -Path $PSScriptRoot -Directory | Where-Object { 
        $_.Name -like "*api*" -or $_.Name -like "*express*" -or $_.Name -like "*backend*" -or $_.Name -like "*server*"
    }
    
    if ($potentialFolders.Count -eq 0) {
        Write-Host "❌ No se encontraron carpetas potenciales del backend." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Seleccione la carpeta del backend:" -ForegroundColor Cyan
    for ($i=0; $i -lt $potentialFolders.Count; $i++) {
        Write-Host "[$i] $($potentialFolders[$i].Name)" -ForegroundColor White
    }
    
    $selection = Read-Host "Ingrese el número de la carpeta (o 'cancel' para cancelar)"
    if ($selection -eq "cancel") {
        Write-Host "❌ Operación cancelada." -ForegroundColor Red
        exit 0
    }
    
    try {
        $apiPath = $potentialFolders[$selection].FullName
    } catch {
        Write-Host "❌ Selección no válida." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Carpeta del backend encontrada en: $apiPath" -ForegroundColor Green

# Buscar el archivo de middleware de autenticación
$middlewarePath = Join-Path -Path $apiPath -ChildPath "src\middleware\auth.js"
if (-not (Test-Path -Path $middlewarePath)) {
    $middlewarePath = Join-Path -Path $apiPath -ChildPath "middleware\auth.js"
}

if (-not (Test-Path -Path $middlewarePath)) {
    Write-Host "🔍 Buscando archivo de middleware de autenticación..." -ForegroundColor Cyan
    $authFiles = Get-ChildItem -Path $apiPath -Recurse -Filter "auth*.js"
    
    if ($authFiles.Count -eq 0) {
        Write-Host "❌ No se encontró el archivo de middleware de autenticación." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Seleccione el archivo de middleware de autenticación:" -ForegroundColor Cyan
    for ($i=0; $i -lt $authFiles.Count; $i++) {
        Write-Host "[$i] $($authFiles[$i].FullName)" -ForegroundColor White
    }
    
    $selection = Read-Host "Ingrese el número del archivo (o 'cancel' para cancelar)"
    if ($selection -eq "cancel") {
        Write-Host "❌ Operación cancelada." -ForegroundColor Red
        exit 0
    }
    
    try {
        $middlewarePath = $authFiles[$selection].FullName
    } catch {
        Write-Host "❌ Selección no válida." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Archivo de middleware encontrado en: $middlewarePath" -ForegroundColor Green

# Leer el contenido del archivo de autenticación
$authContent = Get-Content -Path $middlewarePath -Raw

# Verificar si ya existe la validación de tokens por formato
if ($authContent -match "admin_static_\d{8}_\d{5}_baconfort") {
    Write-Host "✅ El backend ya acepta tokens dinámicos." -ForegroundColor Green
} else {
    # Buscar la sección donde se verifica el token estático
    $pattern = "(if\s*\(\s*token\s*===\s*['\"](admin_static_[^'\"]+)['\"])"
    
    if ($authContent -match $pattern) {
        $oldToken = $Matches[2]
        Write-Host "🔍 Token estático encontrado: $oldToken" -ForegroundColor Cyan
        
        # Reemplazar la validación por una regex
        $newContent = $authContent -replace $pattern, "if (token.match(/^admin_static_\d{8}_\d{5}_baconfort$/)"
        
        # Guardar el archivo modificado
        $newContent | Set-Content -Path $middlewarePath -Force
        
        Write-Host "✅ Middleware actualizado para aceptar tokens dinámicos." -ForegroundColor Green
    } else {
        Write-Host "⚠️ No se encontró la validación de token estático en el archivo." -ForegroundColor Yellow
        Write-Host "   Necesitarás actualizar manualmente el archivo para usar la expresión regular:" -ForegroundColor Yellow
        Write-Host "   /^admin_static_\d{8}_\d{5}_baconfort$/" -ForegroundColor White
    }
}

# Buscar el archivo de controlador de consultas
$inquiriesControllerPath = Join-Path -Path $apiPath -ChildPath "src\controllers\inquiriesController.js"
if (-not (Test-Path -Path $inquiriesControllerPath)) {
    $inquiriesControllerPath = Join-Path -Path $apiPath -ChildPath "controllers\inquiriesController.js"
}

if (-not (Test-Path -Path $inquiriesControllerPath)) {
    Write-Host "🔍 Buscando controlador de consultas..." -ForegroundColor Cyan
    $controllerFiles = Get-ChildItem -Path $apiPath -Recurse -Filter "*inquir*.js"
    
    if ($controllerFiles.Count -eq 0) {
        Write-Host "⚠️ No se encontró el controlador de consultas." -ForegroundColor Yellow
        Write-Host "   Asegúrate de actualizar el controlador para aceptar tokens dinámicos." -ForegroundColor Yellow
    } else {
        Write-Host "Posibles archivos del controlador de consultas:" -ForegroundColor Cyan
        foreach ($file in $controllerFiles) {
            Write-Host "- $($file.FullName)" -ForegroundColor White
        }
    }
}

# Crear un archivo de instrucciones
$instructionsPath = Join-Path -Path $PSScriptRoot -ChildPath "INSTRUCCIONES_BACKEND_TOKEN_DINAMICO.md"
$instructionsContent = @"
# Instrucciones para actualizar el backend para tokens dinámicos

## Contexto
El frontend ha sido actualizado para generar tokens dinámicos en el formato:
```
admin_static_YYYYMMDD_HHmm0_baconfort
```

Ejemplos:
- `admin_static_20250812_17300_baconfort`
- `admin_static_20250812_17400_baconfort`
- `admin_static_20250812_17500_baconfort`

## Cambios necesarios en el backend

### 1. Actualizar el middleware de autenticación
Busca el archivo de middleware que verifica los tokens (generalmente `auth.js` o similar) y reemplaza la validación de token estático:

```javascript
// Cambiar esto:
if (token === 'admin_static_20250812_17200_baconfort') {
  // ...
}

// Por esto:
if (token.match(/^admin_static_\d{8}_\d{5}_baconfort$/)) {
  // ...
}
```

### 2. Actualizar controladores específicos
Si algún controlador (como `inquiriesController.js`) tiene validaciones de token adicionales, actualízalos de la misma manera.

### 3. Pruebas
Verifica que el backend ahora acepta tokens con el formato dinámico:
- Genera un token con el frontend actualizado
- Prueba una petición a `/api/inquiries/admin/all` con este token
- Verifica que no recibas error 403 "Token inválido"

## Expresión regular para validación
La expresión regular que debes usar para validar los tokens es:
```
/^admin_static_\d{8}_\d{5}_baconfort$/
```

Esta expresión valida que el token comience con `admin_static_`, seguido de 8 dígitos (fecha YYYYMMDD), luego un guión bajo, 5 dígitos (tiempo HHmm0) y finalice con `_baconfort`.
"@

$instructionsContent | Set-Content -Path $instructionsPath -Force

Write-Host ""
Write-Host "✅ Se ha creado un archivo con instrucciones en:" -ForegroundColor Green
Write-Host "   $instructionsPath" -ForegroundColor White
Write-Host ""
Write-Host "📋 Por favor, sigue las instrucciones en ese archivo para actualizar el backend" -ForegroundColor Yellow
Write-Host "   si los cambios automáticos no fueron aplicados correctamente." -ForegroundColor Yellow
