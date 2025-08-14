// verify-admin-token.js
// Script para verificar la generación correcta del token dinámico

// Importaciones necesarias
const { format } = require('date-fns');

/**
 * Genera un token estático de administrador basado en el tiempo actual
 * @returns {string} Token estático en formato admin_static_YYYYMMDD_HHmm0_baconfort
 */
const generateStaticAdminToken = () => {
  const now = new Date();
  const dateStr = format(now, 'yyyyMMdd');
  
  // Obtener hora y minuto, pero redondear el minuto a intervalos de 10 (17:25 -> 17:20)
  const hours = now.getHours().toString().padStart(2, '0');
  const minuteBase = Math.floor(now.getMinutes() / 10) * 10;
  const minutes = minuteBase.toString().padStart(2, '0');
  
  return `admin_static_${dateStr}_${hours}${minutes}0_baconfort`;
};

// Generar tokens en varios momentos diferentes
const currentToken = generateStaticAdminToken();
console.log('⚡ Token actual:', currentToken);

// Simular tokens en diferentes momentos
const simulateTokens = () => {
  const times = [
    new Date('2025-08-12T17:25:30'),  // 17:25 -> debería dar 17:20
    new Date('2025-08-12T17:29:59'),  // 17:29 -> debería dar 17:20
    new Date('2025-08-12T17:30:01'),  // 17:30 -> debería dar 17:30
    new Date('2025-08-12T17:35:00'),  // 17:35 -> debería dar 17:30
    new Date('2025-08-12T17:39:59'),  // 17:39 -> debería dar 17:30
    new Date('2025-08-12T17:40:00'),  // 17:40 -> debería dar 17:40
  ];

  const originalNow = Date.now;
  
  times.forEach(mockTime => {
    // Sobreescribir temporalmente Date.now
    Date.now = () => mockTime.getTime();
    const mockDate = new Date();
    
    // Crear una nueva instancia de Date usando el tiempo simulado
    const token = generateStaticAdminToken();
    console.log(`⏰ Hora simulada: ${mockTime.toLocaleTimeString()} -> Token: ${token}`);
    
    // Verificar si el token coincide con el patrón esperado
    const isValidFormat = /^admin_static_\d{8}_\d{5}_baconfort$/.test(token);
    console.log(`✅ Formato válido: ${isValidFormat ? 'SÍ' : 'NO'}\n`);
  });
  
  // Restaurar Date.now
  Date.now = originalNow;
};

// Ejecutar la simulación
console.log("\n🧪 SIMULACIÓN DE TOKENS EN DIFERENTES HORAS:\n");
simulateTokens();

// Verificar si el token actual coincidiría con la expresión regular del backend
const isValidForBackend = /^admin_static_\d{8}_\d{5}_baconfort$/.test(currentToken);
console.log(`\n🔍 RESULTADO DE VALIDACIÓN PARA BACKEND:`);
console.log(`Token actual: ${currentToken}`);
console.log(`¿Coincide con la validación del backend? ${isValidForBackend ? '✅ SÍ' : '❌ NO'}`);

console.log("\n📝 INSTRUCCIONES PARA EL BACKEND:");
console.log("El backend debe aceptar tokens con el formato: admin_static_YYYYMMDD_HHmm0_baconfort");
console.log("Expresión regular de validación: /^admin_static_\\d{8}_\\d{5}_baconfort$/");
