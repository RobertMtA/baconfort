# Solución para Errores 403 en Backend Local

## Problema Detectado

Según los logs del navegador, el frontend está utilizando correctamente el token hardcodeado `admin_static_20250812_17200_baconfort` pero el backend local está rechazando este token con un error 403:

```
❌ API Error (403): {success: false, error: 'Token inválido', code: 'TOKEN_INVALID'}
```

Aunque el token se está enviando correctamente:

```
🔑 API: Authorization header completo: Bearer admin_static_20250812_17200_baconfort
```

## Posibles Causas

1. **El backend local utiliza una validación diferente:**
   - Puede estar esperando otro token o formato de token
   - La validación puede ser más estricta que la versión de producción

2. **Falta de parámetros adicionales:**
   - Algunos endpoints pueden requerir parámetros como `admin=true&dev=true`

3. **Problema de configuración local:**
   - El backend local puede tener una configuración específica que rechaza tokens estáticos

## Herramientas de Diagnóstico

He creado dos herramientas para diagnosticar y resolver este problema:

### 1. diagnostico-backend-local.js

Este script prueba diferentes tokens con varios endpoints para identificar cuál funciona mejor con tu backend local. Características:

- Prueba 5 tokens diferentes:
  - El token hardcodeado actual
  - Un token dinámico generado con la fecha actual
  - Un token dinámico con fecha futura
  - El token de emergencia
  - El token usado en los scripts de prueba

- Prueba múltiples endpoints:
  - Listado de propiedades
  - Detalle de una propiedad
  - Información del usuario
  - Consultas administrativas
  - Consultas del usuario

- Genera una matriz de resultados para identificar qué tokens funcionan con qué endpoints

### 2. fix-token-local.js

Este script modifica automáticamente la configuración del backend local para aceptar el token hardcodeado. Características:

- Busca archivos de configuración relevantes en el backend
- Aplica modificaciones para aceptar el token hardcodeado
- Crea archivos de configuración adicionales si es necesario:
  - `config/dev-tokens.js`: Define los tokens aceptados
  - `middleware/admin-auth.js`: Implementa la lógica de validación

## Pasos para Resolver el Problema

1. **Ejecuta el diagnóstico:**
   - Ejecuta `ejecutar-diagnostico-local.bat`
   - Identifica qué token es aceptado por tu backend local

2. **Aplica la solución:**
   - Si el diagnóstico identifica un token que funciona mejor, úsalo
   - O ejecuta `ejecutar-fix-token-local.bat` para modificar el backend

3. **Reinicia el backend:**
   - Detén y reinicia el servidor de backend local

4. **Limpia el localStorage:**
   - Ejecuta en la consola del navegador:
   ```javascript
   localStorage.removeItem('baconfort-token');
   localStorage.removeItem('baconfort_admin_session');
   localStorage.removeItem('baconfort-user');
   localStorage.setItem('baconfort-token', 'admin_static_20250812_17200_baconfort');
   console.log('✅ Token actualizado y caché limpiada');
   ```

5. **Recarga la aplicación**

## Solución para Desarrollo a Largo Plazo

Para una solución más permanente, considera:

1. **Unificar la validación de tokens:**
   - Usa el mismo sistema en desarrollo y producción
   - Documenta claramente los tokens aceptados

2. **Implementar un modo de desarrollo explícito:**
   - Añade una variable de entorno `NODE_ENV=development`
   - Configura el backend para aceptar el token hardcodeado solo en desarrollo

3. **Centralizar la lógica de autenticación:**
   - Crea un middleware de autenticación único
   - Aplícalo consistentemente a todas las rutas protegidas
