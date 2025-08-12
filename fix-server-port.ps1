#!/usr/bin/env pwsh

# Script para corregir el problema del puerto en uso en el servidor BaconFort

# Colores para mensajes
$colors = @{
    Info = "Cyan"
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
}

function Write-ColorText {
    param (
        [string]$Text,
        [string]$Color = "White"
    )
    
    Write-Host $Text -ForegroundColor $Color
}

Write-ColorText "===== CORRECCIÓN DEL SERVIDOR BACONFORT =====" -Color $colors.Info
Write-ColorText "Fecha: $(Get-Date)" -Color $colors.Info
Write-ColorText ""

# Verificar que estamos en el directorio correcto
$serverJsPath = ".\baconfort-backend\server.js"
$serverFixPath = ".\baconfort-backend\server-fix.js"

if (-not (Test-Path $serverJsPath)) {
    if (Test-Path ".\server.js") {
        # Ya estamos en el directorio backend
        $serverJsPath = ".\server.js"
        $serverFixPath = ".\server-fix.js"
    } else {
        Write-ColorText "❌ Error: No se encuentra el archivo server.js" -Color $colors.Error
        Write-ColorText "   Asegúrate de ejecutar este script desde la raíz del proyecto" -Color $colors.Error
        exit 1
    }
}

# Buscar la sección de startServer en server.js
Write-ColorText "Buscando función startServer en server.js..." -Color $colors.Info

$serverContent = Get-Content $serverJsPath -Raw

# Verificar si el archivo server-fix.js existe
if (-not (Test-Path $serverFixPath)) {
    Write-ColorText "❌ Error: No se encuentra el archivo server-fix.js" -Color $colors.Error
    exit 1
}

# Obtener el contenido de la corrección
$fixContent = Get-Content $serverFixPath -Raw

# Detectar la sección para reemplazar
$startPattern = '// Función para inicializar el servidor de forma segura'
$endPattern = '// Exportar tanto la app como el emailTransporter para uso en rutas'

if ($serverContent -match "$startPattern(.*?)$endPattern") {
    Write-ColorText "✅ Se encontró la sección a reemplazar" -Color $colors.Success
    
    # Crear una copia de seguridad
    $backupPath = ".\baconfort-backend\server.js.bak"
    Copy-Item $serverJsPath $backupPath
    Write-ColorText "✅ Copia de seguridad creada en: $backupPath" -Color $colors.Success
    
    # Reemplazar la sección
    $newContent = $serverContent -replace "(?s)$startPattern.*?$endPattern", "$fixContent$endPattern"
    
    # Guardar el archivo modificado
    Set-Content $serverJsPath $newContent
    
    Write-ColorText "✅ Archivo server.js corregido exitosamente" -Color $colors.Success
    Write-ColorText "   Ahora puedes iniciar el servidor con: npm start" -Color $colors.Success
    
    # Preguntar si desea iniciar el servidor
    Write-ColorText "`n¿Deseas iniciar el servidor ahora? (S/N)" -Color $colors.Info
    $startNow = Read-Host
    
    if ($startNow -eq "S" -or $startNow -eq "s") {
        # Verificar si el puerto 5004 está en uso
        $portInUse = Get-NetTCPConnection -LocalPort 5004 -ErrorAction SilentlyContinue
        
        if ($portInUse) {
            Write-ColorText "⚠️ El puerto 5004 ya está en uso. Usando puerto alternativo..." -Color $colors.Warning
            
            # Cambiar al directorio del backend
            if ($serverJsPath -eq ".\baconfort-backend\server.js") {
                Set-Location -Path ".\baconfort-backend"
            }
            
            # Iniciar con puerto alternativo
            $env:PORT = 5005
            Write-ColorText "🚀 Iniciando servidor en puerto 5005..." -Color $colors.Success
            npm start
        } else {
            # Cambiar al directorio del backend
            if ($serverJsPath -eq ".\baconfort-backend\server.js") {
                Set-Location -Path ".\baconfort-backend"
            }
            
            # Iniciar servidor
            Write-ColorText "🚀 Iniciando servidor en puerto 5004..." -Color $colors.Success
            npm start
        }
    }
} else {
    Write-ColorText "❌ No se pudo encontrar la sección a reemplazar en server.js" -Color $colors.Error
    Write-ColorText "   Es posible que el archivo haya cambiado. Por favor, realiza la corrección manualmente." -Color $colors.Error
}

Write-ColorText "`n===== PROCESO COMPLETADO =====" -Color $colors.Success
