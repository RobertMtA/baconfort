/**
 * server-debug.js
 * 
 * Script para ejecutar el servidor backend en modo depuración
 * con validación de tokens flexibilizada para desarrollo.
 * 
 * Uso: node server-debug.js
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Colores para la consola
const colores = {
  verde: '\x1b[32m',
  rojo: '\x1b[31m',
  amarillo: '\x1b[33m',
  azul: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

// Token correcto que estamos usando en el frontend
const TOKEN_CORRECTO = 'admin_static_20250812_17200_baconfort';

// Ruta al backend
const backendPath = path.join(__dirname, 'baconfort-backend');
const serverPath = path.join(backendPath, 'server.js');

/**
 * Función principal
 */
async function ejecutar() {
  console.log(`${colores.azul}===================================================${colores.reset}`);
  console.log(`${colores.azul}🔧 SERVIDOR BACKEND EN MODO DEBUG${colores.reset}`);
  console.log(`${colores.azul}===================================================${colores.reset}`);
  
  // Verificar si existe el backend
  if (!fs.existsSync(backendPath) || !fs.existsSync(serverPath)) {
    console.log(`${colores.rojo}❌ No se encontró el servidor backend en: ${backendPath}${colores.reset}`);
    console.log(`Asegúrate de que el backend esté en la carpeta 'baconfort-backend'.`);
    return;
  }
  
  // Inyectar variable de entorno para debug
  process.env.NODE_ENV = 'development';
  process.env.DEBUG = 'true';
  process.env.ACCEPT_STATIC_TOKEN = 'true';
  process.env.ADMIN_TOKEN = TOKEN_CORRECTO;
  
  console.log(`\n${colores.amarillo}🔧 Configuración de entorno:${colores.reset}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   DEBUG: ${process.env.DEBUG}`);
  console.log(`   ACCEPT_STATIC_TOKEN: ${process.env.ACCEPT_STATIC_TOKEN}`);
  console.log(`   ADMIN_TOKEN: ${process.env.ADMIN_TOKEN}`);
  
  console.log(`\n${colores.verde}🚀 Iniciando servidor backend...${colores.reset}`);
  
  // Ejecutar el servidor
  const servidor = spawn('node', [serverPath], {
    cwd: backendPath,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      DEBUG: 'true',
      ACCEPT_STATIC_TOKEN: 'true',
      ADMIN_TOKEN: TOKEN_CORRECTO
    },
    stdio: 'pipe'
  });
  
  servidor.stdout.on('data', (data) => {
    // Filtrar mensajes de autenticación para resaltarlos
    const texto = data.toString();
    if (texto.includes('token') || texto.includes('auth') || texto.includes('Bearer')) {
      console.log(`${colores.magenta}${texto.trimEnd()}${colores.reset}`);
    } else {
      console.log(texto.trimEnd());
    }
  });
  
  servidor.stderr.on('data', (data) => {
    console.log(`${colores.rojo}${data.toString().trimEnd()}${colores.reset}`);
  });
  
  servidor.on('close', (code) => {
    console.log(`\n${colores.amarillo}⚠️ Servidor finalizado con código: ${code}${colores.reset}`);
  });
  
  console.log(`\n${colores.azul}🔊 Servidor iniciado. Presiona Ctrl+C para detener.${colores.reset}`);
  
  // Crear un patch temporal para interceptar llamadas de autenticación
  const patchTokens = `
// Parche temporal creado por server-debug.js
const originalRequire = module.require;
module.require = function(path) {
  const original = originalRequire.apply(this, arguments);
  
  // Si el módulo cargado parece ser un middleware de autenticación
  if (path.includes('auth') && typeof original === 'function') {
    console.log('🔧 [DEBUG] Interceptando posible middleware de autenticación:', path);
    
    // Crear un wrapper para el middleware
    const wrappedMiddleware = function(req, res, next) {
      // Si tiene el token correcto, permitir acceso
      const authHeader = req.headers.authorization || req.headers['authorization'];
      if (authHeader && authHeader.includes('${TOKEN_CORRECTO}')) {
        console.log('✅ [DEBUG] Aceptando token hardcodeado para desarrollo');
        req.isAuthenticated = true;
        req.isAdmin = true;
        return next();
      }
      
      // De lo contrario, ejecutar el middleware original
      return original.apply(this, arguments);
    };
    
    // Copiar propiedades del middleware original
    Object.keys(original).forEach(key => {
      wrappedMiddleware[key] = original[key];
    });
    
    return wrappedMiddleware;
  }
  
  return original;
};

// Implementar sobrecarga de validación de token
process.env.NODE_ENV = 'development';
process.env.DEBUG = 'true';
process.env.ACCEPT_STATIC_TOKEN = 'true';
process.env.ADMIN_TOKEN = '${TOKEN_CORRECTO}';

console.log('🔧 [DEBUG] Patch de autenticación cargado - Token permitido: ${TOKEN_CORRECTO}');
`;

  // Escribir el archivo patch
  const patchPath = path.join(backendPath, 'debug-auth-patch.js');
  fs.writeFileSync(patchPath, patchTokens);
  console.log(`\n${colores.amarillo}⚠️ Para una mejor compatibilidad con el token, añade esta línea al inicio de server.js:${colores.reset}`);
  console.log(`   require('./debug-auth-patch.js');`);
  console.log(`\n${colores.amarillo}⚠️ O reinicia el servidor y ejecuta:${colores.reset}`);
  console.log(`   node server.js --debug-auth`);
}

// Manejar salida
process.on('SIGINT', () => {
  console.log(`\n${colores.azul}🛑 Deteniendo servidor...${colores.reset}`);
  process.exit();
});

// Ejecutar
ejecutar().catch(error => {
  console.error(`${colores.rojo}❌ ERROR: ${error.message}${colores.reset}`);
});
