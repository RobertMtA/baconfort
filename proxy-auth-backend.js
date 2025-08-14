/**
 * proxy-auth-backend.js
 * 
 * Este script crea un proxy HTTP para interceptar las peticiones al backend local
 * y modificar los tokens de autenticación según sea necesario.
 * 
 * Uso: node proxy-auth-backend.js
 */

const http = require('http');
const httpProxy = require('http-proxy');
const url = require('url');

// Configuración
const TARGET_URL = 'http://localhost:5004';
const PROXY_PORT = 5005;
const VALID_TOKEN = 'admin_static_20250812_17200_baconfort';

// Colores para la consola
const colores = {
  verde: '\x1b[32m',
  rojo: '\x1b[31m',
  amarillo: '\x1b[33m',
  azul: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

console.log(`${colores.azul}===================================================${colores.reset}`);
console.log(`${colores.azul}🔄 PROXY DE AUTENTICACIÓN PARA BACKEND LOCAL${colores.reset}`);
console.log(`${colores.azul}===================================================${colores.reset}`);
console.log(`\n📡 Redireccionando: ${colores.verde}localhost:${PROXY_PORT}${colores.reset} -> ${colores.amarillo}${TARGET_URL}${colores.reset}`);

// Crear proxy
const proxy = httpProxy.createProxyServer({
  target: TARGET_URL,
  changeOrigin: true
});

// Configurar servidor HTTP
const server = http.createServer((req, res) => {
  // Analizar URL
  const parsedUrl = url.parse(req.url, true);
  
  // Verificar token en el encabezado de autenticación
  const authHeader = req.headers.authorization || '';
  const isProtectedRoute = parsedUrl.pathname.includes('/auth/') || 
                           parsedUrl.pathname.includes('/inquiries/') ||
                           parsedUrl.pathname.includes('/admin/');
  
  // Añadir encabezados de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Manejar solicitudes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Información de la petición
  console.log(`\n${colores.amarillo}➡️ ${req.method}${colores.reset} ${parsedUrl.pathname}`);
  
  // Mostrar detalles de la autenticación
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    console.log(`   🔑 Token: ${token.substring(0, 15)}...`);
    
    // Si es el token válido pero una ruta protegida
    if (token === VALID_TOKEN && isProtectedRoute) {
      console.log(`   ${colores.azul}🛠️ Ruta protegida detectada${colores.reset}`);
      
      // Crear nuevo token con fecha dinámica (para hoy)
      const hoy = new Date();
      const año = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, '0');
      const dia = String(hoy.getDate()).padStart(2, '0');
      const hora = String(hoy.getHours()).padStart(2, '0');
      const minutos = Math.floor(hoy.getMinutes() / 10) * 10;
      const minutosFmt = String(minutos).padStart(2, '0') + '0';
      
      const tokenHoy = `admin_static_${año}${mes}${dia}_${hora}${minutosFmt}_baconfort`;
      
      // Reemplazar token
      req.headers.authorization = `Bearer ${tokenHoy}`;
      console.log(`   ${colores.verde}✓ Token reemplazado: ${tokenHoy}${colores.reset}`);
      
      // Añadir parámetros admin y dev
      const nuevoUrl = `${parsedUrl.pathname}${parsedUrl.search ? parsedUrl.search + '&' : '?'}admin=true&dev=true&_timestamp=${Date.now()}`;
      req.url = nuevoUrl;
      console.log(`   ${colores.verde}✓ URL actualizada: ${nuevoUrl}${colores.reset}`);
    }
  } else {
    console.log(`   ${colores.amarillo}⚠️ Sin token de autenticación${colores.reset}`);
  }
  
  // Permitir que el proxy maneje la solicitud
  proxy.web(req, res, {}, (err) => {
    console.log(`${colores.rojo}❌ Error en el proxy: ${err.message}${colores.reset}`);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Error interno del proxy' }));
  });
});

// Capturar respuestas del proxy
proxy.on('proxyRes', (proxyRes, req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Mostrar resultado de la petición
  if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
    console.log(`   ${colores.verde}✅ Respuesta: ${proxyRes.statusCode} ${proxyRes.statusMessage}${colores.reset}`);
  } else {
    console.log(`   ${colores.rojo}❌ Respuesta: ${proxyRes.statusCode} ${proxyRes.statusMessage}${colores.reset}`);
  }
});

// Iniciar servidor
server.listen(PROXY_PORT, () => {
  console.log(`\n${colores.verde}✅ Servidor proxy iniciado en el puerto ${PROXY_PORT}${colores.reset}`);
  console.log(`\n${colores.azul}===================================================${colores.reset}`);
  console.log(`${colores.azul}🔧 INSTRUCCIONES${colores.reset}`);
  console.log(`${colores.azul}===================================================${colores.reset}`);
  console.log(`\n1. Asegúrate de que tu backend esté corriendo en ${TARGET_URL}`);
  console.log(`2. Modifica la URL de tu API en el frontend para usar http://localhost:${PROXY_PORT}/api`);
  console.log(`3. También puedes cambiar temporalmente la URL en la consola del navegador:\n`);
  console.log(`   ${colores.amarillo}// Ejecuta este código en la consola del navegador${colores.reset}`);
  console.log(`   localStorage.setItem('baconfort-api-url', 'http://localhost:${PROXY_PORT}/api');`);
  console.log(`   console.log('✅ URL de API cambiada temporalmente. Recarga la página.');`);
  console.log(`\n${colores.azul}===================================================${colores.reset}`);
  console.log(`\nPresiona Ctrl+C para detener el proxy`);
});
