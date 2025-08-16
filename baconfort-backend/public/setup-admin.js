// CONFIGURACIÓN AUTOMÁTICA PARA ACCESO ADMIN LOCAL
console.log('🔧 Configurando acceso admin automático...');

// Configurar código de acceso
localStorage.setItem('baconfort_admin_access_code', 'BACONFORT_ADMIN_2025_7D3F9K2L');
localStorage.setItem('baconfort_admin_session_token', 'local_session_' + Date.now());
localStorage.setItem('baconfort_admin_last_access', Date.now().toString());

console.log('✅ Acceso admin configurado');
console.log('🚀 Ir a: http://localhost:3000/admin/login');
console.log('🔑 Credenciales: admin@baconfort.com / admin123');
