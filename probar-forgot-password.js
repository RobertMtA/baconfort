// probar-forgot-password.js
const http = require('http');

function probarRecuperacionContrasena() {
  const hostname = 'localhost';
  const port = 5004;
  const path = '/api/auth/forgot-password';
  const email = 'test@example.com';

  console.log(`🔄 Probando recuperación de contraseña para: ${email}`);
  console.log(`🔗 URL: http://${hostname}:${port}${path}`);

  const data = JSON.stringify({ email });

  const options = {
    hostname,
    port,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Status: ${res.statusCode} ${res.statusMessage}`);

    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const parsedData = JSON.parse(responseData);
        console.log('📋 Respuesta:', JSON.stringify(parsedData, null, 2));
      } catch (error) {
        console.log('📋 Respuesta (texto):', responseData);
        console.error('⚠️ Error al parsear JSON:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error);
  });

  // Enviar los datos
  req.write(data);
  req.end();
}

probarRecuperacionContrasena();
