/**
 * Debug del problema de inconsistencia de precios
 * Verificar diferencias entre frontend y backend en Ugarteche 2824
 */

console.log('🔍 DEBUG PRECIOS - Ugarteche 2824');

// Fechas del ejemplo del usuario
const checkIn = '2025-08-17';
const checkOut = '2025-08-30';

// Calcular noches
const startDate = new Date(checkIn);
const endDate = new Date(checkOut);
const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

console.log(`📅 Período: ${checkIn} a ${checkOut}`);
console.log(`🌙 Noches: ${nights}`);

// Precios de Ugarteche según el frontend
const frontendPrices = {
  daily: 45,
  weekly: 400,
  monthly: 991,
  currency: 'USD'
};

// Precios de Ugarteche según el backend
const backendPrices = {
  daily: 45,
  weekly: 400,
  monthly: 991,
  currency: 'USD'
};

console.log('💰 Precios configurados:');
console.log('Frontend:', frontendPrices);
console.log('Backend:', backendPrices);

// Cálculo frontend (usando la lógica del hook)
function calculateFrontend(prices, nights) {
  if (nights >= 7) {
    const weeks = Math.floor(nights / 7);
    const remainingDays = nights % 7;
    
    const weeklyTotal = weeks * prices.weekly;
    const dailyTotal = remainingDays * prices.daily;
    const total = weeklyTotal + dailyTotal;
    
    return {
      total,
      breakdown: {
        weeks: { count: weeks, price: prices.weekly, total: weeklyTotal },
        days: remainingDays > 0 ? { count: remainingDays, price: prices.daily, total: dailyTotal } : null
      }
    };
  } else {
    const total = nights * prices.daily;
    return {
      total,
      breakdown: {
        days: { count: nights, price: prices.daily, total }
      }
    };
  }
}

// Cálculo backend (usando la lógica del backend)
function calculateBackend(prices, nights) {
  if (nights >= 7) {
    const weeks = Math.floor(nights / 7);
    const remainingDays = nights % 7;
    
    const weeklyTotal = weeks * prices.weekly;
    const dailyTotal = remainingDays * prices.daily;
    const total = weeklyTotal + dailyTotal;
    
    return {
      total,
      breakdown: {
        type: 'weekly',
        weeks,
        weeklyPrice: prices.weekly,
        weeklyTotal,
        extraDays: remainingDays,
        dailyPrice: prices.daily,
        extraDaysTotal: dailyTotal
      }
    };
  } else {
    const total = nights * prices.daily;
    return {
      total,
      breakdown: {
        type: 'daily',
        nights,
        dailyPrice: prices.daily,
        dailyTotal: total
      }
    };
  }
}

const frontendResult = calculateFrontend(frontendPrices, nights);
const backendResult = calculateBackend(backendPrices, nights);

console.log('\n📊 RESULTADOS:');
console.log('Frontend calculation:', frontendResult);
console.log('Backend calculation:', backendResult);

console.log('\n💵 TOTALES:');
console.log(`Frontend: USD $${frontendResult.total}`);
console.log(`Backend: USD $${backendResult.total}`);

console.log('\n🔍 ANÁLISIS:');
if (frontendResult.total === backendResult.total) {
  console.log('✅ Los cálculos coinciden');
} else {
  console.log('❌ HAY INCONSISTENCIA:', Math.abs(frontendResult.total - backendResult.total), 'USD de diferencia');
}

// Cálculo detallado esperado para 13 noches
console.log('\n🧮 CÁLCULO ESPERADO PARA 13 NOCHES:');
console.log('1 semana (7 días) × USD 400 = USD 400');
console.log('6 días restantes × USD 45 = USD 270');
console.log('TOTAL ESPERADO: USD 670');

// Posibles fuentes del problema
console.log('\n🕵️ POSIBLES CAUSAS DE INCONSISTENCIA:');
console.log('1. Precios diferentes entre frontend y backend');
console.log('2. Lógica de cálculo diferente');
console.log('3. Reserva guardada con precio incorrecto');
console.log('4. Múltiples reservas con precios diferentes');
console.log('5. Cache o datos stale');

// Verificación de logs del usuario
console.log('\n📋 VERIFICAR:');
console.log('- ¿Precio mostrado en formulario antes de enviar?');
console.log('- ¿Precio calculado por el backend al crear reserva?');
console.log('- ¿Precio guardado en la base de datos?');
console.log('- ¿Precio mostrado en la página de pagos?');

export { calculateFrontend, calculateBackend, frontendPrices, backendPrices };
