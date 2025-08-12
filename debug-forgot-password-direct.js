// debug-forgot-password-direct.js
const http = require('http');

// Configuración
const API_HOST = 'localhost';
const API_PORT = 5004;
const API_PATH = '/api/auth/forgot-password';
const TEST_EMAIL = 'test@example.com';

// Datos de la solicitud
const postData = JSON.stringify({
  email: TEST_EMAIL
});

console.log('🔍 Iniciando prueba HTTP directa de recuperación de contraseña');
console.log(`📧 Email de prueba: ${TEST_EMAIL}`);
console.log(`🔗 API Endpoint: http://${API_HOST}:${API_PORT}${API_PATH}`);

// Opciones de la solicitud
const options = {
  hostname: API_HOST,
  port: API_PORT,
  path: API_PATH,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Accept': 'application/json'
  }
};

// Crear la solicitud
const req = http.request(options, (res) => {
  console.log(`🔄 Código de estado: ${res.statusCode}`);
  console.log(`🔄 Mensaje de estado: ${res.statusMessage}`);
  
  // Mostrar headers de respuesta
  console.log('🔄 Headers de respuesta:');
  Object.entries(res.headers).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  // Recopilar datos de respuesta
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  // Procesar respuesta completa
  res.on('end', () => {
    console.log('\n📥 Cuerpo de respuesta:');
    try {
      // Intentar parsear como JSON
      const jsonResponse = JSON.parse(data);
      console.log(JSON.stringify(jsonResponse, null, 2));
      
      // Evaluar éxito/fracaso
      if (res.statusCode === 200 && jsonResponse.success) {
        console.log('\n✅ ÉXITO: El endpoint respondió correctamente');
        if (jsonResponse.resetToken) {
          console.log(`   🔑 Token de reseteo (modo desarrollo): ${jsonResponse.resetToken}`);
        }
      } else {
        console.log('\n⚠️ ADVERTENCIA: La API respondió, pero con estado de error');
        console.log(`   📌 Código de error: ${res.statusCode}`);
        console.log(`   📌 Mensaje: ${jsonResponse.message || jsonResponse.error || 'Sin mensaje'}`);
      }
    } catch (e) {
      // Si no es JSON, mostrar texto plano
      console.log('(Respuesta en texto plano):');
      console.log(data);
      console.log('\n⚠️ ADVERTENCIA: No se pudo parsear la respuesta como JSON');
    }
  });
});

// Manejar errores de conexión
req.on('error', (e) => {
  console.error('\n❌ ERROR DE CONEXIÓN:');
  console.error(`   ${e.message}`);
  
  // Mostrar posibles soluciones
  console.log('\n🔧 POSIBLES SOLUCIONES:');
  console.log('1. Asegúrate de que el servidor de API esté en ejecución');
  console.log(`2. Verifica que el puerto ${API_PORT} sea correcto`);
  console.log('3. Comprueba si hay firewalls bloqueando la conexión');
  console.log('4. Verifica que la ruta del endpoint sea correcta');
});

// Enviar datos
req.write(postData);
req.end();

console.log('🔄 Solicitud enviada, esperando respuesta...\n');
