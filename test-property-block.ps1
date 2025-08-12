# Script PowerShell para probar el bloqueo/desbloqueo de propiedades

param(
    [Parameter(Mandatory=$true)]
    [string]$propertyId,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("block", "unblock", "toggle")]
    [string]$action = "toggle"
)

Write-Host "🔍 Probando propiedad $propertyId" -ForegroundColor Cyan

# Cambiar al directorio del backend
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path -Path $scriptDir -ChildPath "baconfort-backend"
Set-Location -Path $backendDir

# Ejecutar el script de bloqueo/desbloqueo
Write-Host "🔒 Ejecutando toggle-property-block.js..." -ForegroundColor Yellow
node toggle-property-block.js $propertyId $action

# Mensaje informativo
switch ($action) {
    "block" {
        Write-Host "🚫 La propiedad $propertyId ahora está bloqueada" -ForegroundColor Red
    }
    "unblock" {
        Write-Host "✅ La propiedad $propertyId ahora está desbloqueada" -ForegroundColor Green
    }
    "toggle" {
        Write-Host "🔄 El estado de bloqueo de la propiedad $propertyId ha sido invertido" -ForegroundColor Yellow
    }
}

Write-Host "📱 Ahora puedes verificar en el frontend si los cambios se aplican correctamente" -ForegroundColor Cyan
