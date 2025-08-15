/**
 * Herramienta para corregir el problema del nombre "dolar" en tokens
 * Este script ayuda a limpiar localStorage y forzar una nueva autenticación
 */

console.log('🔧 Fix para problema del nombre "dolar"');

// Función para ejecutar en la consola del navegador
const fixUserNameIssue = () => {
  console.log('🧹 Limpiando localStorage...');
  
  // Limpiar datos de autenticación
  localStorage.removeItem('baconfort-user');
  localStorage.removeItem('baconfort-token');
  localStorage.removeItem('baconfort-admin-user');
  localStorage.removeItem('baconfort-admin-token');
  
  // Limpiar cualquier otra clave relacionada
  Object.keys(localStorage).forEach(key => {
    if (key.includes('baconfort') || key.includes('dolar')) {
      localStorage.removeItem(key);
      console.log('🗑️ Removido:', key);
    }
  });
  
  console.log('✅ localStorage limpiado');
  console.log('🔄 Por favor, vuelve a hacer login con las credenciales correctas');
  
  // Recargar la página para forzar un nuevo estado
  window.location.reload();
};

// Función para verificar el estado actual
const checkCurrentState = () => {
  const user = localStorage.getItem('baconfort-user');
  const token = localStorage.getItem('baconfort-token');
  
  if (user) {
    const parsedUser = JSON.parse(user);
    console.log('👤 Usuario actual:', parsedUser);
    
    if (parsedUser.name && parsedUser.name.includes('dolar')) {
      console.log('🚨 ¡Problema detectado! Nombre contiene "dolar"');
      return false;
    }
  }
  
  console.log('✅ No se detectaron problemas');
  return true;
};

console.log(`
📋 INSTRUCCIONES:
1. Abrir las DevTools del navegador (F12)
2. Ir a la consola
3. Pegar y ejecutar:

// Verificar problema
checkCurrentState();

// Si hay problema, ejecutar la corrección:
fixUserNameIssue();

🔍 DIAGNÓSTICO:
- El problema del nombre "dolar" viene de tokens guardados en localStorage
- Esto se puede deber a datos de prueba o desarrollo que quedaron guardados
- La solución es limpiar localStorage y volver a autenticarse

⚠️ IMPORTANTE:
- Después de ejecutar fixUserNameIssue(), tendrás que volver a hacer login
- Asegúrate de usar las credenciales correctas: baconfort.centro@gmail.com / password123
`);

// Exportar funciones para uso en navegador
if (typeof window !== 'undefined') {
  window.checkCurrentState = checkCurrentState;
  window.fixUserNameIssue = fixUserNameIssue;
}
