// Test para verificar que Railway puede enviar emails con el fix de precios
console.log('🧪 PRUEBA FINAL: Reserva con precio calculado automáticamente');

// Simular una reserva real que se haría desde el formulario web
const reservationPayload = {
  propertyId: 'ugarteche-2824',
  propertyName: 'Ugarteche 2824', 
  checkIn: '2025-08-19',
  checkOut: '2025-08-29', // 10 noches
  guests: 1,
  fullName: 'Roberto Gaona Test Final',
  email: 'robertogaona1985@gmail.com',
  phone: '+541141766377',
  dni: '34352377',
  idType: 'dni',
  message: 'Reserva FINAL para probar que el email del admin muestre correctamente: 💰 Precio Total: USD $535 y 🔒 Seña (30%): USD $161',
  paymentMethod: 'efectivo'
};

console.log('\n📧 DATOS DE RESERVA PARA PROBAR:');
console.log('=================================');
console.log('Fechas:', reservationPayload.checkIn, 'a', reservationPayload.checkOut);
console.log('Propiedad:', reservationPayload.propertyName);
console.log('Cliente:', reservationPayload.fullName);
console.log('Email admin esperado:');
console.log('- ⏳ Status: PENDIENTE DE CONFIRMACIÓN');
console.log('- 💰 Precio Total: USD $535');
console.log('- 🔒 Seña (30%): USD $161');
console.log('- 🗓️ Duración: 10 noches');

console.log('\n🎯 RESULTADO ESPERADO:');
console.log('1. Backend calcula automáticamente USD $535 (1 semana $400 + 3 días $135)');
console.log('2. Guarda priceInfo en la base de datos');
console.log('3. Email admin muestra precio y seña correctamente');
console.log('4. Email cliente recibe confirmación con precio');

console.log('\n🚀 Para probar, usa este payload en el formulario web o API:');
console.log(JSON.stringify(reservationPayload, null, 2));
