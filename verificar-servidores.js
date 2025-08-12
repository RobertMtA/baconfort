// verificar-servidores.js
const http = require('http');
const https = require('https');

console.log('Verificando estado de los servidores...');

// Función para probar una URL
function probarURL(url, descripcion) {
  return new Promise((resolve) => {
    const protocolo = url.startsWith('https') ? https : http;
    const req = protocolo.get(url, (res) => {
      console.log(`✅ ${descripcion}: ${res.statusCode} ${res.statusMessage}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const contentType = res.headers['content-type'];
          if (contentType && contentType.includes('application/json')) {
            const jsonData = JSON.parse(data);
            console.log(`📋 Respuesta (JSON): ${JSON.stringify(jsonData).substring(0, 150)}...`);
          } else {
            console.log(`📋 Respuesta (texto): ${data.substring(0, 150)}...`);
          }
        } catch (error) {
          console.log(`⚠️ Error al procesar la respuesta: ${error.message}`);
        }
        resolve(true);
      });
    }).on('error', (error) => {
      console.log(`❌ Error con ${descripcion}: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`⏱️ Timeout al conectar con ${descripcion}`);
      req.abort();
      resolve(false);
    });
    
    req.setTimeout(5000);
  });
}

// Verificar frontend
async function verificarServidores() {
  console.log('\n🔎 Comprobando servidores...\n');
  
  try {
    // Verificar frontend (React)
    await probarURL('http://localhost:3000', 'Frontend (React)');
    
    // Verificar backend principal
    await probarURL('http://localhost:5004/api/health', 'Backend API principal (puerto 5004)');
    
    // Verificar backend alternativo
    await probarURL('http://localhost:5000/api/health', 'Backend API alternativo (puerto 5000)');
    
    // Verificar endpoint específico de recuperación de contraseña
    console.log('\n🔑 Probando endpoint de recuperación de contraseña:');
    await probarURL('http://localhost:5004/api/auth/forgot-password', 'Endpoint forgot-password (GET - no debería funcionar)');
  
    // Mostrar información para probar manualmente con curl
    console.log('\n📌 Para probar manualmente con curl:');
    console.log('curl -X POST http://localhost:5004/api/auth/forgot-password -H "Content-Type: application/json" -d "{\\\"email\\\":\\\"ejemplo@test.com\\\"}"');
  } catch (error) {
    console.error('❌ Error general:', error);
  }
  
  console.log('\n✅ Verificación completada');
}

verificarServidores();
