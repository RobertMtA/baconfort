# Busca y resuelve conflictos de puertos en uso
param(
    [int]$puerto = 5004
)

Write-Host "==============================================="
Write-Host "🔍 Verificando puerto $puerto en uso..."
Write-Host "==============================================="

$procesoUsandoPuerto = Get-NetTCPConnection -LocalPort $puerto -ErrorAction SilentlyContinue | Select-Object -First 1

if ($procesoUsandoPuerto) {
    $pid = $procesoUsandoPuerto.OwningProcess
    $proceso = Get-Process -Id $pid -ErrorAction SilentlyContinue
    
    Write-Host "❌ ALERTA: El puerto $puerto ya está en uso!"
    Write-Host "📊 Proceso: $($proceso.Name) (PID: $pid)"
    
    $respuesta = Read-Host "¿Deseas cerrar el proceso que está usando el puerto? (s/n)"
    
    if ($respuesta -eq "s") {
        try {
            Stop-Process -Id $pid -Force
            Write-Host "✅ Proceso detenido exitosamente."
        } catch {
            Write-Host "❌ Error al intentar detener el proceso: $_"
            return
        }
    } else {
        Write-Host "🔄 Intentando iniciar en puerto alternativo..."
        $puertoAlternativo = $puerto + 1
        Write-Host "🚀 Usando puerto alternativo: $puertoAlternativo"
        
        Set-Location -Path "c:\Users\rober\Desktop\baconfort5- copia\baconfort-backend"
        $env:PORT = $puertoAlternativo
        
        Write-Host "==============================================="
        Write-Host "🚀 Iniciando servidor en puerto alternativo $puertoAlternativo"
        Write-Host "📌 API disponible en: http://localhost:$puertoAlternativo/api"
        Write-Host "==============================================="
        
        Start-Process powershell -ArgumentList "-Command node server.js"
        return
    }
}

# Si llegamos aquí, es porque el puerto está libre o el proceso fue detenido
Write-Host "✅ El puerto $puerto está disponible."

Set-Location -Path "c:\Users\rober\Desktop\baconfort5- copia\baconfort-backend"
$env:PORT = $puerto

Write-Host "==============================================="
Write-Host "🚀 Iniciando servidor en puerto $puerto"
Write-Host "📌 API disponible en: http://localhost:$puerto/api"
Write-Host "==============================================="

node server.js
