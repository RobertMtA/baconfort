// Script para configurar acceso admin automático
console.log('🔧 Configurando acceso admin...');

// Limpiar cualquier configuración anterior
localStorage.clear();

// Configurar token simple
localStorage.setItem('baconfort-token', 'admin_token_' + Date.now());

console.log('✅ Acceso configurado');
console.log('🚀 Ve a: http://localhost:3000/admin/login');
console.log('🔑 Credenciales: admin@baconfort.com / admin123');
