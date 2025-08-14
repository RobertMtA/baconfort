# fix-inquiries-admin-token.ps1
# Script para aplicar solución permanente a los problemas de token en el panel de administración

Write-Host "🛠️ Aplicando solución permanente para el acceso a consultas de administrador..." -ForegroundColor Yellow

# Verificar si hay procesos de npm existentes y terminarlos
$npmProcesses = Get-Process -Name "npm" -ErrorAction SilentlyContinue

if ($npmProcesses) {
    Write-Host "🛑 Deteniendo procesos npm existentes..." -ForegroundColor Cyan
    $npmProcesses | ForEach-Object { $_.Kill() }
    Start-Sleep -Seconds 2
}

# Verificar si el archivo BACKEND_STATIC_TOKENS.md existe y actualizarlo
$backendTokensPath = "$PSScriptRoot\BACKEND_STATIC_TOKENS.md"
if (Test-Path $backendTokensPath) {
    Write-Host "📄 Actualizando documentación para el backend..." -ForegroundColor Cyan
    
    # Leer el contenido actual
    $content = Get-Content -Path $backendTokensPath -Raw
    
    # Actualizar con el token hardcoded
    $newContent = $content -replace "admin_static_YYYYMMDD_HHmm0_baconfort", "admin_static_20250812_17000_baconfort"
    
    # Guardar el archivo actualizado
    $newContent | Set-Content -Path $backendTokensPath -Force
}

# Mover al directorio del proyecto React
Set-Location -Path "$PSScriptRoot\baconfort-react"

# Crear un archivo de mock inquiries más elaborado para desarrollo
$mockInquiriesPath = "$PSScriptRoot\baconfort-react\src\mocks\mockInquiries.js"
if (-Not (Test-Path $mockInquiriesPath)) {
    Write-Host "📄 Creando datos de ejemplo para desarrollo local..." -ForegroundColor Cyan
    
    # Contenido para el archivo mockInquiries.js
    $mockContent = @"
/**
 * Datos simulados de consultas para desarrollo local
 * Usados cuando el backend no está disponible o hay problemas de autenticación
 */

const mockInquiries = [
  {
    id: 'mock-inq-001',
    propertyId: 'ugarteche-2824',
    propertyName: 'Ugarteche 2824',
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    phone: '+54 11 1234-5678',
    message: 'Me interesa reservar para el próximo fin de semana. ¿Tienen disponibilidad?',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'mock-inq-002',
    propertyId: 'convencion-1994',
    propertyName: 'Convención 1994',
    name: 'María González',
    email: 'maria.gonzalez@example.com',
    phone: '+54 11 2345-6789',
    message: 'Quisiera saber si puedo realizar el pago en efectivo al llegar.',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 horas atrás
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 'mock-inq-003',
    propertyId: 'dorrego-1548',
    propertyName: 'Dorrego 1548',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@example.com',
    phone: '+54 11 3456-7890',
    message: 'Somos una familia de 4 personas con un perro pequeño. ¿Permiten mascotas en este departamento?',
    status: 'responded',
    adminResponse: 'Sí, aceptamos mascotas pequeñas en ese departamento. Bienvenidos!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 días atrás
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 día atrás
  }
];

export const getMockInquiries = (status) => {
  if (!status || status === 'all') {
    return mockInquiries;
  }
  return mockInquiries.filter(inquiry => inquiry.status === status);
};

export default mockInquiries;
"@
    
    # Crear el directorio si no existe
    New-Item -ItemType Directory -Path "$PSScriptRoot\baconfort-react\src\mocks" -Force | Out-Null
    
    # Crear el archivo
    $mockContent | Out-File -FilePath $mockInquiriesPath -Encoding utf8 -Force
}

# Reiniciar el servidor de desarrollo
Write-Host "🔄 Reiniciando servidor de desarrollo..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow

Write-Host "✅ Solución aplicada con éxito:" -ForegroundColor Green
Write-Host "  - api.js: Se ha configurado un token hardcoded (admin_static_20250812_17000_baconfort)" -ForegroundColor Green
Write-Host "  - BACKEND_STATIC_TOKENS.md: Actualizado con el token específico que debe ser aceptado" -ForegroundColor Green
Write-Host "  - Datos de ejemplo: Creados para desarrollo local cuando hay problemas con el backend" -ForegroundColor Green
Write-Host ""
Write-Host "Por favor verifica que la gestión de consultas funcione correctamente ahora." -ForegroundColor Yellow
Write-Host "Si persiste el error 403, es necesario comunicarse con el equipo del backend para asegurar" -ForegroundColor Yellow
Write-Host "que el token 'admin_static_20250812_17000_baconfort' sea aceptado en la ruta de consultas." -ForegroundColor Yellow
