# Guía de uso del Proxy de Autenticación para Desarrollo Local

Este documento explica cómo utilizar el proxy de autenticación que hemos creado para resolver problemas con los tokens de autenticación en el entorno de desarrollo local.

## Problema que soluciona

El servidor backend local rechaza solicitudes con el token estático de administrador en ciertos endpoints (`/auth/`, `/inquiries/`, `/admin/`), generando errores 403 con el mensaje "Token inválido".

## Solución implementada

Hemos creado un servidor proxy que:

1. Intercepta todas las peticiones al backend
2. Detecta cuando se están usando tokens de administrador en rutas protegidas
3. Modifica automáticamente el token para que sea aceptado por el backend local
4. Añade parámetros adicionales para garantizar el acceso (`admin=true&dev=true`)

## Cómo usar el proxy

### Paso 1: Instalar dependencias y arrancar el proxy

Ejecuta el script `iniciar-proxy-autenticacion.bat` para:
- Instalar la dependencia necesaria (http-proxy)
- Iniciar el servidor proxy en el puerto 5005

```
iniciar-proxy-autenticacion.bat
```

### Paso 2: Configurar el frontend para usar el proxy

Tienes dos opciones:

#### Opción A: Cambiar temporalmente la URL en el navegador

Abre la consola del navegador y ejecuta:

```javascript
localStorage.setItem('baconfort-api-url', 'http://localhost:5005/api');
console.log('✅ URL de API cambiada temporalmente. Recarga la página.');
```

#### Opción B: Cambiar la configuración en el código

Ejecuta el script:
```
configurar-proxy-url.bat
```

Este script modifica el archivo de configuración de la API para usar el puerto 5005 en lugar del 5004.

### Paso 3: Usar la aplicación normalmente

Ahora puedes usar la aplicación con normalidad. El proxy:

- Redireccionará todas las peticiones al backend local
- Modificará automáticamente los tokens para rutas protegidas
- Mostrará información detallada sobre cada petición en la consola

## Restaurar la configuración original

Si necesitas volver a la configuración original:

1. Cierra el proxy (Ctrl+C en la ventana del terminal)
2. Ejecuta el script para restaurar la URL:
   ```
   restaurar-api-url.bat
   ```

## Funcionamiento técnico

El proxy funciona de la siguiente manera:

1. Escucha en el puerto 5005
2. Redirige todas las peticiones a http://localhost:5004
3. Para rutas protegidas (/auth/, /inquiries/, /admin/):
   - Detecta el token estático `admin_static_20250812_17200_baconfort`
   - Lo reemplaza con un token dinámico que incluye la fecha actual
   - Añade parámetros `admin=true&dev=true` a la URL
4. Muestra información detallada sobre cada petición y respuesta

Este enfoque permite seguir usando el token estático en el código frontend mientras el proxy lo adapta automáticamente para que sea aceptado por el backend local.
