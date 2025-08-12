// test-forgot-password-frontend.js
const http = require('http');

// Función para simular la petición desde el frontend
function testForgotPasswordFrontend() {
  console.log('🧪 Simulando petición de frontend para recuperación de contraseña');
  
  // Parámetros de conexión
  const options = {
    hostname: 'localhost',
    port: 5004,
    path: '/api/auth/forgot-password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
      'Origin': 'http://localhost:3000',
      'Referer': 'http://localhost:3000/'
    }
  };
  
  // Email para la prueba
  const testEmail = 'test@example.com';
  const data = JSON.stringify({ email: testEmail });
  
  console.log(`📧 Email de prueba: ${testEmail}`);
  console.log(`🔗 URL: http://${options.hostname}:${options.port}${options.path}`);
  
  // Realizar la petición HTTP
  const req = http.request(options, (res) => {
    console.log(`🔄 Status: ${res.statusCode} ${res.statusMessage}`);
    console.log('🔄 Headers:', res.headers);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        if (res.headers['content-type']?.includes('application/json')) {
          const jsonResponse = JSON.parse(responseData);
          console.log('✅ Respuesta (JSON):', JSON.stringify(jsonResponse, null, 2));
          
          if (jsonResponse.success) {
            console.log('✅ La solicitud de recuperación fue exitosa');
            if (jsonResponse.resetToken) {
              console.log('🔑 Token de recuperación (solo en desarrollo):', jsonResponse.resetToken);
            }
          } else {
            console.log('❌ La solicitud falló con un error:', jsonResponse.error || 'Error desconocido');
          }
        } else {
          console.log('📄 Respuesta (texto):', responseData);
        }
      } catch (error) {
        console.error('❌ Error al procesar la respuesta:', error);
        console.log('📄 Respuesta bruta:', responseData);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Error de conexión:', error);
  });
  
  // Enviar los datos
  req.write(data);
  req.end();
  
  console.log('🔄 Petición enviada, esperando respuesta...');
}

// Ejecutar la prueba
testForgotPasswordFrontend();
