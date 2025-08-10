# BaconFort - Proyecto Desplegado

## Estado del Despliegue

✅ **Frontend**: Desplegado correctamente en Firebase Hosting
- URL: https://confort-ba.web.app

✅ **Backend**: Desplegado correctamente en Railway
- URL: https://baconfort-production-084d.up.railway.app/api

## Instrucciones para futuros despliegues

### Frontend (Firebase)

1. Compilar la aplicación React:
   ```powershell
   cd baconfort-react
   npm run build
   ```

2. Desplegar a Firebase (solo hosting):
   ```powershell
   firebase deploy --only hosting
   ```

### Backend (Railway)

1. Desplegar el backend:
   ```powershell
   cd baconfort-backend
   railway up
   ```

## Características implementadas

- Despliegue en la nube con Firebase (frontend) y Railway (backend)
- Detección automática de entorno para configurar URLs de API
- Manejo mejorado del contexto de administración
- Optimización de localStorage para evitar problemas de quota
- Interfaz de usuario responsiva

## Notas importantes

- El plan actual de Firebase es Spark (gratuito). Para utilizar las Cloud Functions, necesitas actualizar al plan Blaze (pago por uso).
- La URL del backend (`https://baconfort-production-084d.up.railway.app/api`) está configurada correctamente en todos los archivos necesarios.
- El hook `useAdmin` ha sido mejorado con mejor manejo de errores y depuración.

## Futuras mejoras

- Actualizar a plan Blaze de Firebase para habilitar Cloud Functions
- Implementar CDN para imágenes y videos
- Mejorar sistema de caché en cliente
- Optimizar rendimiento de API
- Implementar CI/CD completo

## Solución de problemas

### CORS
Si experimentas problemas de CORS, verifica:
- Las cabeceras en `firebase.json` están configuradas correctamente
- El backend está configurado para aceptar peticiones del dominio de Firebase

### API no accesible
Si el API no responde:
- Verifica que Railway esté funcionando: `railway status`
- Comprueba que la URL en `services/api.js` sea correcta

### Error en la compilación
1. Limpia la caché: `cd baconfort-react && npm run clean`
2. Reinstala dependencias: `npm ci`
3. Vuelve a compilar: `npm run build`
