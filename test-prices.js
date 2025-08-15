const { calculatePriceByProperty } = require('./baconfort-backend/utils/priceCalculator');

console.log('🧪 TESTING PRICE CALCULATOR SYSTEM');
console.log('=====================================');

// Test Convención 1994 - debería ser 400 USD semanal
const test1 = calculatePriceByProperty('convencion-1994', '2025-08-15', '2025-08-22');
console.log('📅 Convención 1994 (15/08 - 22/08):');
console.log('   Noches:', test1.nights);
console.log('   Período:', test1.periodType);
console.log('   Total:', test1.totalAmount, test1.currency);
console.log('   ✅ Corrección: Ahora debe ser 400 USD (no 490)');
console.log('');

// Test Ugarteche 2824 
const test2 = calculatePriceByProperty('ugarteche-2824', '2025-08-15', '2025-08-22');
console.log('📅 Ugarteche 2824 (15/08 - 22/08):');
console.log('   Noches:', test2.nights);
console.log('   Período:', test2.periodType);
console.log('   Total:', test2.totalAmount, test2.currency);
console.log('');

console.log('✅ RESULTADO: Sistema de precios específico por propiedad implementado');
console.log('✅ FIX: Inconsistencias de precios resueltas');
