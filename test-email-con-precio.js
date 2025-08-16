// Test para verificar email con precio calculado correctamente
const { calculatePriceByProperty } = require('./baconfort-backend/utils/priceCalculator');

console.log('🧮 CALCULANDO PRECIO PARA 10 NOCHES EN UGARTECHE 2824...');

// Datos de la reserva de prueba
const propertyId = 'ugarteche-2824';
const checkIn = '2024-12-20';
const checkOut = '2024-12-30'; // 10 noches
const guestInfo = {
  firstName: 'TEST',
  lastName: 'PRECIO',
  email: 'test@baconfort.com',
  phone: '+541141766377',
  dni: '34352377'
};

// Calcular precio usando el sistema del backend
const priceInfo = calculatePriceByProperty(propertyId, checkIn, checkOut);
console.log('💰 Precio calculado:', priceInfo);

// Simular datos completos para el test
const reservationData = {
  guestInfo,
  checkInDate: checkIn,
  checkOutDate: checkOut,
  propertyId,
  priceInfo, // INCLUIR el priceInfo calculado
  paymentMethod: 'efectivo',
  message: 'Reserva de prueba para verificar que el email muestre correctamente el precio total y la seña requerida.'
};

console.log('\n📧 DATOS PARA EMAIL TEST:');
console.log('=========================');
console.log('Propiedad:', propertyId);
console.log('Noches:', priceInfo?.nights);
console.log('Total:', `USD $${priceInfo?.totalAmount}`);
console.log('Seña 30%:', `USD $${Math.round(priceInfo?.totalAmount * 0.3)}`);

console.log('\n✅ CON ESTOS DATOS EL EMAIL DEBERÍA MOSTRAR:');
console.log('- 💰 Precio Total: USD $450 (10 noches × $45)');
console.log('- 🔒 Seña requerida (30%): USD $135');
console.log('- ⏳ Status: PENDIENTE DE CONFIRMACIÓN');

console.log('\n💡 Para probar, copia estos datos en el payload del test API:');
console.log(JSON.stringify(reservationData, null, 2));
