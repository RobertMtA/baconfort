/**
 * restaurar-url-api.js
 * 
 * Este script restaura la URL original de la API en localStorage
 * después de haber usado el proxy de autenticación local.
 */

// Verificar si estamos en un navegador
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  // Recuperar la URL original
  const urlOriginal = localStorage.getItem('baconfort-api-url-original');
  
  if (urlOriginal) {
    localStorage.setItem('baconfort-api-url', urlOriginal);
    console.log(`✅ URL de API restaurada a ${urlOriginal}`);
    console.log('🔄 Por favor, recarga la página para aplicar los cambios');
    
    // Limpiar la URL guardada
    localStorage.removeItem('baconfort-api-url-original');
  } else {
    console.log('⚠️ No se encontró una URL de API original guardada');
  }
} else {
  console.error('❌ Este script debe ejecutarse en un navegador');
}
