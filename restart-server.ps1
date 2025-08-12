#!/usr/bin/env pwsh

# Script para reiniciar el servidor BaconFort y resolver problemas de puertos

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

Write-ColorText "===== REINICIO DEL SERVIDOR BACONFORT =====" -Color $colors.Info
Write-ColorText "Fecha: $(Get-Date)" -Color $colors.Info
Write-ColorText ""

# 1. Verificar si el puerto 5004 está en uso
Write-ColorText "Verificando si el puerto 5004 está en uso..." -Color $colors.Info
$portInUse = $false
try {
    # Verificar si hay procesos usando el puerto 5004
    $processesUsingPort = Get-NetTCPConnection -LocalPort 5004 -ErrorAction SilentlyContinue | 
                          Select-Object -Property LocalPort, OwningProcess
    
    if ($processesUsingPort) {
        $portInUse = $true
        Write-ColorText "El puerto 5004 está siendo utilizado por los siguientes procesos:" -Color $colors.Warning
        
        foreach ($process in $processesUsingPort) {
            $processInfo = Get-Process -Id $process.OwningProcess -ErrorAction SilentlyContinue
            $processName = if ($processInfo) { $processInfo.ProcessName } else { "Desconocido" }
            Write-ColorText "  - PID: $($process.OwningProcess), Proceso: $processName" -Color $colors.Warning
        }
    } else {
        Write-ColorText "El puerto 5004 está disponible" -Color $colors.Success
    }
} catch {
    Write-ColorText "Error verificando el puerto: $_" -Color $colors.Error
}

# 2. Detener procesos existentes en el puerto 5004
if ($portInUse) {
    Write-ColorText "`nDeteniendo procesos que usan el puerto 5004..." -Color $colors.Info
    
    try {
        foreach ($process in $processesUsingPort) {
            $processInfo = Get-Process -Id $process.OwningProcess -ErrorAction SilentlyContinue
            if ($processInfo) {
                Write-ColorText "Deteniendo proceso $($processInfo.ProcessName) (PID: $($process.OwningProcess))..." -Color $colors.Warning
                Stop-Process -Id $process.OwningProcess -Force
                Write-ColorText "Proceso detenido exitosamente" -Color $colors.Success
            }
        }
    } catch {
        Write-ColorText "Error deteniendo procesos: $_" -Color $colors.Error
        Write-ColorText "Intenta ejecutar este script como administrador si los procesos no pueden detenerse" -Color $colors.Warning
    }
} else {
    Write-ColorText "No hay procesos que detener" -Color $colors.Info
}

# 3. Verificar procesos de Node.js en ejecución
Write-ColorText "`nBuscando procesos de Node.js relacionados con BaconFort..." -Color $colors.Info

$nodeProcesses = Get-Process | Where-Object { $_.ProcessName -eq "node" }
if ($nodeProcesses) {
    Write-ColorText "Se encontraron los siguientes procesos de Node.js:" -Color $colors.Info
    
    foreach ($process in $nodeProcesses) {
        # Intentar obtener más información sobre el proceso
        $commandLine = $null
        try {
            $commandLine = (Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($process.Id)").CommandLine
        } catch {
            # Silenciar errores
        }
        
        # Si podemos identificar que es parte de BaconFort, mostrar más detalles
        $isBaconFortProcess = $commandLine -and ($commandLine -like "*baconfort*" -or $commandLine -like "*server.js*")
        
        if ($isBaconFortProcess) {
            Write-ColorText "  - PID: $($process.Id), Memoria: $([math]::Round($process.WorkingSet64 / 1MB, 2)) MB (BaconFort)" -Color $colors.Warning
        } else {
            Write-ColorText "  - PID: $($process.Id), Memoria: $([math]::Round($process.WorkingSet64 / 1MB, 2)) MB" -Color $colors.Info
        }
    }
    
    # Preguntar si desea detener procesos de Node.js
    Write-ColorText "`n¿Deseas detener todos los procesos de Node.js? (S/N)" -Color $colors.Warning
    $answer = Read-Host
    
    if ($answer -eq "S" -or $answer -eq "s") {
        Write-ColorText "Deteniendo todos los procesos de Node.js..." -Color $colors.Warning
        
        try {
            $nodeProcesses | ForEach-Object { 
                Stop-Process -Id $_.Id -Force
                Write-ColorText "Detenido proceso Node.js PID: $($_.Id)" -Color $colors.Success
            }
        } catch {
            Write-ColorText "Error deteniendo procesos de Node.js: $_" -Color $colors.Error
        }
    } else {
        Write-ColorText "No se detendrán los procesos de Node.js" -Color $colors.Info
    }
} else {
    Write-ColorText "No se encontraron procesos de Node.js en ejecución" -Color $colors.Success
}

# 4. Iniciar servidor con puerto alternativo si es necesario
Write-ColorText "`n¿Iniciar el servidor BaconFort ahora? (S/N)" -Color $colors.Info
$startServer = Read-Host

if ($startServer -eq "S" -or $startServer -eq "s") {
    if ($portInUse) {
        # Sugerir un puerto alternativo
        $alternativePort = 5005
        
        Write-ColorText "El puerto 5004 sigue ocupado. ¿Deseas usar el puerto alternativo $alternativePort? (S/N)" -Color $colors.Warning
        $useAlternative = Read-Host
        
        if ($useAlternative -eq "S" -or $useAlternative -eq "s") {
            Write-ColorText "`nIniciando servidor BaconFort en puerto alternativo $alternativePort..." -Color $colors.Info
            
            # Cambiar al directorio del backend
            Set-Location -Path ".\baconfort-backend"
            
            # Iniciar con puerto alternativo
            $env:PORT = $alternativePort
            Start-Process -FilePath "npm" -ArgumentList "start" -NoNewWindow
            
            Write-ColorText "Servidor BaconFort iniciado en puerto $alternativePort" -Color $colors.Success
            Write-ColorText "API disponible en: http://localhost:$alternativePort/api" -Color $colors.Info
        } else {
            Write-ColorText "No se iniciará el servidor" -Color $colors.Warning
        }
    } else {
        Write-ColorText "`nIniciando servidor BaconFort en puerto 5004..." -Color $colors.Info
        
        # Cambiar al directorio del backend
        Set-Location -Path ".\baconfort-backend"
        
        # Iniciar servidor
        Start-Process -FilePath "npm" -ArgumentList "start" -NoNewWindow
        
        Write-ColorText "Servidor BaconFort iniciado en puerto 5004" -Color $colors.Success
        Write-ColorText "API disponible en: http://localhost:5004/api" -Color $colors.Info
    }
} else {
    Write-ColorText "No se iniciará el servidor" -Color $colors.Info
}

Write-ColorText "`n===== PROCESO COMPLETADO =====" -Color $colors.Success
