# Solución Completa: Problema de Recuperación de Contraseña

## Diagnóstico del Problema

Hemos identificado que el problema con la funcionalidad "Recuperar Contraseña" se debe principalmente a un problema de **CORS (Cross-Origin Resource Sharing)** y a la complejidad de la implementación actual.

### Causas Identificadas
1. **Problemas de CORS**: El servidor rechaza peticiones desde orígenes no permitidos
2. **Headers Innecesarios**: La inclusión de headers como `Origin` y otros parámetros están causando problemas
3. **Configuración Compleja**: El uso de `mode: 'cors'` y `credentials: 'include'` está complicando la solicitud

## Solución Implementada

Hemos desarrollado una solución en tres partes:

### 1. Servidor de Prueba Simplificado
- Archivo: `test-server.js`
- Funcionalidad: Servidor Express básico con configuración CORS permisiva
- Puerto: 5005 (para evitar conflictos con el servidor principal)
- Ventajas:
  * Permite solicitudes desde cualquier origen
  * Implementa la misma ruta `/auth/forgot-password` para compatibilidad

### 2. Página HTML de Prueba Independiente
- Archivo: `test-recuperacion-password.html`
- Funcionalidad: Formulario simple para probar la funcionalidad sin depender de React
- Ventajas:
  * Permite aislar el problema de CORS de otros posibles problemas en la aplicación React
  * Facilita la depuración mostrando mensajes detallados

### 3. Componente React Mejorado
- Archivo: `ForgotPassword-Fixed.jsx`
- Modificaciones:
  * Simplificación de la solicitud HTTP
  * Eliminación de headers y opciones innecesarias
  * Mejor manejo de errores y retroalimentación al usuario
  * Temporalmente apunta al servidor de prueba para verificar la funcionalidad

## Guía para Implementación Permanente

Para implementar la solución de manera permanente, sigue estos pasos:

### 1. Actualizar la Configuración CORS del Servidor Principal

En el archivo `server.js` del backend, modifica la configuración CORS:

```javascript
// CORS configuration
const corsOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:5173',
  'file://', // Para pruebas con archivos HTML locales
  'null',    // Para algunos navegadores que usan 'null' como origin en archivos locales
  'https://baconfort.netlify.app',
  'https://olive-magpie-874253.hostingersite.com',
  'https://plum-mink-823732.hostingersite.com',
  'https://confort-ba.web.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes sin origin (aplicaciones móviles, Postman, enlaces directos, etc.)
    if (!origin) {
      console.log('✅ CORS: Allowing request without origin (direct access/email links)');
      return callback(null, true);
    }
    
    // Verificar si el origin está en la lista permitida
    if (corsOrigins.filter(Boolean).includes(origin)) {
      console.log('✅ CORS: Allowing whitelisted origin:', origin);
      return callback(null, true);
    }
    
    console.log('❌ CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept',
    'Cache-Control', 
    'Pragma', 
    'Expires',
    'X-Requested-With'
  ],
  optionsSuccessStatus: 204 // 204 en lugar de 200 para navegadores compatibles con preflight
}));
```

### 2. Actualizar el Componente React Principal

Una vez confirmado que la función de recuperación de contraseña funciona con el servidor de prueba, cambia la URL en `ForgotPassword-Fixed.jsx` para que apunte al servidor principal:

```javascript
// Cambiar esta línea:
const url = 'http://localhost:5005/auth/forgot-password';

// Por esta:
const url = `${API_URL}/auth/forgot-password`;
```

### 3. Integrar Permanentemente el Componente Mejorado

El componente `LoginForm.jsx` ya ha sido modificado para usar `ForgotPassword-Fixed.jsx`. Asegúrate de que otros componentes que puedan estar utilizando el componente de recuperación de contraseña también utilicen la versión mejorada.

Específicamente, verifica el archivo `RegisterForm.jsx`, que parece estar usando la versión original:

```javascript
// Cambiar esto:
import ForgotPassword from './ForgotPassword';

// Por esto:
import ForgotPassword from './ForgotPassword-Fixed';
```

### 4. Simplificar la Implementación del API en `api.js`

Si decides seguir usando el servicio API centralizado, simplifica la función `forgotPassword`:

```javascript
forgotPassword: async (email) => {
  try {
    const url = `${API_BASE_URL}/auth/forgot-password`;
    console.log('🔑 API: Enviando solicitud de recuperación:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error en el servidor' }));
      throw new Error(errorData.message || `Error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    throw error;
  }
}
```

## Verificación de la Solución

Para verificar que la solución funciona correctamente:

1. Ejecuta `node test-server.js` para iniciar el servidor de prueba
2. Abre `test-recuperacion-password.html` en tu navegador e intenta enviar una solicitud
3. Verifica que en la consola del servidor aparezca un mensaje como:
   ```
   📧 Solicitud de recuperación recibida para: [tu-email@ejemplo.com]
   ✅ Token generado para [tu-email@ejemplo.com]: [token]
   ```
4. Comprueba que en la página web aparezca un mensaje de éxito

Si todo funciona correctamente con el servidor de prueba, es momento de actualizar tu servidor principal con la configuración CORS sugerida y probar la aplicación React.

## Notas Adicionales

- La solución se ha enfocado en hacer la implementación lo más simple posible para reducir puntos de falla
- Se han eliminado headers y opciones innecesarias que complicaban las solicitudes HTTP
- Para un entorno de producción, considera agregar medidas de seguridad adicionales como rate limiting para la ruta de recuperación de contraseña

Si continúas experimentando problemas después de implementar estas soluciones, considera verificar:
- Registros del servidor para identificar errores específicos
- Configuración de firewalls o proxies que puedan estar interfiriendo
- Plugins del navegador que puedan estar bloqueando las solicitudes
