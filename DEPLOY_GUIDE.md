# BaconFort - Guía de Despliegue a Firebase y Railway

## Descripción
Este documento describe el proceso para desplegar la aplicación BaconFort utilizando Firebase para el frontend y Railway para el backend.

## Requisitos previos
- Node.js 16 o superior
- NPM 7 o superior
- Git
- Cuenta en Firebase
- Cuenta en Railway
- Firebase CLI (`npm install -g firebase-tools`)
- Railway CLI (`npm i -g @railway/cli`)

## Estructura de la aplicación
- **Frontend**: React con Vite (carpeta `/baconfort-react`)
- **Backend**: Node.js/Express (carpeta `/baconfort-backend`)

## Pasos para el despliegue

### 1. Verificar el sistema
Ejecuta el script de verificación para comprobar que tu sistema tiene todo lo necesario:

```bash
# En Linux/Mac
./check-system.sh

# En Windows
.\check-system.ps1
```

### 2. Configuración y despliegue
Utiliza el script automatizado que:
1. Configura las variables de entorno
2. Compila el frontend
3. Realiza commit de los cambios
4. Despliega a Firebase y Railway

```bash
# En Linux/Mac
./commit-and-deploy.sh

# En Windows
.\commit-and-deploy.ps1
```

### 3. Configuración manual (alternativa)

Si prefieres realizar el proceso manualmente:

#### Frontend (Firebase)

1. Configura las variables de entorno:
   ```
   # En baconfort-react/.env.production
   VITE_API_URL=https://tu-backend-en-railway.app
   ```

2. Construye la aplicación:
   ```bash
   cd baconfort-react
   npm run build
   ```

3. Inicializa Firebase (si aún no lo has hecho):
   ```bash
   firebase init
   ```
   - Selecciona "Hosting"
   - Directorio público: `baconfort-react/dist`
   - Configura como SPA: Sí

4. Despliega a Firebase:
   ```bash
   firebase deploy
   ```

#### Backend (Railway)

1. Inicializa Railway en la carpeta del backend:
   ```bash
   cd baconfort-backend
   railway init
   ```

2. Despliega a Railway:
   ```bash
   railway up
   ```

3. Configura las variables de entorno en Railway:
   - `PORT`: 5004
   - `MONGODB_URI`: tu-uri-de-mongodb
   - `JWT_SECRET`: tu-clave-secreta
   - `EMAIL_USER`: tu-email
   - `EMAIL_PASS`: tu-contraseña-de-email

## Estructura de archivos importantes

### Firebase
- `firebase.json` - Configuración de Firebase
- `baconfort-react/dist` - Directorio de compilación

### Railway
- `baconfort-backend/railway.json` - Configuración de Railway
- `baconfort-backend/Procfile` - Configuración para iniciar el servidor

## Solución de problemas

### CORS
Si tienes problemas de CORS:
1. Verifica que `firebase.json` incluya las cabeceras CORS adecuadas
2. Asegúrate de que el backend esté configurado para aceptar solicitudes del dominio de Firebase

### API no accesible
Si el API no es accesible:
1. Verifica que la URL del backend en `VITE_API_URL` sea correcta
2. Comprueba que el servicio en Railway esté funcionando correctamente

### Error en la compilación
1. Limpia la caché: `cd baconfort-react && npm run clean`
2. Reinstala dependencias: `npm ci`
3. Vuelve a compilar: `npm run build`

## Comandos útiles

- **Verificar el estado del backend en Railway**:
  ```bash
  cd baconfort-backend
  railway status
  ```

- **Ver registros del backend**:
  ```bash
  cd baconfort-backend
  railway logs
  ```

- **Probar el sitio de Firebase localmente**:
  ```bash
  firebase serve
  ```
