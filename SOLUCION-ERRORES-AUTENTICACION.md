# Solución a Errores de Autenticación en Desarrollo Local

## Problema Detectado

Estás experimentando el siguiente error en desarrollo local:

```
❌ API Error (403): {success: false, error: 'Token inválido', code: 'TOKEN_INVALID'}
```

Este error ocurre porque el backend local rechaza el token estático `admin_static_20250812_17200_baconfort` en ciertos endpoints específicos:
- `/auth/me`
- `/inquiries/my-inquiries`

Sin embargo, el mismo token sí funciona correctamente con los endpoints de propiedades (`/properties`).

## Opciones de Solución

### Opción 1: Usar el Proxy de Autenticación (Recomendado)

El proxy de autenticación intercepta las peticiones y modifica automáticamente los tokens para que sean aceptados por el backend local.

1. **Iniciar el proxy:**
   ```
   .\iniciar-proxy-autenticacion.bat
   ```

2. **Cambiar la URL de la API en la aplicación:**
   - Abre el archivo `herramientas-desarrollo.html` en tu navegador
   - Haz clic en "Usar Proxy de Autenticación"
   - Recarga la aplicación

### Opción 2: Modificar manualmente el archivo .env.development

1. Abre el archivo `baconfort-react\.env.development`
2. Asegúrate de que la URL sea `http://localhost:5005/api`:
   ```
   VITE_API_URL=http://localhost:5005/api
   ```
3. Reinicia el servidor de desarrollo de React

### Opción 3: Cambiar la URL temporalmente en la consola del navegador

En la consola de desarrollador del navegador, ejecuta:
```javascript
localStorage.setItem('baconfort-api-url', 'http://localhost:5005/api');
console.log('✅ URL de API cambiada temporalmente. Recarga la página.');
```

## Cómo Funciona el Proxy

El proxy:
1. Escucha en el puerto 5005
2. Redirige todas las peticiones al backend local (puerto 5004)
3. Para rutas protegidas (/auth/, /inquiries/), modifica el token de autenticación:
   - Detecta el token estático `admin_static_20250812_17200_baconfort`
   - Lo reemplaza con un token que incluye la fecha actual del sistema
   - Añade parámetros `admin=true&dev=true` a la URL

## Restaurar la Configuración Original

Cuando termines:

1. En `herramientas-desarrollo.html`, haz clic en "Restaurar URL Original"
2. O ejecuta en la consola del navegador:
   ```javascript
   localStorage.removeItem('baconfort-api-url');
   ```
3. Cierra el proxy (Ctrl+C en la ventana del terminal)
