// diagnostico-forgot-password.js
/**
 * Este script facilita la depuración del componente ForgotPassword
 * y sus interacciones con el backend.
 */

// Configuración
const apiPort = 5004;
const frontendPort = 3000;
const testEmail = 'test@example.com';

// Requisitos
const http = require('http');
const fs = require('fs');
const path = require('path');

// Inicio
console.log('🔍 DIAGNÓSTICO DEL COMPONENTE FORGOT PASSWORD');
console.log('============================================\n');

async function ejecutarDiagnostico() {
  // 1. Verificar conectividad a los puertos
  await verificarPuertos();
  
  // 2. Verificar endpoint de API
  await probarEndpointDirectamente();
  
  // 3. Verificar componente React
  verificarComponenteReact();
  
  // 4. Generar instrucciones para pruebas manuales
  generarInstrucciones();
}

// 1. Verificar conectividad a los puertos
async function verificarPuertos() {
  console.log('1. VERIFICANDO CONECTIVIDAD\n');
  
  // Verificar puerto de backend
  await new Promise(resolve => {
    const socket = require('net').createConnection(apiPort, 'localhost');
    
    socket.on('connect', () => {
      console.log(`✅ Puerto ${apiPort} (Backend API): CONECTADO`);
      socket.destroy();
      resolve();
    });
    
    socket.on('error', (err) => {
      console.log(`❌ Puerto ${apiPort} (Backend API): ERROR - ${err.message}`);
      console.log('   ⚠️ El servidor backend no está activo. Inicia el servidor antes de continuar.');
      resolve();
    });
    
    socket.setTimeout(2000, () => {
      console.log(`⚠️ Puerto ${apiPort} (Backend API): TIMEOUT`);
      socket.destroy();
      resolve();
    });
  });
  
  // Verificar puerto de frontend
  await new Promise(resolve => {
    const socket = require('net').createConnection(frontendPort, 'localhost');
    
    socket.on('connect', () => {
      console.log(`✅ Puerto ${frontendPort} (Frontend): CONECTADO`);
      socket.destroy();
      resolve();
    });
    
    socket.on('error', (err) => {
      console.log(`❌ Puerto ${frontendPort} (Frontend): ERROR - ${err.message}`);
      console.log('   ⚠️ El servidor frontend no está activo. Inicia el frontend antes de continuar.');
      resolve();
    });
    
    socket.setTimeout(2000, () => {
      console.log(`⚠️ Puerto ${frontendPort} (Frontend): TIMEOUT`);
      socket.destroy();
      resolve();
    });
  });
  
  console.log();
}

// 2. Verificar endpoint de API
async function probarEndpointDirectamente() {
  console.log('2. VERIFICANDO ENDPOINT DE RECUPERACIÓN\n');
  
  return new Promise((resolve) => {
    const url = `http://localhost:${apiPort}/api/auth/forgot-password`;
    console.log(`Probando: ${url}`);
    
    const options = {
      hostname: 'localhost',
      port: apiPort,
      path: '/api/auth/forgot-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Origin': `http://localhost:${frontendPort}`,
        'Referer': `http://localhost:${frontendPort}/`
      }
    };
    
    const reqData = JSON.stringify({ email: testEmail });
    console.log(`Datos enviados: ${reqData}`);
    
    const req = http.request(options, (res) => {
      console.log(`Estado: ${res.statusCode} ${res.statusMessage}`);
      console.log(`Headers:`);
      for (const [key, value] of Object.entries(res.headers)) {
        console.log(`  ${key}: ${value}`);
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          console.log(`Respuesta (texto): ${data}`);
          
          if (res.headers['content-type']?.includes('application/json')) {
            const jsonData = JSON.parse(data);
            console.log(`\nRespuesta (JSON):`);
            console.log(JSON.stringify(jsonData, null, 2));
            
            if (jsonData.success) {
              console.log('\n✅ Endpoint respondió correctamente');
              
              if (res.headers['access-control-allow-origin']) {
                console.log(`✅ CORS configurado: ${res.headers['access-control-allow-origin']}`);
              } else {
                console.log(`⚠️ CORS no parece estar configurado en el servidor`);
              }
            } else {
              console.log('\n⚠️ Endpoint respondió con error:', jsonData.error);
            }
          }
        } catch (error) {
          console.log(`❌ Error al procesar la respuesta: ${error.message}`);
        }
        console.log();
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error al conectar con el endpoint: ${error.message}`);
      console.log();
      resolve();
    });
    
    req.write(reqData);
    req.end();
  });
}

// 3. Verificar componente React
function verificarComponenteReact() {
  console.log('3. ANALIZANDO COMPONENTE FORGOT PASSWORD\n');
  
  const componentePath = path.join(__dirname, 'baconfort-react', 'src', 'components', 'Auth', 'ForgotPassword.jsx');
  
  if (fs.existsSync(componentePath)) {
    console.log('✅ Componente ForgotPassword.jsx encontrado');
    
    const content = fs.readFileSync(componentePath, 'utf8');
    
    // Verificar si usa la importación correcta de API_URL
    if (content.includes('import { API_URL }') || content.includes('import { authAPI, API_URL }')) {
      console.log('✅ Importación de API_URL correcta');
    } else {
      console.log('❌ No se encontró la importación correcta de API_URL');
    }
    
    // Verificar si tiene manejo de errores
    if (content.includes('catch (err)') || content.includes('catch (error)')) {
      console.log('✅ Contiene manejo de errores');
    } else {
      console.log('⚠️ No se detectó manejo de errores');
    }
    
    // Verificar si está enviando los datos correctamente
    if (content.includes('JSON.stringify({ email })') || content.includes('JSON.stringify({email})')) {
      console.log('✅ Enviando datos en formato correcto');
    } else {
      console.log('⚠️ Formato de envío de datos no detectado');
    }
    
    // Verificar uso de formatos
    if (content.includes('application/json')) {
      console.log('✅ Content-Type configurado correctamente');
    } else {
      console.log('⚠️ No se detectó configuración de Content-Type');
    }
  } else {
    console.log(`❌ No se pudo encontrar el componente en: ${componentePath}`);
  }
  
  console.log();
}

// 4. Generar instrucciones para pruebas manuales
function generarInstrucciones() {
  console.log('4. INSTRUCCIONES PARA PRUEBAS MANUALES\n');
  
  console.log('Para probar manualmente la recuperación de contraseña, sigue estos pasos:\n');
  console.log('1. Asegúrate de que tanto el backend como el frontend estén ejecutándose:');
  console.log('   - Backend en: http://localhost:5004');
  console.log('   - Frontend en: http://localhost:3000\n');
  
  console.log('2. Abre el archivo HTML de prueba:');
  console.log('   - test-forgot-password.html (puedes abrirlo directamente en el navegador)\n');
  
  console.log('3. Si el componente sigue sin funcionar en la aplicación:');
  console.log('   a. Abre la consola del navegador (F12) mientras intentas recuperar la contraseña');
  console.log('   b. Verifica errores en la consola');
  console.log('   c. Examina el tráfico de red (pestaña Network)\n');
  
  console.log('4. Prueba estas soluciones alternativas:');
  console.log('   a. Limpia la caché del navegador');
  console.log('   b. Usa un navegador diferente');
  console.log('   c. Reinicia los servidores backend y frontend');
  
  console.log('\n✅ Diagnóstico completado');
}

// Ejecutar el diagnóstico
ejecutarDiagnostico().catch(console.error);
