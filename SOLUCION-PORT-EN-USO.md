# Solución al problema "address already in use" en BaconFort Backend

## El problema

Cuando intentas iniciar el servidor backend de BaconFort, recibes el siguiente error:

```
Error: listen EADDRINUSE: address already in use 0.0.0.0:5004
```

Este error indica que el puerto 5004 ya está siendo utilizado por otro proceso, posiblemente otra instancia del mismo servidor que no se cerró correctamente.

## Soluciones disponibles

He creado varios scripts para ayudarte a resolver este problema:

### Opción 1: Reiniciar el servidor (Recomendada)

Este script detectará qué procesos están usando el puerto 5004, los detendrá y reiniciará el servidor:

```powershell
.\restart-server.ps1
```

### Opción 2: Usar un puerto alternativo

Si no quieres detener los procesos existentes, puedes iniciar el servidor en un puerto alternativo:

```powershell
cd baconfort-backend
$env:PORT=5005
npm start
```

O simplemente:

```powershell
.\baconfort-backend\start-alternative-port.ps1 -Puerto 5005
```

### Opción 3: Corregir el manejo de errores del servidor

Este script modifica el archivo server.js para mejorar el manejo de errores relacionados con el puerto en uso:

```powershell
.\fix-server-port.ps1
```

## Comprobación del estado del servidor

Una vez que hayas iniciado el servidor, puedes verificar su estado visitando:

- http://localhost:5004/api/health (o el puerto que estés usando)

Si ves una respuesta JSON con estado "ok", el servidor está funcionando correctamente.

## Actualización del frontend para usar un puerto alternativo

Si estás utilizando un puerto diferente al 5004, asegúrate de actualizar la configuración del frontend en:

- `.env.development`
- `.env.production`

Cambia la URL de la API para que coincida con el puerto que estás usando.

## Solución permanente

Para evitar este problema en el futuro, considere una de estas opciones:

1. **Configurar un puerto dinámico**: Modifica el archivo `.env` para usar un puerto que no esté en conflicto.
2. **Usar scripts de inicio/parada**: Usa siempre los scripts proporcionados para iniciar/detener el servidor.
3. **Implementar un sistema de gestión de procesos**: Considera usar PM2 o herramientas similares para administrar el servidor Node.js.

## Contacto para soporte

Si sigues experimentando problemas, contacta al equipo de desarrollo en admin@baconfort.com

---

© BaconFort 2025
