# Solución: Error al acceder a la URL de restablecimiento de contraseña

## El problema

Al intentar acceder a la URL de restablecimiento de contraseña `http://localhost:3001/reset-password/TOKEN`, aparece el error:
```
No se puede acceder a este sitio web
La página localhost ha rechazado la conexión.
ERR_CONNECTION_REFUSED
```

## Causas del problema

Este error ocurre por dos posibles razones:
1. El servidor frontend de React no está en ejecución en el puerto 3001
2. La ruta para manejar el token de restablecimiento no estaba correctamente configurada

## Solución implementada

Hemos realizado los siguientes cambios para solucionar el problema:

### 1. Mejora en las rutas de la aplicación
- Añadimos soporte para el formato `/reset-password/:token` en las rutas
- Creamos un componente `ResetPasswordRedirect` para manejar esta URL y redireccionar adecuadamente
- Actualizamos el componente `ResetPassword` para que acepte el token tanto por ruta como por query string

### 2. Script para iniciar el frontend en el puerto correcto
- Creamos `iniciar-frontend-puerto-3001.bat` para garantizar que la aplicación React se inicie en el puerto 3001
- Verificamos que el archivo `.env` tenga configurado correctamente `VITE_FRONTEND_URL=http://localhost:3001`

## Cómo verificar la solución

1. **Reiniciar los servidores**:
   - Detén cualquier instancia de frontend que esté corriendo
   - Ejecuta `iniciar-frontend-puerto-3001.bat` para iniciar el frontend en el puerto 3001
   - Asegúrate de que el backend también esté en ejecución (`cd baconfort-backend && npm start`)

2. **Probar el restablecimiento de contraseña**:
   - Solicita un restablecimiento de contraseña desde la aplicación
   - Copia el enlace del correo electrónico o del token mostrado en desarrollo
   - Pega el enlace en el navegador
   - Deberías ser redirigido a la página de restablecimiento de contraseña

## Notas técnicas

### Funcionamiento de las rutas
La aplicación ahora maneja dos formatos de URL para el restablecimiento de contraseña:
- `/reset-password?token=TOKEN` (formato original)
- `/reset-password/TOKEN` (nuevo formato compatible con los enlaces de correo)

Cuando accedes a `/reset-password/TOKEN`, el componente `ResetPasswordRedirect` detecta el token en la URL y te redirige automáticamente al formato que espera el componente principal.

### Configuración del puerto
Para que los enlaces funcionen correctamente, es crucial que la aplicación React se ejecute en el puerto 3001, ya que:
1. Los correos enviados incluyen enlaces a `http://localhost:3001`
2. El backend está configurado para permitir CORS desde `http://localhost:3001`

Si necesitas cambiar este puerto, deberás actualizar también:
- El archivo `.env` en el frontend
- La configuración CORS en el backend
- La generación de URLs en el servicio de correo

## Problemas comunes y soluciones

1. **El enlace sigue sin funcionar**:
   - Verifica que no haya otra aplicación usando el puerto 3001
   - Asegúrate de que tanto el frontend como el backend estén en ejecución

2. **La página se carga pero no reconoce el token**:
   - Revisa los logs de la consola del navegador para ver si hay errores
   - Verifica que el token no haya expirado (válido por 1 hora)

3. **Error CORS al enviar la nueva contraseña**:
   - Asegúrate de que el backend tenga configurado correctamente CORS para permitir `http://localhost:3001`
