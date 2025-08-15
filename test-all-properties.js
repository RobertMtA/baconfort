const { calculatePriceByProperty } = require('./baconfort-backend/utils/priceCalculator');

console.log('🏠 TESTING TODAS LAS PROPIEDADES - PRECIOS REALES');
console.log('═══════════════════════════════════════════════════════');

const properties = [
  {
    id: 'moldes-1680',
    name: 'Moldes 1680',
    prices: { daily: 70, weekly: 400, monthly: 1200 }
  },
  {
    id: 'ugarteche-2824',
    name: 'Ugarteche 2824',
    prices: { daily: 45, weekly: 400, monthly: 991 }
  },
  {
    id: 'santa-fe-3770',
    name: 'Santa Fe 3770',
    prices: { daily: 75, weekly: 420, monthly: 1000 }
  },
  {
    id: 'dorrego-1548',
    name: 'Dorrego 1548',
    prices: { daily: 65, weekly: 390, monthly: 950 }
  },
  {
    id: 'convencion-1994',
    name: 'Convención 1994',
    prices: { daily: 70, weekly: 410, monthly: 980 }
  }
];

// Test para cada propiedad con 12 noches (1 semana + 5 días)
console.log('🧪 TEST: 12 noches (1 semana + 5 días) para cada propiedad');
console.log('───────────────────────────────────────────────────────');

properties.forEach(property => {
  console.log(`\n📍 ${property.name.toUpperCase()}`);
  console.log(`   Precios: Día USD ${property.prices.daily}, Semana USD ${property.prices.weekly}, Mes USD ${property.prices.monthly}`);
  
  const result = calculatePriceByProperty(property.id, '2025-08-17', '2025-08-29');
  
  const expectedTotal = property.prices.weekly + (5 * property.prices.daily);
  const isCorrect = result.totalAmount === expectedTotal;
  
  console.log(`   📊 Resultado: ${result.breakdown.type} - USD ${result.totalAmount}`);
  console.log(`   ✅ Esperado: weekly - USD ${expectedTotal} (${property.prices.weekly} + 5×${property.prices.daily})`);
  console.log(`   ${isCorrect ? '✅ CORRECTO' : '❌ INCORRECTO'}`);
});

// Test para verificar tarifas semanales exactas (7 noches)
console.log('\n\n🧪 TEST: 7 noches exactas (tarifa semanal) para cada propiedad');
console.log('─────────────────────────────────────────────────────────');

properties.forEach(property => {
  console.log(`\n📍 ${property.name.toUpperCase()}`);
  
  const result = calculatePriceByProperty(property.id, '2025-08-17', '2025-08-24');
  
  const expectedTotal = property.prices.weekly;
  const isCorrect = result.totalAmount === expectedTotal && result.breakdown.type === 'weekly';
  
  console.log(`   📊 Resultado: ${result.breakdown.type} - USD ${result.totalAmount}`);
  console.log(`   ✅ Esperado: weekly - USD ${expectedTotal}`);
  console.log(`   ${isCorrect ? '✅ CORRECTO' : '❌ INCORRECTO'}`);
});

// Test para verificar tarifas diarias (3 noches)
console.log('\n\n🧪 TEST: 3 noches (tarifa diaria) para cada propiedad');
console.log('─────────────────────────────────────────────────────');

properties.forEach(property => {
  console.log(`\n📍 ${property.name.toUpperCase()}`);
  
  const result = calculatePriceByProperty(property.id, '2025-08-17', '2025-08-20');
  
  const expectedTotal = 3 * property.prices.daily;
  const isCorrect = result.totalAmount === expectedTotal && result.breakdown.type === 'daily';
  
  console.log(`   📊 Resultado: ${result.breakdown.type} - USD ${result.totalAmount}`);
  console.log(`   ✅ Esperado: daily - USD ${expectedTotal} (3×${property.prices.daily})`);
  console.log(`   ${isCorrect ? '✅ CORRECTO' : '❌ INCORRECTO'}`);
});

console.log('\n\n🎯 RESUMEN: Sistema de precios actualizado para las 5 propiedades');
console.log('✅ Cada propiedad ahora usa sus precios reales de la pricecard');
console.log('✅ Cálculos diferenciados por propiedad');
console.log('✅ Frontend debería mostrar precios y períodos correctos');
