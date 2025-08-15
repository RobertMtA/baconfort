// diagnose-price-issue.js
// Script para diagnosticar el origen del valor USD $361

const { calculatePriceByProperty } = require('./baconfort-backend/utils/priceCalculator');

console.log('🔍 DIAGNÓSTICO COMPLETO DEL PROBLEMA DE PRECIOS');
console.log('===============================================');
console.log('');

// Test del caso específico del usuario
console.log('📋 CASO DEL USUARIO:');
console.log('   Fechas: 17/08/2025 - 30/08/2025');
console.log('   Propiedad: Ugarteche 2824');
console.log('');

// Cálculo backend correcto
const backendResult = calculatePriceByProperty('ugarteche-2824', '2025-08-17', '2025-08-30');
console.log('✅ BACKEND (CORRECTO):');
console.log('   Noches:', backendResult.nights);
console.log('   Precio semanal:', backendResult.breakdown.weeklyPrice);
console.log('   Precio diario:', backendResult.breakdown.dailyPrice);
console.log('   Cálculo: 1 sem ×', backendResult.breakdown.weeklyPrice, '+ 6 días ×', backendResult.breakdown.dailyPrice);
console.log('   Total:', backendResult.totalAmount, backendResult.currency);
console.log('');

// Simulación del cálculo incorrecto que da 631
console.log('❌ CÁLCULO INCORRECTO OBSERVADO:');
console.log('   Precio semanal incorrecto: 361');
console.log('   Precio diario: 45');
console.log('   Cálculo: 1 sem × 361 + 6 días × 45');
console.log('   Total: 361 + 270 = 631');
console.log('');

// Análisis de diferencia
const difference = 400 - 361;
const percentage = ((400 - 361) / 400) * 100;

console.log('🧮 ANÁLISIS DE LA DIFERENCIA:');
console.log('   Diferencia:', difference, 'USD');
console.log('   Porcentaje:', percentage.toFixed(2) + '%');
console.log('   361 ÷ 400 =', (361/400).toFixed(4), '(90.25% del valor correcto)');
console.log('');

// Posibles orígenes
console.log('🔍 POSIBLES ORÍGENES DEL VALOR 361:');
console.log('   1. Descuento automático del 9.75%');
console.log('   2. Conversión de moneda incorrecta');
console.log('   3. Datos de prueba o desarrollo');
console.log('   4. Cache con datos viejos');
console.log('   5. Transformación matemática errónea');
console.log('');

// Verificaciones sugeridas
console.log('🕵️ VERIFICACIONES RECOMENDADAS:');
console.log('   □ localStorage del navegador');
console.log('   □ sessionStorage del navegador');
console.log('   □ Cache del Service Worker');
console.log('   □ Variables de entorno del frontend');
console.log('   □ Respuesta de la API de precios');
console.log('   □ Context de React con datos stale');
console.log('   □ Base de datos con reserva previa');
console.log('');

// Comandos de limpieza
console.log('🧹 COMANDOS DE LIMPIEZA:');
console.log('   1. Limpiar localStorage: localStorage.clear()');
console.log('   2. Limpiar cache: Ctrl+Shift+R');
console.log('   3. Modo incógnito: Ctrl+Shift+N');
console.log('   4. DevTools: Application > Storage > Clear');
console.log('');

console.log('💡 RECOMENDACIÓN:');
console.log('   Ejecutar fix-price-consistency.ps1 para corregir automáticamente');
