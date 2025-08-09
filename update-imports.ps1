# Script para actualizar todas las importaciones de AdminContext-STATEFUL a AdminContext-FIXED

Write-Host "🛠️ Actualizando importaciones en componentes..." -ForegroundColor Cyan

# Obtener todos los archivos .jsx en el directorio src
$files = Get-ChildItem -Path ".\baconfort-react\src" -Recurse -Include "*.jsx" -File

foreach ($file in $files) {
    # Leer el contenido del archivo
    $content = Get-Content -Path $file.FullName -Raw
    
    # Reemplazar las importaciones
    $newContent = $content -replace "import { useAdmin } from '../../context/AdminContext-STATEFUL'", "import { useAdmin } from '../../context/AdminContext-FIXED'"
    $newContent = $newContent -replace "import { AdminProvider } from '../../context/AdminContext-STATEFUL'", "import { AdminProvider } from '../../context/AdminContext-FIXED'"
    $newContent = $newContent -replace "import { useAdmin } from '../context/AdminContext-STATEFUL'", "import { useAdmin } from '../context/AdminContext-FIXED'"
    $newContent = $newContent -replace "import { AdminProvider } from '../context/AdminContext-STATEFUL'", "import { AdminProvider } from '../context/AdminContext-FIXED'"
    
    # Guardar el archivo si ha habido cambios
    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "✅ Actualizado: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "✅ Importaciones actualizadas correctamente" -ForegroundColor Magenta
