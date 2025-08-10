param (
    [switch]$SkipDeployment = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🔄 Corrigiendo importaciones inconsistentes de AdminContext..." -ForegroundColor Cyan

# Directorio base
$baseDir = $PSScriptRoot
$reactDir = Join-Path $baseDir "baconfort-react"
$srcDir = Join-Path $reactDir "src"

# Patrones de búsqueda
$importPatterns = @(
    "import { useAdmin } from '../context/AdminContext'",
    "import { useAdmin } from '../context/AdminContext-STATEFUL'",
    "import { useAdmin } from '../../context/AdminContext'",
    "import { useAdmin } from '../../context/AdminContext-STATEFUL'"
)

# Contador de archivos modificados
$modifiedFiles = 0

# Función para actualizar un archivo
function Update-ImportStatements {
    param (
        [string]$filePath
    )
    
    $originalContent = Get-Content -Path $filePath -Raw
    $newContent = $originalContent
    $fileModified = $false
    
    # Determinar el prefijo correcto basado en la estructura de directorios
    $prefix = "../"
    if ($filePath -match "src\\components|src\\hooks") {
        $prefix = "../../"
    }
    
    $replacement = "import { useAdmin } from '$prefix" + "context/AdminContext-FIXED'"
    
    foreach ($pattern in $importPatterns) {
        if ($newContent -match [regex]::Escape($pattern)) {
            Write-Host "🔧 Encontrada importación inconsistente en $filePath" -ForegroundColor Yellow
            $newContent = $newContent -replace [regex]::Escape($pattern), $replacement
            $fileModified = $true
        }
    }
    
    if ($fileModified) {
        Set-Content -Path $filePath -Value $newContent
        Write-Host "✅ Corregida importación en $filePath" -ForegroundColor Green
        return $true
    }
    
    return $false
}

# Buscar archivos JSX y JS en el directorio src
Write-Host "🔍 Buscando archivos JSX y JS..." -ForegroundColor Yellow
$files = Get-ChildItem -Path $srcDir -Recurse -Include "*.jsx", "*.js"

foreach ($file in $files) {
    $modified = Update-ImportStatements -filePath $file.FullName
    if ($modified) {
        $modifiedFiles++
    }
}

Write-Host "✅ Completado: $modifiedFiles archivos actualizados" -ForegroundColor Green

# Crear un registro de cambios
$changelogContent = @"
# Corrección de Importaciones de AdminContext - $(Get-Date -Format "yyyy-MM-dd HH:mm")

## Problema
El error "useAdmin must be used within an AdminProvider" persistía porque algunos componentes
estaban importando useAdmin desde diferentes versiones del AdminContext.

## Cambios realizados
- Se actualizaron las importaciones en $modifiedFiles archivos
- Todas las importaciones de useAdmin ahora apuntan a AdminContext-FIXED.jsx
- Componentes afectados:
  - src/pages/Convencion-1994.jsx
  - src/pages/Dorrego-1548.jsx
  - src/pages/Ugarteche-2824.jsx
  - src/hooks/useProperty.js
  - src/hooks/usePropertyFromContext.js

## Importaciones estandarizadas
```jsx
// Formato correcto
import { useAdmin } from '../context/AdminContext-FIXED';
// O
import { useAdmin } from '../../context/AdminContext-FIXED';
```

## Próximos pasos
- Considerar consolidar todos los archivos de contexto en uno solo
- Remover versiones antiguas y duplicadas de los contextos
"@

$changelogPath = Join-Path $baseDir "CHANGELOG-IMPORTS-FIX.md"
Set-Content -Path $changelogPath -Value $changelogContent

Write-Host "📄 Changelog creado en: $changelogPath" -ForegroundColor Cyan

# Ejecutar build y deploy si no se especifica lo contrario
if (-not $SkipDeployment) {
    Write-Host "🚀 Iniciando proceso de build..." -ForegroundColor Yellow
    
    # Navegar al directorio de React
    Push-Location $reactDir
    
    try {
        # Ejecutar build
        npm run build
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error en el proceso de build" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✅ Build completado exitosamente" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
    
    # Desplegar a Firebase
    Write-Host "🚀 Desplegando a Firebase..." -ForegroundColor Yellow
    Push-Location $baseDir
    
    try {
        firebase deploy --only hosting
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error en el despliegue a Firebase" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✅ Despliegue completado exitosamente" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
    
    # Crear commit
    Write-Host "📝 Realizando commit de los cambios..." -ForegroundColor Yellow
    
    git add .
    git commit -m "Fix: Corregidas importaciones inconsistentes de useAdmin"
    
    # Push a GitHub
    git push origin main
    
    Write-Host "✅ Cambios subidos a GitHub" -ForegroundColor Green
}
else {
    Write-Host "⏭️ Saltando el build y deploy (SkipDeployment=$SkipDeployment)" -ForegroundColor Yellow
}

Write-Host "✅ Proceso completado" -ForegroundColor Green
