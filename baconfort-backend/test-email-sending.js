// Script para probar el envío de correos electrónicos
require('dotenv').config();
const sendPasswordResetEmail = require('./utils/emailSender');

// Correo de destino para la prueba (cambia esto por tu correo)
const TEST_EMAIL = 'tu_correo@gmail.com';

// Función principal de prueba
async function testEmailSending() {
  console.log('🧪 Iniciando prueba de envío de correo electrónico');
  console.log('📧 Correo de destino:', TEST_EMAIL);
  
  // Verificar configuración
  console.log('\n📝 Verificando configuración:');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO');
  console.log('- EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO');
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
  
  // Generar token de prueba
  const testToken = `test-token-${Date.now()}`;
  console.log('\n🔑 Token de prueba generado:', testToken);
  
  try {
    // Intentar enviar el correo
    console.log('\n⏳ Enviando correo de prueba...');
    const result = await sendPasswordResetEmail(TEST_EMAIL, testToken);
    
    if (result) {
      console.log('\n✅ ¡Correo enviado exitosamente!');
      console.log('Verifica la bandeja de entrada (y la carpeta de spam) de:', TEST_EMAIL);
    } else {
      console.error('\n❌ No se pudo enviar el correo. Revisa los errores anteriores.');
    }
  } catch (error) {
    console.error('\n❌ Error inesperado:', error);
  }
}

// Ejecutar la prueba
testEmailSending()
  .then(() => console.log('\n🏁 Prueba completada'))
  .catch(err => console.error('\n💥 Error general:', err));
