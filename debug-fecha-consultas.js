// Script de depuración para inconsistencias de fechas en consultas
// Ejecutar: node debug-fecha-consultas.js

console.log('🔍 DEBUG DE FECHAS EN CONSULTAS');
console.log('================================');

// Simular las fechas que está mostrando el usuario
const fechasUsuario = {
  panelAdmin: {
    checkIn: '14 ago 2025, 21:00',
    checkOut: '20 ago 2025, 21:00'
  },
  email: {
    checkIn: '15/08/2025',
    checkOut: '21/08/2025'
  }
};

console.log('📊 DATOS REPORTADOS POR EL USUARIO:');
console.log('Panel Admin:', fechasUsuario.panelAdmin);
console.log('Email:', fechasUsuario.email);

// Simular procesamiento de fechas desde diferentes fuentes
console.log('\n🔬 SIMULACIÓN DE PROCESAMIENTO:');

// 1. Si los datos vienen del formulario como YYYY-MM-DD
const inputFormulario = {
  checkIn: '2025-08-15',  // Usuario seleccionó 15 de agosto
  checkOut: '2025-08-21'  // Usuario seleccionó 21 de agosto
};

console.log('\n1️⃣ DATOS DEL FORMULARIO (YYYY-MM-DD):');
console.log('Input:', inputFormulario);

// Función del backend (corregida)
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
  }
  
  if (isNaN(dateObj.getTime())) return '';
  
  const day = dateObj.getUTCDate().toString().padStart(2, '0');
  const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
};

// Función del frontend (corregida)
const formatDateLongFrontend = (dateString) => {
  try {
    if (!dateString) return 'N/D';
    
    // Si viene en formato DD/MM/YYYY, convertirlo
    if (typeof dateString === 'string' && dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateString.split('/');
      const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/D';
    
    // Usar UTC para evitar conversiones de zona horaria
    const day = date.getUTCDate();
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    return `${day} ${monthNames[month]} ${year}, ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    return 'N/D';
  }
};

console.log('\n📧 PROCESAMIENTO BACKEND (Email):');
const backendCheckIn = formatDateSafeBackend(inputFormulario.checkIn);
const backendCheckOut = formatDateSafeBackend(inputFormulario.checkOut);
console.log('Backend checkIn:', backendCheckIn);
console.log('Backend checkOut:', backendCheckOut);

console.log('\n🖥️ PROCESAMIENTO FRONTEND (Panel Admin):');
const frontendCheckIn = formatDateLongFrontend(inputFormulario.checkIn);
const frontendCheckOut = formatDateLongFrontend(inputFormulario.checkOut);
console.log('Frontend checkIn:', frontendCheckIn);
console.log('Frontend checkOut:', frontendCheckOut);

// Si el backend devuelve en formato DD/MM/YYYY, convertir para panel admin
console.log('\n🔄 PROCESAMIENTO FRONTEND desde backend DD/MM/YYYY:');
const frontendFromBackendCheckIn = formatDateLongFrontend(backendCheckIn);
const frontendFromBackendCheckOut = formatDateLongFrontend(backendCheckOut);
console.log('Frontend desde backend checkIn:', frontendFromBackendCheckIn);
console.log('Frontend desde backend checkOut:', frontendFromBackendCheckOut);

console.log('\n✅ COMPARACIÓN CON DATOS REPORTADOS:');
console.log('🎯 OBJETIVO:');
console.log('  Email debe mostrar: 15/08/2025 - 21/08/2025');
console.log('  Panel debe mostrar: 15 ago 2025 - 21 ago 2025');

console.log('\n🔍 RESULTADOS ACTUALES:');
console.log('  Email actual:', `${backendCheckIn} - ${backendCheckOut}`);
console.log('  Panel actual:', `${frontendFromBackendCheckIn} - ${frontendFromBackendCheckOut}`);

const emailCorrecto = backendCheckIn === '15/08/2025' && backendCheckOut === '21/08/2025';
const panelCorrecto = frontendFromBackendCheckIn.includes('15 ago 2025') && frontendFromBackendCheckOut.includes('21 ago 2025');

console.log('\n📊 ANÁLISIS:');
console.log(`Email correcto: ${emailCorrecto ? '✅' : '❌'}`);
console.log(`Panel correcto: ${panelCorrecto ? '✅' : '❌'}`);

if (!emailCorrecto || !panelCorrecto) {
  console.log('\n🚨 PROBLEMA DETECTADO:');
  console.log('Las fechas reportadas por el usuario (14 ago / 20 ago) sugieren que:');
  console.log('1. Los datos en la base de datos están incorrectos, o');
  console.log('2. Hay una función de formateo que no se actualizó, o');
  console.log('3. Los datos se están procesando mal antes de llegar al frontend');
  
  console.log('\n🔧 PRÓXIMOS PASOS:');
  console.log('1. Verificar qué datos exactos están llegando desde la API');
  console.log('2. Revisar si hay cache de datos antiguos');
  console.log('3. Confirmar que todas las funciones de formateo están actualizadas');
} else {
  console.log('\n🎉 CORRECCIONES EXITOSAS - Las funciones deberían mostrar fechas correctas');
}
