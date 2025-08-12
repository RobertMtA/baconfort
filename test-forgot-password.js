// Importar node-fetch versión 2
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuración
const API_URL = 'http://localhost:5004/api';
const email = 'prueba@ejemplo.com'; // Cambia esto por un correo real para probar

console.log(`🔍 Probando recuperación de contraseña para: ${email}`);
console.log(`🔗 URL: ${API_URL}/auth/forgot-password`);

async function testForgotPassword() {
  try {
    console.log('⏳ Enviando solicitud...');
    
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    console.log(`📊 Respuesta status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta exitosa:', data);
      
      if (data.resetToken) {
        console.log('🔑 Token generado correctamente (no se muestra por seguridad)');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Error en respuesta:', response.status, errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        console.error('📝 Mensaje de error:', errorData.error || errorData.message);
      } catch {
        console.error('📝 No se pudo parsear el error como JSON');
      }
    }
  } catch (err) {
    console.error('❌ Error de conexión:', err);
  }
}

// Ejecutar la prueba
testForgotPassword();
