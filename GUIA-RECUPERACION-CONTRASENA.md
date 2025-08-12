# Guía para resolver el problema de recuperación de contraseña

## Problema identificado
El botón "Enviar Instrucciones" en el formulario de recuperación de contraseña no funciona. Después de varias pruebas, se ha identificado que el problema está relacionado con:

1. La configuración CORS del servidor
2. Los parámetros y headers enviados en la solicitud 
3. La URL utilizada para las solicitudes

## Solución paso a paso

### 1. Ejecuta el servidor con configuración CORS permisiva

Hemos creado un script especial para iniciar el servidor backend con una configuración CORS que permite solicitudes desde cualquier origen:

```
iniciar-servidor-cors-permisivo.bat
```

Este script inicia el servidor con la variable `ENABLE_CORS_FIX=true` que activa una configuración CORS más permisiva.

### 2. Verifica que el formulario de recuperación está usando la URL correcta

El componente `ForgotPassword-Fixed.jsx` ha sido actualizado para usar la URL correcta:
- De: `${API_URL}/auth/forgot-password`
- A: `http://localhost:5004/api/auth/forgot-password`

### 3. Prueba el formulario en la aplicación React

1. Inicia la aplicación React con `npm start` en la carpeta `baconfort-react`
2. Navega al formulario de inicio de sesión
3. Haz clic en "¿Olvidaste tu contraseña?"
4. Ingresa un correo electrónico válido
5. Haz clic en "Enviar Instrucciones"

### 4. Verifica los logs del servidor

Si todo está funcionando correctamente, deberías ver en los logs del servidor:
```
📝 POST /auth/forgot-password - Origin: http://localhost:3001
🔄 /auth/forgot-password - Email solicitado: [tu-email]
```

### 5. Opción alternativa: Prueba con el script independiente

Si sigues teniendo problemas, puedes usar nuestro script de prueba:

```
node test-forgot-password.js
```

Este script realizará una solicitud directa a la API sin pasar por React.

## Cambios técnicos implementados

1. **Servidor backend**:
   - Agregamos soporte para encabezado `Accept` en la configuración CORS
   - Creamos una utilidad `fixCorsForDevelopment.js` para habilitar CORS permisivo
   - Modificamos `server.js` para utilizar la configuración CORS mejorada cuando se activa con la variable de entorno

2. **Componente React**:
   - Simplificamos la solicitud HTTP en `ForgotPassword-Fixed.jsx`
   - Cambiamos a URL directa para evitar problemas de construcción de URL
   - Eliminamos opciones innecesarias como `mode: 'cors'` y `credentials: 'include'`

3. **API centralizada**:
   - Simplificamos la función `forgotPassword` en `api.js`
   - Eliminamos parámetros innecesarios como `cache: 'no-store'`
   - Mejoramos el manejo de errores

4. **Herramientas de diagnóstico**:
   - Creamos un script de prueba `test-forgot-password.js`
   - Añadimos logs detallados para facilitar la depuración

## Solución a largo plazo

Una vez que el sistema esté funcionando correctamente, te recomendamos:

1. Volver a la configuración CORS normal (más restrictiva)
2. Actualizar todas las URLs para usar la constante `API_BASE_URL` en lugar de URLs hardcodeadas
3. Asegurarte de que el componente `LoginForm.jsx` y `RegisterForm.jsx` usen la versión mejorada `ForgotPassword-Fixed.jsx`

Estos cambios mejorarán la seguridad y mantenibilidad del código a largo plazo.

## Archivos clave modificados

- `baconfort-backend/server.js` - Configuración CORS mejorada
- `baconfort-backend/utils/fixCorsForDevelopment.js` - Utilidad para CORS permisivo
- `baconfort-react/src/components/Auth/ForgotPassword-Fixed.jsx` - Versión mejorada del componente
- `baconfort-react/src/services/api.js` - Función `forgotPassword` simplificada
- `iniciar-servidor-cors-permisivo.bat` - Script para iniciar el servidor con CORS permisivo
