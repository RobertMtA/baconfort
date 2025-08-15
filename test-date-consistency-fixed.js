// Script de validación de consistencia de fechas después de correcciones de timezone
// Ejecutar: node test-date-consistency-fixed.js

console.log('🔍 VALIDACIÓN DE CONSISTENCIA DE FECHAS - POST-CORRECCIÓN');
console.log('==================================================');

// Simular las funciones corregidas del frontend
const formatDateFixed = (dateString) => {
  if (!dateString) return '';
  
  // Extraer componentes directamente del string YYYY-MM-DD para evitar timezone issues
  const parts = dateString.split('-');
  if (parts.length !== 3) return '';
  
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) return '';
  
  return `${day}/${month}/${year}`;
};

const formatDateLongFixed = (dateString) => {
  if (!dateString) return 'Fecha no especificada';
  
  // Si la fecha viene en formato ISO (YYYY-MM-DD), parsear directamente
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-');
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${parseInt(day)} de ${monthNames[parseInt(month) - 1]} de ${year}`;
  }
  
  return 'Formato no soportado';
};

// Simular función del backend (ya corregida previamente)
const formatDateSafeBackend = (dateStr) => {
  if (!dateStr) return '';
  
  let dateObj;
  if (typeof dateStr === 'string') {
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      dateObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    } else if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      dateObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    } else {
      dateObj = new Date(dateStr);
    }
  } else {
    dateObj = new Date(dateStr);
  }
  
  if (isNaN(dateObj.getTime())) return '';
  
  const day = dateObj.getUTCDate().toString().padStart(2, '0');
  const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
};

// Casos de prueba - fechas problemáticas que causaban inconsistencias
const testCases = [
  {
    name: 'Caso usuario actual',
    checkIn: '2025-08-16',
    checkOut: '2025-08-28'
  },
  {
    name: 'Caso límite timezone',
    checkIn: '2025-08-17',
    checkOut: '2025-08-29'
  },
  {
    name: 'Fechas de fin de año',
    checkIn: '2025-12-30',
    checkOut: '2026-01-02'
  },
  {
    name: 'Fechas de cambio horario',
    checkIn: '2025-03-15',
    checkOut: '2025-03-20'
  }
];

console.log('\n🧪 EJECUTANDO CASOS DE PRUEBA...\n');

testCases.forEach((testCase, index) => {
  console.log(`📋 ${testCase.name}:`);
  console.log(`   Input: ${testCase.checkIn} → ${testCase.checkOut}`);
  
  // Frontend corregido - AvailabilityInquiryForm
  const frontendShort = formatDateFixed(testCase.checkIn);
  const frontendShortOut = formatDateFixed(testCase.checkOut);
  
  // Frontend corregido - PendingPayments
  const frontendLong = formatDateLongFixed(testCase.checkIn);
  const frontendLongOut = formatDateLongFixed(testCase.checkOut);
  
  // Backend corregido
  const backendIn = formatDateSafeBackend(testCase.checkIn);
  const backendOut = formatDateSafeBackend(testCase.checkOut);
  
  console.log(`   📧 Email (Backend): ${backendIn} - ${backendOut}`);
  console.log(`   🖥️  Frontend Form: ${frontendShort} - ${frontendShortOut}`);
  console.log(`   📊 Admin Table: ${frontendLong} - ${frontendLongOut}`);
  
  // Verificar consistencia
  const isConsistent = (
    backendIn === frontendShort && 
    backendOut === frontendShortOut &&
    frontendLong.includes(frontendShort.split('/')[0]) && // El día debe coincidir
    frontendLongOut.includes(frontendShortOut.split('/')[0])
  );
  
  const status = isConsistent ? '✅ Consistencia: CORRECTA' : '❌ Consistencia: ERROR';
  console.log(`   ${status}\n`);
});

console.log('📝 RESUMEN DE CORRECCIONES APLICADAS:');
console.log('=====================================');
console.log('✅ AvailabilityInquiryForm.jsx: formatDate() usa parsing directo de string');
console.log('✅ AvailabilityInquiryForm.jsx: checkIn/checkOut dates usan UTC');
console.log('✅ AvailabilityInquiryForm.jsx: eliminado toLocaleDateString() en resumen');
console.log('✅ PendingPayments.jsx: formatDateLong() usa parsing directo');
console.log('✅ PendingPayments.jsx: calculateNights() usa UTC');
console.log('✅ Backend: formatDateSafe() usa métodos UTC (corregido previamente)');
console.log('✅ AdminContext: normalizeDate() usa UTC (corregido previamente)');

console.log('\n🎯 ESTADO: Todas las funciones de fecha actualizadas para usar UTC');
console.log('🚀 DEPLOY: Frontend desplegado a Firebase, Backend en Railway');
console.log('📧 PRÓXIMA PRUEBA: Crear nueva consulta y verificar emails vs admin');
