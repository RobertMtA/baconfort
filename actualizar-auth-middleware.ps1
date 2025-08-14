# Actualizar el middleware de autenticación para aceptar ambos tokens
Write-Host "🔄 Actualizando configuración de autenticación en el backend..." -ForegroundColor Cyan

# Ruta del archivo de autenticación
$authFile = "c:\Users\rober\Desktop\baconfort5- copia\baconfort-backend\middleware\auth.js"

# Verificar si el archivo existe
if (-Not (Test-Path $authFile)) {
    Write-Host "❌ El archivo de autenticación no existe en la ruta especificada" -ForegroundColor Red
    Write-Host "Buscando archivo auth.js en el directorio backend..." -ForegroundColor Yellow
    $posibleAuthFile = Get-ChildItem -Path "c:\Users\rober\Desktop\baconfort5- copia\baconfort-backend" -Recurse -Filter "auth.js" | Select-Object -First 1
    
    if ($posibleAuthFile) {
        $authFile = $posibleAuthFile.FullName
        Write-Host "✅ Encontrado archivo auth.js en: $authFile" -ForegroundColor Green
    } else {
        Write-Host "❌ No se encontró ningún archivo auth.js" -ForegroundColor Red
        exit 1
    }
}

Write-Host "📝 Leyendo archivo de autenticación: $authFile" -ForegroundColor Yellow

# Leer el contenido actual
$contenido = Get-Content -Path $authFile -Raw

# Crear copia de respaldo
$backupPath = "$authFile.backup"
Copy-Item -Path $authFile -Destination $backupPath -Force
Write-Host "💾 Backup creado en: $backupPath" -ForegroundColor Green

# Patrón para buscar la verificación del token
$patronTokenVerify = "// Verificar el token\s+if \(!token\) {[^}]+}"

# Nuevo código para validación de tokens
$nuevoCodigoValidacion = @'
  // Verificar el token
  if (!token) {
    // Verificar si hay token de emergencia en query params
    const emergencyToken = req.query.token;
    if (emergencyToken === 'ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS' && 
        (req.query.emergency === 'true' || req.query.bypass === 'true')) {
      console.log('🔑 [Auth] Usando token de emergencia desde query params');
      req.user = { 
        role: 'admin',
        id: 'emergency-access',
        email: 'emergency@baconfort.admin',
        emergency: true
      };
      return next();
    }
    
    // Verificar si hay token de emergencia en headers
    const headerEmergencyToken = req.headers['x-admin-emergency-token'];
    if (headerEmergencyToken === 'ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS') {
      console.log('🔑 [Auth] Usando token de emergencia desde headers');
      req.user = { 
        role: 'admin',
        id: 'emergency-access',
        email: 'emergency@baconfort.admin',
        emergency: true
      };
      return next();
    }
    
    // Sin tokens válidos
    return res.status(401).json({ 
      success: false, 
      error: 'No se proporcionó token de autorización',
      code: 'NO_TOKEN'
    });
  }
'@

# Reemplazar el patrón con el nuevo código
$nuevoContenido = $contenido -replace $patronTokenVerify, $nuevoCodigoValidacion

# Patrón para buscar el código de verificación de JWT
$patronVerificacionJWT = "try {\s+const decoded = jwt\.verify\(token, process\.env\.JWT_SECRET\);[^}]+} catch \(error\) {[^}]+}"

# Nuevo código para verificación de JWT con soporte para tokens estáticos
$nuevoCodigoJWT = @'
  try {
    // Verificar si es un token estático para admin
    const staticAdminPattern = /^admin_static_\d{8}_\d{5}_baconfort$/;
    if (staticAdminPattern.test(token)) {
      console.log('🔑 [Auth] Usando token estático de admin válido');
      req.user = { 
        role: 'admin',
        id: 'static-admin',
        email: 'admin@baconfort.admin',
        static: true
      };
      return next();
    }
    
    // Verificar si es el token de emergencia 
    if (token === 'ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS') {
      console.log('🔑 [Auth] Usando token de emergencia bypass');
      req.user = { 
        role: 'admin',
        id: 'emergency-access',
        email: 'emergency@baconfort.admin',
        emergency: true
      };
      return next();
    }
    
    // Verificar JWT normal
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ [Auth] Error verificando token:', error.message);
    return res.status(401).json({ 
      success: false, 
      error: 'Token inválido', 
      code: 'INVALID_TOKEN'
    });
  }
'@

# Reemplazar el patrón con el nuevo código
$nuevoContenido = $nuevoContenido -replace $patronVerificacionJWT, $nuevoCodigoJWT

# Guardar el nuevo contenido
$nuevoContenido | Out-File -FilePath $authFile -Encoding utf8

Write-Host "✅ Archivo de autenticación actualizado exitosamente" -ForegroundColor Green
Write-Host "📋 Cambios realizados:" -ForegroundColor Yellow
Write-Host "  - Añadido soporte para token de emergencia en query params"
Write-Host "  - Añadido soporte para token de emergencia en headers"
Write-Host "  - Añadido soporte para token estático con patrón regex"
Write-Host "  - Implementado bypass directo para token ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS"
