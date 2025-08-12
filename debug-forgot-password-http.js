/**
 * Debug script para diagnosticar problemas con la API de recuperación de contraseña
 */

const http = require('http');

// Configuración
const API_HOST = 'localhost';
const API_PORT = 5004;
const API_PATH = '/api/auth/forgot-password';
const TEST_EMAIL = 'test@example.com';

// Crear la solicitud HTTP
const options = {
  hostname: API_HOST,
  port: API_PORT,
  path: API_PATH,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

console.log(`🔍 Iniciando diagnóstico para ${API_HOST}:${API_PORT}${API_PATH}`);

// Cuerpo de la solicitud
const postData = JSON.stringify({
  email: TEST_EMAIL
});

// Ejecutar la solicitud
const req = http.request(options, (res) => {
  console.log(`📊 Código de estado: ${res.statusCode}`);
  console.log('📋 Headers: ', JSON.stringify(res.headers, null, 2));
  
  // Acumular datos
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // Procesar respuesta completa
  res.on('end', () => {
    console.log('📦 Respuesta completa:');
    try {
      const parsedData = JSON.parse(data);
      console.log(JSON.stringify(parsedData, null, 2));
      
      if (parsedData.success) {
        console.log('✅ La API respondió con éxito');
      } else {
        console.log('❌ La API respondió con un error:', parsedData.error);
      }
    } catch (e) {
      console.error('❌ Error al parsear respuesta JSON:', e.message);
      console.log('📄 Texto de respuesta crudo:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Error de solicitud HTTP: ${e.message}`);
});

// Escribir datos al request
req.write(postData);
req.end();

console.log(`📤 Solicitud enviada con email: ${TEST_EMAIL}`);
