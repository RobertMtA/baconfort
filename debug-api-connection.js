// debug-api-connection.js
const http = require('http');

/**
 * Script para diagnosticar problemas de conectividad con la API
 */

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Configuración
const ports = [5000, 5004, 3000];
const testEndpoints = [
  '/api/health',
  '/api/auth/forgot-password'
];

// Función principal
async function diagnosticarConexion() {
  console.log(`${colors.bright}${colors.blue}=== DIAGNÓSTICO DE CONEXIÓN A LA API ===${colors.reset}\n`);
  console.log(`${colors.yellow}Fecha y hora: ${new Date().toLocaleString()}`);
  console.log(`Sistema: ${process.platform}`);
  
  // 1. Comprobar puertos
  console.log(`\n${colors.bright}${colors.blue}[1] VERIFICANDO PUERTOS ACTIVOS${colors.reset}`);
  
  for (const port of ports) {
    await comprobarPuerto('localhost', port);
  }
  
  // 2. Probar endpoints específicos
  console.log(`\n${colors.bright}${colors.blue}[2] PROBANDO ENDPOINTS${colors.reset}`);
  
  for (const port of [5000, 5004]) { // Solo los puertos de API
    for (const endpoint of testEndpoints) {
      await probarEndpoint('localhost', port, endpoint, endpoint === '/api/auth/forgot-password');
    }
  }
  
  // 3. Prueba específica de forgot-password con datos
  console.log(`\n${colors.bright}${colors.blue}[3] PRUEBA ESPECÍFICA DE RECUPERACIÓN DE CONTRASEÑA${colors.reset}`);
  
  await probarRecuperacionPassword('localhost', 5004);
  
  console.log(`\n${colors.bright}${colors.blue}=== FIN DEL DIAGNÓSTICO ===${colors.reset}`);
}

// Función para comprobar si un puerto está activo
function comprobarPuerto(host, port) {
  return new Promise((resolve) => {
    const socket = new require('net').Socket();
    
    socket.setTimeout(1000);
    socket.on('connect', () => {
      console.log(`${colors.green}✓ Puerto ${port} ACTIVO${colors.reset}`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`${colors.red}✗ Puerto ${port} NO RESPONDE (timeout)${colors.reset}`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log(`${colors.red}✗ Puerto ${port} NO DISPONIBLE (${err.code})${colors.reset}`);
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

// Función para probar un endpoint específico
function probarEndpoint(host, port, endpoint, esPost = false) {
  return new Promise((resolve) => {
    console.log(`\nProbando ${esPost ? 'POST' : 'GET'} http://${host}:${port}${endpoint}`);
    
    const options = {
      hostname: host,
      port,
      path: endpoint,
      method: esPost ? 'POST' : 'GET',
      headers: esPost ? { 'Content-Type': 'application/json' } : {}
    };
    
    const req = http.request(options, (res) => {
      console.log(`${colors.cyan}Estado: ${res.statusCode} ${res.statusMessage}${colors.reset}`);
      console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.headers['content-type']?.includes('application/json')) {
            const jsonData = JSON.parse(data);
            console.log(`${colors.green}Respuesta (JSON): ${JSON.stringify(jsonData, null, 2)}${colors.reset}`);
          } else {
            console.log(`${colors.yellow}Respuesta (texto): ${data.substring(0, 200)}${colors.reset}`);
          }
        } catch (error) {
          console.log(`${colors.red}Error al procesar la respuesta: ${error.message}${colors.reset}`);
          console.log(`Datos brutos: ${data.substring(0, 200)}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`${colors.red}Error de conexión: ${error.message}${colors.reset}`);
      resolve();
    });
    
    req.setTimeout(3000, () => {
      console.log(`${colors.red}Timeout al conectar${colors.reset}`);
      req.abort();
      resolve();
    });
    
    if (esPost) {
      const testData = JSON.stringify({
        email: 'test@example.com'
      });
      req.write(testData);
    }
    
    req.end();
  });
}

// Función específica para probar recuperación de contraseña
function probarRecuperacionPassword(host, port) {
  return new Promise((resolve) => {
    const testEmail = 'test@example.com';
    console.log(`\nProbando recuperación de contraseña para: ${testEmail}`);
    
    const options = {
      hostname: host,
      port,
      path: '/api/auth/forgot-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/94.0.4606.81',
        'Origin': `http://${host}:3000`,
        'Referer': `http://${host}:3000/`
      }
    };
    
    const data = JSON.stringify({ email: testEmail });
    
    const req = http.request(options, (res) => {
      console.log(`${colors.cyan}Estado: ${res.statusCode} ${res.statusMessage}${colors.reset}`);
      console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const contentType = res.headers['content-type'];
          if (contentType?.includes('application/json')) {
            const jsonResponse = JSON.parse(responseData);
            console.log(`${colors.green}Respuesta (JSON): ${JSON.stringify(jsonResponse, null, 2)}${colors.reset}`);
            
            if (jsonResponse.success) {
              console.log(`${colors.green}✓ La solicitud fue exitosa${colors.reset}`);
            } else {
              console.log(`${colors.yellow}⚠ La solicitud falló: ${jsonResponse.error || 'Sin detalle de error'}${colors.reset}`);
            }
          } else {
            console.log(`${colors.yellow}Respuesta (texto): ${responseData.substring(0, 200)}${colors.reset}`);
          }
        } catch (error) {
          console.log(`${colors.red}Error al procesar la respuesta: ${error.message}${colors.reset}`);
          console.log(`Datos brutos: ${responseData.substring(0, 200)}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`${colors.red}Error de conexión: ${error.message}${colors.reset}`);
      resolve();
    });
    
    req.setTimeout(3000, () => {
      console.log(`${colors.red}Timeout al conectar${colors.reset}`);
      req.abort();
      resolve();
    });
    
    req.write(data);
    req.end();
  });
}

// Ejecutar diagnóstico
diagnosticarConexion().catch(console.error);
