/**
 * Script de diagnóstico para la funcionalidad de recuperación de contraseña
 * 
 * Este script prueba directamente la API de recuperación de contraseña
 * para verificar si hay problemas de conexión, CORS u otros errores.
 */

// URL base de la API - ajustar según sea necesario
const API_URL = 'http://localhost:5004/api';

// Función para probar el endpoint de recuperación de contraseña
async function testForgotPassword() {
  console.log('🔍 Iniciando diagnóstico de recuperación de contraseña...');
  console.log(`🌐 Usando API URL: ${API_URL}`);
  
  // Email de prueba
  const testEmail = 'test@example.com';
  console.log(`📧 Email de prueba: ${testEmail}`);
  
  try {
    console.log('🔄 Enviando solicitud...');
    
    // Construimos la URL completa
    const url = `${API_URL}/auth/forgot-password`;
    console.log(`🔗 URL de solicitud: ${url}`);
    
    // Configuración de la solicitud
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email: testEmail }),
      cache: 'no-store',
      credentials: 'include',
      mode: 'cors'
    };
    
    console.log('📤 Opciones de solicitud:', JSON.stringify(requestOptions, null, 2));
    
    // Realizar la solicitud
    const response = await fetch(url, requestOptions);
    
    console.log('🔄 Respuesta recibida');
    console.log(`📊 Estado: ${response.status} ${response.statusText}`);
    console.log('🔤 Headers:');
    
    // Mostrar todos los encabezados
    for (const [key, value] of response.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }
    
    // Obtener el texto de respuesta
    const responseText = await response.text();
    console.log('📝 Texto de respuesta:', responseText);
    
    // Intentar parsear como JSON si es posible
    try {
      const data = JSON.parse(responseText);
      console.log('📋 Datos JSON de respuesta:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('✅ La solicitud fue exitosa');
        if (data.resetToken) {
          console.log('🔑 Token de reseteo (desarrollo):', data.resetToken);
        }
      } else {
        console.log('❌ La solicitud falló:', data.error || 'Error desconocido');
      }
    } catch (parseError) {
      console.error('❌ No se pudo parsear la respuesta como JSON:', parseError.message);
    }
  } catch (error) {
    console.error('❌ Error al realizar la solicitud:', error.message);
    
    // Análisis detallado del error
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      console.error('  ↳ Posible problema de conexión. Verifica que el servidor esté en ejecución.');
    } else if (error.message.includes('NetworkError')) {
      console.error('  ↳ Error de red. Posible problema CORS o servidor no disponible.');
    }
  }
}

// Ejecutar la prueba
testForgotPassword();

// Instrucciones para usar este script:
console.log('\n🛠️ INSTRUCCIONES:');
console.log('1. Ejecutar con "node debug-forgot-password-fetch.js"');
console.log('2. Verificar los resultados en la consola');
console.log('3. Si hay errores CORS o de red, revisar la configuración del servidor');
