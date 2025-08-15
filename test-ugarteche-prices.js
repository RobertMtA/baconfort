const { calculatePriceByProperty } = require('./baconfort-backend/utils/priceCalculator');

console.log('🏠 TESTING UGARTECHE 2824 - PRECIOS CORRECTOS DE PRICECARD');
console.log('═══════════════════════════════════════════════════════════');
console.log('💰 Precios oficiales:');
console.log('   📅 Por día: USD 45 (mínimo 3 noches)');
console.log('   📅 Por semana: USD 400');
console.log('   📅 Por mes: USD 991');
console.log('');

// Test 1: 12 noches (1 semana + 5 días)
console.log('🧪 TEST 1: Reserva de 12 noches (17/08 - 29/08)');
const test12nights = calculatePriceByProperty('ugarteche-2824', '2025-08-17', '2025-08-29');
console.log('   📊 Resultado:');
console.log('   - Noches:', test12nights.nights);
console.log('   - Tipo de tarifa:', test12nights.breakdown.type);
console.log('   - Semanas:', test12nights.breakdown.weeks, 'x USD', test12nights.breakdown.weeklyPrice, '= USD', test12nights.breakdown.weeklyTotal);
console.log('   - Días extra:', test12nights.breakdown.extraDays, 'x USD', test12nights.breakdown.dailyPrice, '= USD', test12nights.breakdown.extraDaysTotal);
console.log('   - TOTAL:', 'USD', test12nights.totalAmount);
console.log('   ✅ Expectativa: USD 625 (400 + 225)');
console.log('   ✅ Resultado:', test12nights.totalAmount === 625 ? 'CORRECTO ✓' : 'INCORRECTO ✗');
console.log('');

// Test 2: 7 noches exactas (1 semana)
console.log('🧪 TEST 2: Reserva de 7 noches exactas (tarifa semanal)');
const test7nights = calculatePriceByProperty('ugarteche-2824', '2025-08-17', '2025-08-24');
console.log('   📊 Resultado:');
console.log('   - Noches:', test7nights.nights);
console.log('   - Tipo de tarifa:', test7nights.breakdown.type);
console.log('   - TOTAL:', 'USD', test7nights.totalAmount);
console.log('   ✅ Expectativa: USD 400 (1 semana exacta)');
console.log('   ✅ Resultado:', test7nights.totalAmount === 400 ? 'CORRECTO ✓' : 'INCORRECTO ✗');
console.log('');

// Test 3: 3 noches (tarifa diaria)
console.log('🧪 TEST 3: Reserva de 3 noches (tarifa diaria)');
const test3nights = calculatePriceByProperty('ugarteche-2824', '2025-08-17', '2025-08-20');
console.log('   📊 Resultado:');
console.log('   - Noches:', test3nights.nights);
console.log('   - Tipo de tarifa:', test3nights.breakdown.type);
console.log('   - TOTAL:', 'USD', test3nights.totalAmount);
console.log('   ✅ Expectativa: USD 135 (3 x 45)');
console.log('   ✅ Resultado:', test3nights.totalAmount === 135 ? 'CORRECTO ✓' : 'INCORRECTO ✗');
console.log('');

console.log('🎯 RESUMEN DE CORRECCIÓN:');
console.log('   ❌ Antes: 12 noches = USD 700 (1 sem x 400 + 5 días x 60)');
console.log('   ✅ Ahora: 12 noches = USD 625 (1 sem x 400 + 5 días x 45)');
console.log('   ✅ Frontend ahora debería mostrar "tarifa semanal" en lugar de "tarifa mensual"');
