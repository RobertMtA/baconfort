// Test directo del componente ForgotPassword-Fixed

// Configuración
const API_URL = 'http://localhost:5004/api';
const EMAIL_TEST = 'test@example.com'; // Cambia esto por un correo válido

async function testDirectForgotPassword() {
  console.log('📝 Iniciando prueba directa de recuperación de contraseña');
  console.log(`📧 Email a probar: ${EMAIL_TEST}`);
  console.log(`🔗 URL de la API: ${API_URL}/auth/forgot-password`);
  
  try {
    console.log('⏳ Enviando solicitud...');
    
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL_TEST })
    });
    
    console.log(`📊 Código de estado: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Solicitud exitosa. Respuesta:', data);
    } else {
      const errorText = await response.text();
      console.error(`❌ Error ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

// Ejecutar la prueba
console.log('🚀 Iniciando prueba...');
testDirectForgotPassword()
  .then(() => console.log('✅ Prueba completada'))
  .catch(err => console.error('❌ Error general:', err));
