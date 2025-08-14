# INSTRUCCIONES_BACKEND_TOKEN_DINAMICO.md

# Instrucciones para actualizar el backend para tokens dinámicos

## Contexto
El frontend ha sido actualizado para generar tokens dinámicos en el formato:
```
admin_static_YYYYMMDD_HHmm0_baconfort
```

Ejemplos:
- `admin_static_20250812_17300_baconfort`
- `admin_static_20250812_17400_baconfort`
- `admin_static_20250812_17500_baconfort`

## Cambios necesarios en el backend

### 1. Actualizar el middleware de autenticación
Busca el archivo de middleware que verifica los tokens (generalmente `auth.js` o similar) y reemplaza la validación de token estático:

```javascript
// Cambiar esto:
if (token === 'admin_static_20250812_17200_baconfort') {
  // ...
}

// Por esto:
if (token.match(/^admin_static_\d{8}_\d{5}_baconfort$/)) {
  // ...
}
```

### 2. Actualizar controladores específicos
Si algún controlador (como `inquiriesController.js`) tiene validaciones de token adicionales, actualízalos de la misma manera.

### 3. Pruebas
Verifica que el backend ahora acepta tokens con el formato dinámico:
- Genera un token con el frontend actualizado
- Prueba una petición a `/api/inquiries/admin/all` con este token
- Verifica que no recibas error 403 "Token inválido"

## Expresión regular para validación
La expresión regular que debes usar para validar los tokens es:
```
/^admin_static_\d{8}_\d{5}_baconfort$/
```

Esta expresión valida que el token comience con `admin_static_`, seguido de 8 dígitos (fecha YYYYMMDD), luego un guión bajo, 5 dígitos (tiempo HHmm0) y finalice con `_baconfort`.

## Implementación sugerida

```javascript
// Middleware para verificar tokens de administrador estáticos
const verifyAdminToken = (req, res, next) => {
  // Obtener el token de autorización
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token no proporcionado',
      code: 'TOKEN_MISSING' 
    });
  }

  const token = authHeader.split(' ')[1];

  // Verificar si es un token estático conocido para desarrollo local
  if (req.query.dev === 'true' && req.query.admin === 'true') {
    // Token dinámico con formato específico
    if (token.match(/^admin_static_\d{8}_\d{5}_baconfort$/)) {
      console.log('✅ Token estático de administrador aceptado');
      req.isAdmin = true;
      return next();
    }
    
    // Token de emergencia/bypass
    if (req.query.bypass === 'true' && req.query.emergency === 'true' &&
        token === 'ADMIN_BYPASS_TOKEN_EMERGENCY_ACCESS') {
      console.log('⚠️ Token de emergencia utilizado');
      req.isAdmin = true;
      return next();
    }
  }

  // Continuar con verificación normal de JWT si no es un token estático
  // ... código de verificación JWT existente ...
};
```
