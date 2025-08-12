// debug-forgot-password.js
// Script para probar directamente la API de recuperación de contraseña

// Importar módulo de HTTP para hacer las solicitudes
const http = require('http');
const https = require('https');

// Configuración de la solicitud
const testEmail = 'test@example.com';
const API_URL = 'http://localhost:5004/api'; // URL local del API

console.log('🔍 Iniciando prueba de recuperación de contraseña...');
console.log(`📧 Email de prueba: ${testEmail}`);
console.log(`🌐 URL de API: ${API_URL}`);

// Función para determinar qué cliente HTTP usar
function getHttpClient(url) {
  return url.startsWith('https:') ? https : http;
}

// Parsear la URL para obtener host, puerto y ruta
function parseUrl(url) {
  if (url.startsWith('http://')) {
    const withoutProtocol = url.substring(7); // quita 'http://'
    const parts = withoutProtocol.split('/');
    const hostPort = parts[0].split(':');
    const host = hostPort[0];
    const port = hostPort.length > 1 ? parseInt(hostPort[1]) : 80;
    const path = '/' + parts.slice(1).join('/');
    return { host, port, path };
  } else if (url.startsWith('https://')) {
    const withoutProtocol = url.substring(8); // quita 'https://'
    const parts = withoutProtocol.split('/');
    const hostPort = parts[0].split(':');
    const host = hostPort[0];
    const port = hostPort.length > 1 ? parseInt(hostPort[1]) : 443;
    const path = '/' + parts.slice(1).join('/');
    return { host, port, path };
  }
  throw new Error('URL debe comenzar con http:// o https://');
}

// Datos a enviar
const data = JSON.stringify({
  email: testEmail
});

// Configurar la solicitud
const { host, port, path } = parseUrl(`${API_URL}/auth/forgot-password`);

const options = {
  hostname: host,
  port: port,
  path: path,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🔄 Configuración de la solicitud:');
console.log(`   - Hostname: ${options.hostname}`);
console.log(`   - Puerto: ${options.port}`);
console.log(`   - Ruta: ${options.path}`);
console.log(`   - Método: ${options.method}`);
console.log(`   - Headers: ${JSON.stringify(options.headers)}`);

// Realizar la solicitud
console.log('📤 Enviando solicitud...');

const httpClient = getHttpClient(API_URL);
const req = httpClient.request(options, (res) => {
  console.log(`🔄 Código de estado: ${res.statusCode}`);
  console.log(`🔄 Headers: ${JSON.stringify(res.headers)}`);

  let responseData = '';

  // Recibir datos
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  // Al finalizar la recepción
  res.on('end', () => {
    console.log('📥 Respuesta completa:');
    try {
      const parsedData = JSON.parse(responseData);
      console.log(JSON.stringify(parsedData, null, 2));
      
      if (res.statusCode === 200 && parsedData.success) {
        console.log('✅ Prueba exitosa: El endpoint de recuperación de contraseña está funcionando correctamente.');
        if (parsedData.resetToken) {
          console.log(`🔑 Token de reseteo (desarrollo): ${parsedData.resetToken}`);
        }
      } else {
        console.log('❌ El endpoint respondió pero con un estado de error o sin éxito.');
      }
    } catch (e) {
      console.log('❌ Error al parsear la respuesta como JSON:');
      console.log(responseData);
      console.error(e);
    }
  });
});

// Manejar errores
req.on('error', (e) => {
  console.error(`❌ Error de conexión: ${e.message}`);
  console.error('Detalles del error:', e);
  
  console.log('\n🔍 Sugerencias de solución:');
  console.log('1. Verifica que el servidor de API esté ejecutándose en http://localhost:5004');
  console.log('2. Comprueba que el endpoint /auth/forgot-password esté implementado correctamente');
  console.log('3. Asegúrate de que no hay problemas de CORS si estás accediendo desde un origen distinto');
  console.log('4. Verifica la conectividad de red y que no haya firewalls bloqueando la conexión');
});

// Enviar datos
req.write(data);
req.end();

console.log('🔄 Solicitud enviada, esperando respuesta...');
