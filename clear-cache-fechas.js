// Script para limpiar cache y forzar actualización de datos
// Ejecutar en la consola del navegador en https://confort-ba.web.app

// Función para limpiar localStorage y sessionStorage
function clearAllCache() {
  console.log('🧹 Limpiando cache del navegador...');
  
  // Limpiar localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('baconfort') || key.includes('admin') || key.includes('inquiry'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log('🗑️ Eliminando localStorage:', key);
    localStorage.removeItem(key);
  });
  
  // Limpiar sessionStorage
  const sessionKeysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('baconfort') || key.includes('admin') || key.includes('inquiry'))) {
      sessionKeysToRemove.push(key);
    }
  }
  
  sessionKeysToRemove.forEach(key => {
    console.log('🗑️ Eliminando sessionStorage:', key);
    sessionStorage.removeItem(key);
  });
  
  console.log('✅ Cache limpiado. Recarga la página para ver los cambios.');
}

// Función para forzar refresco de inquiries
function forceRefreshInquiries() {
  console.log('🔄 Intentando forzar refresco de consultas...');
  
  // Si hay un AdminContext disponible
  if (window.React && window.React.findDOMNode) {
    console.log('⚠️ Recarga la página manualmente para ver las correcciones más recientes');
  }
  
  // Agregar timestamp para evitar cache
  const now = Date.now();
  console.log('⏰ Timestamp actual:', now);
  console.log('📝 Usa este timestamp en llamadas API para evitar cache:', `?_t=${now}`);
}

console.log('🔧 SCRIPT DE LIMPIEZA DE CACHE - CORRECCIÓN DE FECHAS');
console.log('=====================================================');
console.log('');
console.log('🚀 Para usar este script:');
console.log('1. Abre las herramientas de desarrollador (F12)');
console.log('2. Ve a la pestaña "Console"');
console.log('3. Ejecuta: clearAllCache()');
console.log('4. Luego ejecuta: forceRefreshInquiries()');
console.log('5. Recarga la página completamente (Ctrl+F5)');
console.log('');
console.log('✅ Con las correcciones más recientes, deberías ver:');
console.log('   📧 Email: 15/08/2025 - 21/08/2025');
console.log('   🖥️  Panel: 15 ago 2025 - 21 ago 2025');
console.log('');

// Exponer funciones globalmente para facilitar uso
if (typeof window !== 'undefined') {
  window.clearAllCache = clearAllCache;
  window.forceRefreshInquiries = forceRefreshInquiries;
}

// Si se ejecuta directamente en Node.js
if (typeof module !== 'undefined') {
  module.exports = { clearAllCache, forceRefreshInquiries };
}
