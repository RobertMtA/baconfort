/**
 * cambiar-url-api.js
 * 
 * Este script cambia temporalmente la URL de la API en localStorage
 * para usar el proxy de autenticación local.
 */

// Verificar si estamos en un navegador
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  // Guardar la URL original para poder restaurarla después
  const urlOriginal = localStorage.getItem('baconfort-api-url') || 'http://localhost:5004/api';
  
  if (urlOriginal !== 'http://localhost:5004/api') {
    localStorage.setItem('baconfort-api-url-original', urlOriginal);
    localStorage.setItem('baconfort-api-url', 'http://localhost:5004/api');
    console.log('✅ URL de API cambiada temporalmente a http://localhost:5004/api');
    console.log('🔄 Por favor, recarga la página para aplicar los cambios');
  } else {
    console.log('✓ La URL de API ya está configurada correctamente');
  }
} else {
  console.error('❌ Este script debe ejecutarse en un navegador');
}
