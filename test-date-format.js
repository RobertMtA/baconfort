console.log('🧪 TESTING DATE FORMATTING ISSUE');
console.log('=====================================');

// Simular el problema que estamos viendo
const testDates = [
  '2025-08-17', // Formato ISO que puede causar problemas
  '2025-08-29',
  new Date('2025-08-17T00:00:00.000Z'), // Date object UTC
  new Date('2025-08-29T00:00:00.000Z')
];

console.log('📅 Función ORIGINAL (problemática):');
const formatDateOld = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return 'Fecha no especificada';
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
    return 'Fecha no especificada';
  }
};

testDates.forEach((date, i) => {
  console.log(`   ${i + 1}. ${date} -> ${formatDateOld(date)}`);
});

console.log('');
console.log('📅 Función CORREGIDA:');
const formatDateNew = (dateString) => {
  try {
    if (!dateString) return 'Fecha no especificada';
    
    // Si la fecha viene en formato ISO (YYYY-MM-DD), parsear directamente
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Si la fecha viene como object Date o string completo
    const date = new Date(dateString);
    if (isNaN(date)) return 'Fecha no especificada';
    
    // Usar UTC para evitar problemas de zona horaria
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (e) {
    return 'Fecha no especificada';
  }
};

testDates.forEach((date, i) => {
  console.log(`   ${i + 1}. ${date} -> ${formatDateNew(date)}`);
});

console.log('');
console.log('✅ RESULTADO: Función corregida evita problemas de zona horaria');
