// Test de fechas del backend con zona horaria de Argentina
console.log('🇦🇷 TESTING BACKEND ARGENTINA TIMEZONE HANDLING');

// Simular la función formatDateSafe del backend actualizada
const formatDateSafe = (dateValue) => {
  console.log('🗓️ formatDateSafe: Entrada:', dateValue, typeof dateValue);
  
  try {
    if (!dateValue) {
      console.warn('⚠️ formatDateSafe: Fecha vacía o undefined');
      return 'Fecha no especificada';
    }
    
    let dateObj;
    
    // Si la fecha viene en formato ISO (YYYY-MM-DD), crear fecha en zona de Argentina
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      dateObj = new Date(dateValue + 'T12:00:00-03:00');
      console.log('🗓️ formatDateSafe: Fecha ISO convertida para Argentina:', dateObj);
    } else if (dateValue instanceof Date) {
      dateObj = dateValue;
      console.log('🗓️ formatDateSafe: Ya es Date object:', dateObj);
    } else {
      // Intentar convertir a Date
      dateObj = new Date(dateValue);
      console.log('🗓️ formatDateSafe: Forced conversion:', dateValue, '->', dateObj);
    }
    
    // Verificar que es una fecha válida
    if (isNaN(dateObj.getTime())) {
      console.warn('⚠️ formatDateSafe: Fecha inválida después del parseo:', dateValue, '->', dateObj);
      return 'Fecha inválida';
    }
    
    // Formatear usando zona horaria de Argentina
    const formatted = dateObj.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    console.log('✅ formatDateSafe: Resultado final Argentina:', dateValue, '->', formatted);
    return formatted;
    
  } catch (error) {
    console.error('❌ formatDateSafe: Error formateando fecha:', error, dateValue);
    return 'Error en fecha';
  }
};

// Datos de prueba
const testReservation = {
  checkIn: '2025-08-19',
  checkOut: '2025-08-30',
  propertyName: 'Ugarteche 2824',
  fullName: 'Admin BACONFORT',
  email: 'baconfort.centro@gmail.com'
};

console.log('\n📅 TEST DATA (Backend):', testReservation);

// Simular formateo de fechas como en los emails
const checkInFormatted = formatDateSafe(testReservation.checkIn);
const checkOutFormatted = formatDateSafe(testReservation.checkOut);

console.log('\n📧 FORMATO PARA EMAILS:');
console.log('Check-in:', checkInFormatted);
console.log('Check-out:', checkOutFormatted);

// Simular el contenido del email como se enviaría
console.log('\n📬 CONTENIDO DE EMAIL SIMULADO:');
console.log('=====================================');
console.log(`Estimado/a ${testReservation.fullName},`);
console.log('');
console.log('Tu reserva ha sido procesada:');
console.log(`🏠 Propiedad: ${testReservation.propertyName}`);
console.log(`📅 Fecha de entrada: ${checkInFormatted}`);
console.log(`📅 Fecha de salida: ${checkOutFormatted}`);
console.log('');
console.log('Saludos,');
console.log('Equipo BACONFORT');

console.log('\n✅ BACKEND AHORA USA ZONA HORARIA DE ARGENTINA (Buenos Aires)');
