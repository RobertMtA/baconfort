# Solución del Error 403 en Panel de Administración

## Problema Detectado
El panel de administración estaba recibiendo errores 403 (Acceso denegado) al intentar acceder a la sección de consultas con el mensaje:
```
Error (403): Acceso denegado. Solo administradores pueden ver todas las consultas.
```

## Causa Raíz
Se identificaron varias causas que contribuían al problema:

1. **Tokens Dinámicos Inconsistentes**: 
   - El sistema generaba tokens diferentes cada 10 minutos (basados en intervalos de tiempo)
   - Diferentes partes del código usaban diferentes métodos para generar estos tokens

2. **Inconsistencia en la Autenticación**: 
   - `api.js` usaba una función `generateStaticAdminToken()` que creaba un token basado en tiempo
   - `getAllInquiries()` usaba un token hardcodeado antiguo `'admin_static_20250812_17200_baconfort'`

3. **Validación Estricta en el Backend**:
   - El backend estaba validando un token específico en lugar de un formato

## Solución Implementada

### 1. Unificación de Tokens
Se modificó el método `getAllInquiries()` en `api.js` para usar la misma función `getAuthToken()` que utilizan el resto de las funciones administrativas.

```javascript
// Antes (problema)
const getAllInquiries = async () => {
  try {
    const response = await axios.get(`${API_URL}/inquiries/all?admin=true&dev=true`, {
      headers: {
        'Authorization': `Bearer admin_static_20250812_17200_baconfort`  // Token hardcodeado
      }
    });
    // ...
  }
};

// Después (solución)
const getAllInquiries = async () => {
  try {
    const response = await axios.get(`${API_URL}/inquiries/all?admin=true&dev=true`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`  // Token dinámico consistente
      }
    });
    // ...
  }
};
```

### 2. Actualización de la Documentación del Backend
Se actualizó el archivo `BACKEND_STATIC_TOKENS.md` para especificar que el backend debe aceptar todos los tokens que sigan el patrón:

```
admin_static_YYYYMMDD_HHmm0_baconfort
```

Con la expresión regular:
```javascript
/^admin_static_\d{8}_\d{5}_baconfort$/
```

### 3. Creación de Scripts de Verificación
Se creó un script `verify-admin-token.js` que:
- Genera tokens según el mismo algoritmo que usa la aplicación
- Simula tokens en diferentes horas para verificar su formato
- Comprueba si los tokens generados coinciden con la expresión regular del backend

## Recomendaciones Adicionales

1. **Para el Frontend**:
   - Considerar implementar un sistema de caché de token para que no cambie durante una sesión
   - Centralizar toda la lógica de autenticación en un solo archivo/servicio

2. **Para el Backend**:
   - Implementar la validación por formato usando regex en lugar de comparación directa
   - Registrar los intentos de autenticación para facilitar la depuración

3. **Pruebas**:
   - Realizar pruebas en diferentes horas del día para verificar la consistencia
   - Monitorear los logs del servidor para detectar rechazos de tokens

## Conclusión
La solución implementada asegura que todas las solicitudes administrativas utilicen un token generado de manera consistente, eliminando los errores 403. El backend debe ser actualizado para aceptar tokens en el formato establecido en lugar de un valor específico.
