# Solución Completa a Problemas de Autenticación en Baconfort

## Descripción del Problema

El panel de administración de Baconfort está experimentando errores 403 (Acceso denegado) al intentar acceder a recursos protegidos, específicamente:

```
API Error (403): {success: false, error: 'Token inválido', code: 'TOKEN_INVALID'}
```

El problema ocurre porque hay inconsistencias en los tokens de autenticación utilizados por diferentes partes de la aplicación.

## Causa Raíz

1. **Múltiples Fuentes de Tokens**: 
   - `adminAuth.js` y `api.js` tienen mecanismos independientes para generar tokens
   - Algunas funciones usan tokens hardcodeados mientras otras generan tokens dinámicos

2. **Validación Estricta en Backend**:
   - El backend está configurado para validar un formato específico de token:
   - `admin_static_YYYYMMDD_HHmm0_baconfort`
   - En algunos casos se espera un token exacto: `admin_static_20250812_17200_baconfort`

3. **Inconsistencia en localStorage**:
   - Los tokens almacenados en localStorage pueden ser diferentes a los generados por el código

## Solución Implementada

Hemos creado dos herramientas para resolver este problema:

### 1. Diagnóstico (`diagnostico-autenticacion.js`)

Este script realiza las siguientes comprobaciones:

- Verifica si el token hardcodeado funciona con el backend
- Prueba el token de emergencia para situaciones críticas
- Genera un token dinámico con el formato correcto y lo valida
- Verifica específicamente el endpoint problemático de consultas
- Proporciona código JavaScript para ejecutar en el navegador y limpiar/corregir los tokens

### 2. Corrección Automática (`fix-autenticacion-completo.js`)

Este script aplica las siguientes correcciones:

- Modifica `adminAuth.js` para usar el token hardcodeado correcto
- Actualiza `api.js` para que tanto `getAuthToken()` como `generateStaticAdminToken()` usen el mismo token
- Busca otros archivos que pudieran contener tokens diferentes para revisión manual

## Cómo Ejecutar la Solución

1. **Diagnóstico**:
   - Ejecuta `ejecutar-diagnostico-autenticacion.bat`
   - Revisa el resultado para entender los problemas específicos

2. **Corrección**:
   - Ejecuta `ejecutar-correccion-autenticacion.bat`
   - Verifica que se hayan aplicado los cambios correctamente

3. **En el navegador**:
   - Ejecuta el código JavaScript proporcionado en la consola del navegador para limpiar localStorage
   - Recarga la página y verifica que las llamadas API funcionen correctamente

## Token Correcto

El token que debe usarse en toda la aplicación es:

```
admin_static_20250812_17200_baconfort
```

## Próximos Pasos Recomendados

1. **Refactorizar Sistema de Autenticación**:
   - Centralizar toda la lógica de autenticación en un solo servicio
   - Eliminar la generación dinámica de tokens para el entorno de desarrollo

2. **Mejorar el Backend**:
   - Implementar validación por patrones (regex) en lugar de tokens específicos
   - Añadir más información de depuración en respuestas de error

3. **Implementar Caché de Tokens**:
   - Mantener un token consistente durante toda la sesión
   - Evitar generación frecuente de nuevos tokens
