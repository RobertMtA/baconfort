# BACONFORT API Server - Guía de Inicio

Esta guía te ayudará a iniciar correctamente el servidor API (backend) de BACONFORT.

## 📋 Opciones para iniciar el servidor

Hay tres formas diferentes de iniciar el servidor backend:

### 1. Método sencillo (Recomendado)

Simplemente haz doble clic en el archivo:

```
iniciar-api-server.bat
```

Este script configurará automáticamente todo lo necesario para iniciar el servidor en el puerto 5004.

### 2. Con PowerShell (Gestión avanzada de puertos)

Si tienes problemas porque el puerto ya está en uso, puedes usar:

```
./start-api-server.ps1
```

Este script PowerShell detectará si el puerto está en uso y te dará opciones para:
- Cerrar el proceso que está usando el puerto
- Iniciar automáticamente en un puerto alternativo

### 3. Manualmente con npm

Si prefieres usar npm directamente:

```
cd baconfort-backend
npm start
```

## 📌 Detalles importantes

- **Puerto predeterminado**: 5004
- **URL de la API**: http://localhost:5004/api
- **Health check**: http://localhost:5004/api/health

## 🔍 Solución de problemas

### El servidor no inicia porque el puerto está en uso

Si ves un error como `EADDRINUSE`, significa que el puerto ya está en uso. Soluciones:

1. Usa el script PowerShell que maneja este problema automáticamente:
   ```
   ./start-api-server.ps1
   ```

2. Cambia el puerto manualmente:
   ```
   set PORT=5005
   npm start
   ```

### Errores 404 Not Found

Si tu aplicación frontend no puede conectarse al servidor, verifica:

1. Que el servidor esté ejecutándose correctamente
2. Que las rutas de la API incluyan el prefijo `/api` correcto
3. Que no haya errores en la consola del servidor

## 🔄 Compatibilidad con rutas sin prefijo /api

Para facilitar la migración, hemos añadido soporte para rutas sin el prefijo `/api`.

Por ejemplo, ambas rutas funcionan:
- ✓ `http://localhost:5004/properties` 
- ✓ `http://localhost:5004/api/properties`

Sin embargo, recomendamos usar siempre el prefijo `/api` para todas las nuevas funcionalidades.
