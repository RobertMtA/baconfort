# Script para preparar archivos para despliegue manual
$ErrorActionPreference = "Stop"

# Comprobar que estamos en la ubicación correcta
if (-Not (Test-Path -Path "./baconfort-react")) {
    Write-Host "❌ Error: No se encuentra la carpeta baconfort-react. Ejecute este script desde el directorio raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Mensaje de inicio
Write-Host "🔄 Preparando archivos para despliegue manual..." -ForegroundColor Cyan
Write-Host "----------------------------------------------------------" -ForegroundColor Cyan

# Paso 1: Compilar la aplicación React
Write-Host "`n📦 [1/5] Compilando la aplicación React..." -ForegroundColor Cyan
Set-Location -Path "./baconfort-react"
npm run build
Set-Location -Path ".."

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Falló la compilación de React." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Aplicación React compilada correctamente" -ForegroundColor Green

# Paso 2: Verificar archivo ads.txt
Write-Host "`n📄 [2/5] Verificando archivo ads.txt para Google AdSense..." -ForegroundColor Cyan
$adsContent = "google.com, pub-9166920951160128, DIRECT, f08c47fec0942fa0"
$directories = @(
    ".\baconfort-react\dist",
    ".\build"
)
foreach ($dir in $directories) {
    if (Test-Path -Path $dir) {
        $filePath = Join-Path -Path $dir -ChildPath "ads.txt"
        if (Test-Path -Path $filePath) {
            $currentContent = Get-Content -Path $filePath -Raw
            if ($currentContent.Trim() -ne $adsContent.Trim()) {
                Set-Content -Path $filePath -Value $adsContent
                Write-Host "  ✅ Actualizado ads.txt en $dir" -ForegroundColor Green
            } else {
                Write-Host "  ✅ ads.txt verificado en $dir" -ForegroundColor Green
            }
        } else {
            Set-Content -Path $filePath -Value $adsContent
            Write-Host "  ✅ Creado ads.txt en $dir" -ForegroundColor Green
        }
    }
}

# Paso 3: Copiar archivos compilados al directorio build
Write-Host "`n📂 [3/5] Copiando archivos compilados a la carpeta build..." -ForegroundColor Cyan
if (Test-Path -Path "./baconfort-react/dist") {
    Write-Host "Usando la carpeta dist para copiar a build..." -ForegroundColor Yellow
    robocopy "baconfort-react\dist" "build" /E /NFL /NDL /NJH /NJS /nc /ns /np
    if ($LASTEXITCODE -le 7) {
        Write-Host "✅ Archivos copiados correctamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Advertencia: Hubo problemas al copiar algunos archivos" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Error: No se encuentra la carpeta dist. La compilación puede haber fallado." -ForegroundColor Red
    exit 1
}

# Paso 4: Hacer commit de los cambios
Write-Host "`n📤 [4/5] Guardando cambios en GitHub..." -ForegroundColor Cyan

# Solicitar mensaje de commit o usar uno predeterminado
$commitMessage = Read-Host "Introduce un mensaje para el commit (o presiona Enter para usar 'Actualización: preparación para despliegue manual')"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Actualización: preparación para despliegue manual"
}

git add .
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Advertencia: No se pudieron hacer commit de los cambios automáticamente. Puede que no haya cambios para commitear." -ForegroundColor Yellow
} else {
    git push
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Falló al hacer push de los cambios." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Cambios guardados y subidos a GitHub correctamente" -ForegroundColor Green
}

# Paso 5: Crear archivo ZIP para despliegue manual
Write-Host "`n📦 [5/5] Creando archivo ZIP para despliegue manual..." -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipFileName = "baconfort-build-$timestamp.zip"

# Comprimir el directorio build
Compress-Archive -Path ".\build\*" -DestinationPath ".\$zipFileName" -Force

Write-Host "✅ Archivo ZIP creado: $zipFileName" -ForegroundColor Green

# Mensaje final
Write-Host "`n🎉 ¡Preparación completada!" -ForegroundColor Green
Write-Host "--------------------------------" -ForegroundColor Green
Write-Host "Resumen:" -ForegroundColor Green
Write-Host "- ✅ Aplicación React compilada" -ForegroundColor Green
Write-Host "- ✅ Archivo ads.txt verificado" -ForegroundColor Green
Write-Host "- ✅ Archivos copiados al directorio build" -ForegroundColor Green
Write-Host "- ✅ Cambios guardados en GitHub (si había cambios)" -ForegroundColor Green
Write-Host "- ✅ Archivo ZIP creado para despliegue manual: $zipFileName" -ForegroundColor Green

Write-Host "`nInstrucciones para despliegue manual:" -ForegroundColor Cyan
Write-Host "1. Para Firebase: Ve a https://console.firebase.google.com/project/confort-ba/hosting y sube el archivo ZIP generado" -ForegroundColor Cyan
Write-Host "2. Para Railway: Ve a https://railway.app/, selecciona tu proyecto y despliega manualmente" -ForegroundColor Cyan

Write-Host "`nGracias por usar este script de preparación para despliegue manual." -ForegroundColor Yellow
