# Asegurar que el archivo ads.txt esté presente en todos los directorios necesarios
$ErrorActionPreference = "Stop"

# Definir el contenido del archivo ads.txt
$adsContent = "google.com, pub-9166920951160128, DIRECT, f08c47fec0942fa0"

# Directorios donde debe existir el archivo ads.txt
$directories = @(
    ".\baconfort-react\public",
    ".\baconfort-react\dist",
    ".\build"
)

Write-Host "Verificando y actualizando archivo ads.txt en los directorios necesarios..." -ForegroundColor Cyan

foreach ($dir in $directories) {
    # Verificar si el directorio existe
    if (Test-Path -Path $dir) {
        $filePath = Join-Path -Path $dir -ChildPath "ads.txt"
        
        # Verificar si el archivo existe
        if (Test-Path -Path $filePath) {
            $currentContent = Get-Content -Path $filePath -Raw
            
            # Verificar si el contenido es correcto
            if ($currentContent.Trim() -ne $adsContent.Trim()) {
                Write-Host "Actualizando contenido de $filePath..." -ForegroundColor Yellow
                Set-Content -Path $filePath -Value $adsContent
                Write-Host "✅ Archivo ads.txt actualizado en $dir" -ForegroundColor Green
            } else {
                Write-Host "✅ Archivo ads.txt ya existe con el contenido correcto en $dir" -ForegroundColor Green
            }
        } else {
            # Crear el archivo si no existe
            Write-Host "Creando archivo ads.txt en $dir..." -ForegroundColor Yellow
            Set-Content -Path $filePath -Value $adsContent
            Write-Host "✅ Archivo ads.txt creado en $dir" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️ El directorio $dir no existe. Se omitirá." -ForegroundColor Yellow
    }
}

# Mostrar mensaje final
Write-Host "`n✅ Proceso completado. El archivo ads.txt está presente en todos los directorios necesarios." -ForegroundColor Green
Write-Host "Contenido del archivo ads.txt:" -ForegroundColor Cyan
Write-Host $adsContent -ForegroundColor White
