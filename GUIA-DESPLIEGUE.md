# Proceso de Despliegue para BaconFort

Este documento describe el proceso para desplegar la aplicación BaconFort, actualizar los repositorios y servicios.

## Prerrequisitos

Asegúrate de tener instalados y configurados:

1. **Node.js** y **npm** (para el build del frontend)
2. **Git** (para commits y push)
3. **Firebase CLI** (`npm install -g firebase-tools` y `firebase login`)
4. **Railway CLI** (`npm install -g @railway/cli` y `railway login`)

## Proceso de despliegue automático

Hemos creado dos scripts para facilitar el proceso de despliegue:

### `actualizar-todo.bat` (o `actualizar-todo.ps1` para PowerShell)

Este script ejecuta todo el proceso de despliegue en un solo paso:

1. **Construye el frontend** (baconfort-react) usando `npm run build`
2. **Copia los archivos** al directorio de build para Firebase
3. **Despliega a Firebase** el frontend usando `firebase deploy --only hosting`
4. **Hace commit y push** a GitHub con los cambios
5. **Despliega el backend** a Railway usando `railway up --detach`

Para usar este script:
1. Haz doble clic en `actualizar-todo.bat` o ejecuta `./actualizar-todo.ps1` en PowerShell
2. Sigue las instrucciones en pantalla

### `verificar-despliegues.bat`

Este script verifica el estado de los despliegues:
1. Muestra el estado actual de Firebase Hosting
2. Muestra el último commit de Git y el estado actual
3. Muestra el estado de la aplicación en Railway

## Proceso manual

Si prefieres hacer el despliegue manualmente, estos son los pasos:

### 1. Construir el frontend

```bash
cd baconfort-react
npm run build
```

### 2. Copiar archivos de build

```bash
cd ..
rm -rf build
cp -r baconfort-react/build ./build
```

### 3. Desplegar a Firebase

```bash
firebase deploy --only hosting
```

### 4. Hacer commit y push a GitHub

```bash
git add .
git commit -m "Tu mensaje de commit"
git push origin main
```

### 5. Desplegar el backend a Railway

```bash
cd baconfort-backend
railway up
```

## Solución de problemas

Si encuentras algún problema durante el despliegue:

1. **Error en el build del frontend**: Verifica que todas las dependencias estén instaladas (`npm install`)
2. **Error en Firebase**: Asegúrate de estar autenticado (`firebase login`)
3. **Error en GitHub**: Verifica tus credenciales y que tengas permisos para push
4. **Error en Railway**: Confirma que estás autenticado (`railway login`) y tienes acceso al proyecto

## Acceso a las aplicaciones desplegadas

- **Frontend**: [https://confort-ba.web.app](https://confort-ba.web.app)
- **Backend API**: Consulta la URL en la consola de Railway o ejecutando `railway status`
