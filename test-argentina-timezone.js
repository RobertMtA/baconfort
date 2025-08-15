// Test de fechas con zona horaria de Argentina (Buenos Aires)
console.log('🇦🇷 TESTING ARGENTINA TIMEZONE HANDLING');
console.log('Current system timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

// Simular los datos del reporte del usuario con zona horaria de Argentina
const testReservation = {
  checkIn: '2025-08-19',
  checkOut: '2025-08-30',
  propertyName: 'Ugarteche 2824'
};

console.log('\n📅 TEST DATA:', testReservation);

// Función actualizada que usa zona horaria de Argentina
const formatDateArgentina = (dateString) => {
  try {
    if (!dateString) return 'Fecha no especificada';
    
    let date;
    
    // Si la fecha viene en formato ISO (YYYY-MM-DD), crear fecha en zona de Argentina
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      date = new Date(dateString + 'T12:00:00-03:00');
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    // Formatear SIEMPRE usando la zona horaria de Argentina
    return date.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    console.error('Error formateando fecha:', e);
    return 'Fecha inválida';
  }
};

// Función para formato simple DD/MM/YYYY con Argentina
const formatDateSimpleArgentina = (dateString) => {
  try {
    if (!dateString) return 'Fecha no especificada';
    
    let date;
    
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      date = new Date(dateString + 'T12:00:00-03:00');
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    console.error('Error formateando fecha:', e);
    return 'Fecha inválida';
  }
};

// Función para calcular noches con Argentina
const calculateNightsArgentina = (checkIn, checkOut) => {
  try {
    let checkInDate, checkOutDate;
    
    if (typeof checkIn === 'string' && checkIn.match(/^\d{4}-\d{2}-\d{2}$/)) {
      checkInDate = new Date(checkIn + 'T12:00:00-03:00');
    } else {
      checkInDate = new Date(checkIn);
    }
    
    if (typeof checkOut === 'string' && checkOut.match(/^\d{4}-\d{2}-\d{2}$/)) {
      checkOutDate = new Date(checkOut + 'T12:00:00-03:00');
    } else {
      checkOutDate = new Date(checkOut);
    }
    
    if (!isNaN(checkInDate) && !isNaN(checkOutDate)) {
      return Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    }
    return 0;
  } catch (e) {
    console.error('Error calculando noches:', e);
    return 0;
  }
};

console.log('\n🔍 RESULTADOS CON ZONA HORARIA DE ARGENTINA:');
console.log('===============================================');

const checkInFormatted = formatDateArgentina(testReservation.checkIn);
const checkOutFormatted = formatDateArgentina(testReservation.checkOut);
const checkInSimple = formatDateSimpleArgentina(testReservation.checkIn);
const checkOutSimple = formatDateSimpleArgentina(testReservation.checkOut);
const nights = calculateNightsArgentina(testReservation.checkIn, testReservation.checkOut);

console.log('📅 Fecha de entrada (formato completo):', checkInFormatted);
console.log('📅 Fecha de salida (formato completo):', checkOutFormatted);
console.log('📅 Fecha de entrada (DD/MM/YYYY):', checkInSimple);
console.log('📅 Fecha de salida (DD/MM/YYYY):', checkOutSimple);
console.log('🌙 Noches calculadas:', nights);

// Calcular precio con los datos correctos
const CORRECT_PRICES = {
  daily: 45,
  weekly: 400,
  monthly: 991
};

let total = 0;
if (nights >= 7) {
  const weeks = Math.floor(nights / 7);
  const remainingDays = nights % 7;
  total = (weeks * CORRECT_PRICES.weekly) + (remainingDays * CORRECT_PRICES.daily);
  console.log(`💰 Precio calculado: ${weeks} semana${weeks !== 1 ? 's' : ''} x USD $${CORRECT_PRICES.weekly} + ${remainingDays} día${remainingDays !== 1 ? 's' : ''} x USD $${CORRECT_PRICES.daily} = USD $${total}`);
} else {
  total = nights * CORRECT_PRICES.daily;
  console.log(`💰 Precio calculado: ${nights} noche${nights !== 1 ? 's' : ''} x USD $${CORRECT_PRICES.daily} = USD $${total}`);
}

const deposit = Math.round(total * 0.3);
const remaining = Math.round(total * 0.7);

console.log(`💵 Depósito (30%): USD $${deposit}`);
console.log(`💰 Restante (70%): USD $${remaining}`);

console.log('\n📋 RESUMEN FINAL:');
console.log('================');
console.log(`🏠 Propiedad: ${testReservation.propertyName}`);
console.log(`📅 Check-in: ${checkInSimple} (${checkInFormatted})`);
console.log(`📅 Check-out: ${checkOutSimple} (${checkOutFormatted})`);
console.log(`🌙 Duración: ${nights} noche${nights !== 1 ? 's' : ''}`);
console.log(`💰 Total: USD $${total}`);
console.log(`💵 Seña: USD $${deposit}`);

console.log('\n✅ TODAS LAS FECHAS AHORA USAN ZONA HORARIA DE ARGENTINA (Buenos Aires)');
