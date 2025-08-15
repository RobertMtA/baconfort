const { calculatePriceByProperty } = require('./baconfort-backend/utils/priceCalculator');

console.log('🧪 TESTING 12 NOCHES - PROBLEMA ESPECÍFICO');
console.log('==========================================');

// Test para 12 noches en diferentes propiedades
const properties = ['ugarteche-2824', 'convencion-1994', 'moldes-1680'];

properties.forEach(propertyId => {
  console.log(`\n📊 Propiedad: ${propertyId}`);
  const result = calculatePriceByProperty(propertyId, '2025-08-15', '2025-08-27'); // 12 noches
  console.log(`   Noches: ${result.nights}`);
  console.log(`   Tipo: ${result.breakdown.type}`);
  console.log(`   Total: ${result.totalAmount} ${result.currency}`);
  
  if (result.breakdown.type === 'weekly') {
    console.log(`   Semanas: ${result.breakdown.weeks} × USD ${result.breakdown.weeklyPrice} = USD ${result.breakdown.weeklyTotal}`);
    if (result.breakdown.extraDays > 0) {
      console.log(`   Días extra: ${result.breakdown.extraDays} × USD ${result.breakdown.dailyPrice} = USD ${result.breakdown.extraDaysTotal}`);
    }
  }
});

console.log('\n🔍 ANÁLISIS ESPECÍFICO PARA EL PROBLEMA REPORTADO:');
console.log('=================================================');

// Probar el escenario exacto del usuario
const test1 = calculatePriceByProperty('ugarteche-2824', '2025-08-15', '2025-08-27');
console.log('\n📅 Caso específico: Ugarteche 2824 - 12 noches');
console.log(`💰 Total: ${test1.totalAmount} ${test1.currency}`);
console.log(`🏷️ Tarifa: ${test1.breakdown.type}`);

if (test1.breakdown.type === 'weekly') {
  console.log(`📊 Desglose:`);
  console.log(`   ${test1.breakdown.weeks} semana × USD ${test1.breakdown.weeklyPrice} = USD ${test1.breakdown.weeklyTotal}`);
  if (test1.breakdown.extraDays > 0) {
    console.log(`   ${test1.breakdown.extraDays} días × USD ${test1.breakdown.dailyPrice} = USD ${test1.breakdown.extraDaysTotal}`);
  }
}

console.log('\n✅ Verificando si este es el origen de las inconsistencias...');
