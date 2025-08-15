// Script para probar la consistencia de fechas entre email y gestión
// Ejecutar desde la carpeta raíz del proyecto

const testDates = [
  '2025-08-17', // Check-in del ejemplo
  '2025-08-29', // Check-out del ejemplo
  '2025-08-16',
  '2025-08-28'
];

console.log('🧪 PRUEBA DE CONSISTENCIA DE FECHAS\n');
console.log('===================================\n');

// Función del backend (nueva implementación)
function formatDateSafeBackend(dateString) {
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
}

// Función del frontend (nueva implementación para gestión)
function formatDateAdminContext(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    // Usar UTC para formateo consistente
    const day = date.getUTCDate();
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    
    // Crear array de nombres de día y mes en español
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const utcDate = new Date(Date.UTC(year, month, day));
    const dayName = diasSemana[utcDate.getUTCDay()];
    const monthName = meses[month];
    
    return `${dayName}, ${day} de ${monthName} de ${year}`;
  } catch (error) {
    return dateString;
  }
}

// Función simplificada para mostrar fecha corta (como se mostraría en lista)
function formatDateShort(dateString) {
  try {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return 'Error';
  }
}

console.log('🔍 VALIDACIÓN DE CONSISTENCIA:\n');

testDates.forEach((dateStr, i) => {
  const backendFormat = formatDateSafeBackend(dateStr);
  const adminContextFormat = formatDateAdminContext(dateStr);
  const shortFormat = formatDateShort(dateStr);
  
  console.log(`📅 Fecha ${i + 1}: ${dateStr}`);
  console.log(`   📧 Email (backend):     ${backendFormat}`);
  console.log(`   🖥️  Gestión (frontend): ${adminContextFormat}`);
  console.log(`   📋 Lista corta:         ${shortFormat}`);
  
  // Verificar que al menos el día sea el mismo
  const backendDay = backendFormat.split('/')[0];
  const shortDay = shortFormat.split('/')[0];
  const contextDay = adminContextFormat.includes(',') ? 
    adminContextFormat.split(',')[1].trim().split(' ')[0] : 'N/A';
  
  const isConsistent = backendDay === shortDay && backendDay === contextDay;
  console.log(`   ✅ Consistencia: ${isConsistent ? 'CORRECTA' : 'ERROR'}\n`);
});

console.log('📋 RESULTADO ESPERADO:');
console.log('- Email: 17/08/2025, 29/08/2025');
console.log('- Gestión: viernes, 17 de agosto de 2025, sábado, 29 de agosto de 2025');
console.log('- Ambos deben mostrar el mismo día del mes (17 y 29)');
console.log('\n✅ Las fechas ahora deberían ser consistentes en ambos sistemas.');
