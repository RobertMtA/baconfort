# BACONFORT Instrucciones de Despliegue en GitHub Pages

## Configuración realizada para GitHub Pages

Se han realizado las siguientes modificaciones para que el sitio funcione correctamente en GitHub Pages:

1. **Configuración de rutas base**: 
   - Se creó el archivo `src/config/paths.js` que detecta automáticamente si estamos en GitHub Pages y agrega el prefijo `/baconfort/` a todas las rutas.

2. **Modificación del Router**:
   - Se cambió de `BrowserRouter` a `HashRouter` en `App.jsx` para compatibilidad con GitHub Pages.

3. **Configuración de Vite**:
   - Se añadió `base: '/baconfort/'` en el archivo `vite.config.js`.

4. **Carga de imágenes**:
   - Se implementó un sistema de carga de imágenes que agrega automáticamente la ruta base a todas las imágenes.

5. **API**:
   - Se configuró la API para detectar cuando está en GitHub Pages y usar la URL correcta.

## Scripts de despliegue

Se han creado dos scripts para facilitar el despliegue:

- **Windows**: `deploy.ps1` (PowerShell)
- **Linux/Mac**: `deploy.sh` (Bash)

### Para desplegar manualmente:

**Windows**:
```powershell
./deploy.ps1
```

**Linux/Mac**:
```bash
chmod +x ./deploy.sh
./deploy.sh
```

## Despliegue automático con GitHub Actions

También se ha configurado un flujo de trabajo de GitHub Actions que automáticamente despliega la aplicación a GitHub Pages cuando se hace push a la rama `main` o `master`.

El archivo de configuración está en `.github/workflows/deploy.yml`.

## Solución de problemas

Si las imágenes no cargan correctamente después del despliegue, verifica que:

1. La rama `gh-pages` existe y contiene los archivos de la build
2. La configuración de GitHub Pages en tu repositorio apunta a la rama `gh-pages`
3. El archivo `vite.config.js` contiene la configuración correcta con `base: '/baconfort/'`
