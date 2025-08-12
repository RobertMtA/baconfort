# Solución para error 403 en API de BaconFort

## Problema detectado

Se ha identificado un error 403 Forbidden al intentar acceder a rutas administrativas en la API:

```
baconfort-production-084d.up.railway.app/api/inquiries/admin/all?status=pending&limit=50&_t=1754865662670&_t=1754865662670:1 
Failed to load resource: the server responded with a status of 403 ()
```

Este error ocurre cuando:
1. Se utiliza un token JWT de usuario normal para acceder a rutas administrativas
2. El token de administrador ha expirado o es inválido
3. Hay una inconsistencia en los tokens utilizados en diferentes partes de la aplicación

## Cambios realizados

Hemos implementado las siguientes mejoras para solucionar este problema:

1. Actualizado los métodos en `AdminContext-STATEFUL.jsx` para usar consistentemente el token de administrador
2. Agregado métodos auxiliares para verificar y refrescar tokens administrativos
3. Implementado mejor manejo de errores de autorización
4. Creado un script de diagnóstico y reparación (`fix-admin-auth.js`)

## Instrucciones para el usuario

### Solución inmediata

Si experimentas el error 403 en el panel de administración, puedes ejecutar el siguiente script en la consola del navegador:

1. Abre la consola del navegador (F12 o Cmd+Opt+I)
2. Copia y pega este código:

```javascript
fetch('/fix-admin-auth.js')
  .then(response => response.text())
  .then(script => {
    console.log('🔧 Ejecutando script de reparación...');
    eval(script);
  })
  .catch(error => console.error('Error cargando script:', error));
```

3. Espera a que el script complete su diagnóstico
4. Recarga la página y verifica que puedas acceder al panel de administración

### Verificación manual

Si necesitas verificar manualmente:

1. Abre la consola del navegador
2. Verifica el token de administrador actual:
   ```javascript
   console.log(localStorage.getItem('admin_token'));
   ```
3. Si no existe o es antiguo, genera uno nuevo:
   ```javascript
   localStorage.setItem('admin_token', `admin_token_${Date.now()}`);
   ```
4. Recarga la página

## Prevención

Para evitar futuros problemas:

1. Asegúrate de usar el token de administrador para rutas administrativas
2. Utiliza los métodos `getAdminAuthHeaders()` y `ensureAdminToken()` añadidos al contexto
3. No mezcles tokens JWT normales con tokens administrativos

## Contacto para soporte

Si continúas experimentando problemas, contacta al equipo de desarrollo en admin@baconfort.com

---

© BaconFort 2025
