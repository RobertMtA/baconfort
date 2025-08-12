# Reiniciar el servidor backend para solucionar problemas de recuperación de contraseña

# Detener el servidor actual (buscar por puerto 5004)
$processes = Get-Process | Where-Object {$_.CommandLine -like "*node*" -and $_.CommandLine -like "*5004*"}
foreach ($process in $processes) {
    Write-Host "Deteniendo proceso: $($process.Id) - $($process.Name)"
    Stop-Process -Id $process.Id -Force
}

# Esperar a que se libere el puerto
Start-Sleep -Seconds 2

# Iniciar el servidor en una nueva ventana
$serverPath = "c:\Users\rober\Desktop\baconfort5- copia\baconfort-backend"
$command = "cd `"$serverPath`" && node server.js"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $command

Write-Host "Servidor reiniciado. Por favor espere unos segundos antes de probar nuevamente."
