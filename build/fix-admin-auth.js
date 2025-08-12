/**
 * Script para verificar y corregir problemas de autenticación de administrador
 * Este script se puede ejecutar desde la consola del navegador cuando 
 * se experimenten problemas de autenticación en el panel de administración
 */

(function() {
  console.log('🔧 Iniciando diagnóstico de autenticación administrativa...');
  
  // 1. Verificar el token de administrador actual
  const currentToken = localStorage.getItem('admin_token');
  console.log('🔑 Token admin actual:', currentToken);
  
  // 2. Verificar si existe un token JWT normal
  const jwtToken = localStorage.getItem('token') || sessionStorage.getItem('token');
  console.log('🔑 Token JWT usuario:', jwtToken ? 'Encontrado' : 'No encontrado');
  
  // 3. Verificar datos de usuario en localStorage
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  console.log('👤 Datos de usuario:', user);
  const isAdmin = user?.role === 'admin';
  console.log('👑 ¿Es administrador?', isAdmin ? 'SÍ' : 'NO');
  
  // 4. Generar un nuevo token de administrador
  const generateNewAdminToken = () => {
    const newToken = `admin_token_${Date.now()}`;
    localStorage.setItem('admin_token', newToken);
    console.log('✅ Nuevo token administrativo generado:', newToken);
    return newToken;
  };
  
  // 5. Verificar endpoint de salud
  const checkHealth = async () => {
    try {
      const response = await fetch('https://baconfort-production-084d.up.railway.app/api/health');
      const data = await response.json();
      console.log('✅ API funcionando correctamente:', data);
      return true;
    } catch (error) {
      console.error('❌ Error verificando API:', error);
      return false;
    }
  };
  
  // 6. Verificar si el token administrativo funciona
  const checkAdminToken = async (token) => {
    try {
      console.log('🔍 Verificando token administrativo...');
      const response = await fetch('https://baconfort-production-084d.up.railway.app/api/admin/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        console.log('✅ Token administrativo válido');
        return true;
      } else {
        console.log('❌ Token administrativo inválido (Status:', response.status, ')');
        return false;
      }
    } catch (error) {
      console.error('❌ Error verificando token administrativo:', error);
      return false;
    }
  };
  
  // 7. Verificar acceso a consultas administrativas
  const checkAdminInquiries = async (token) => {
    try {
      console.log('🔍 Verificando acceso a consultas administrativas...');
      const response = await fetch('https://baconfort-production-084d.up.railway.app/api/inquiries/admin/all?status=pending&limit=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Acceso a consultas administrativas válido:', data);
        return true;
      } else {
        console.log('❌ Acceso a consultas denegado (Status:', response.status, ')');
        return false;
      }
    } catch (error) {
      console.error('❌ Error verificando acceso a consultas:', error);
      return false;
    }
  };
  
  // Ejecutar la verificación completa
  const runCompleteCheck = async () => {
    // Verificar API
    const apiOk = await checkHealth();
    if (!apiOk) {
      console.error('❌ La API no está respondiendo correctamente. Verifique la conexión a Internet y el estado del servidor.');
      return;
    }
    
    // Verificar token actual si existe
    let adminTokenOk = false;
    if (currentToken) {
      adminTokenOk = await checkAdminToken(currentToken);
    }
    
    // Si el token no es válido, generar uno nuevo
    let finalToken = currentToken;
    if (!adminTokenOk) {
      console.log('🔄 Generando nuevo token administrativo...');
      finalToken = generateNewAdminToken();
      adminTokenOk = await checkAdminToken(finalToken);
      
      if (!adminTokenOk) {
        console.error('❌ No se pudo establecer un token administrativo válido.');
        console.log('⚠️ Esto podría indicar un problema con el servidor o con los permisos de usuario.');
        return;
      }
    }
    
    // Verificar acceso a consultas administrativas
    const inquiriesOk = await checkAdminInquiries(finalToken);
    if (!inquiriesOk) {
      console.error('❌ No se puede acceder a consultas administrativas a pesar de tener un token válido.');
      console.log('⚠️ Es posible que el usuario no tenga permisos suficientes en el backend.');
      return;
    }
    
    console.log('✅ Verificación completa exitosa. El sistema de autenticación administrativa funciona correctamente.');
    console.log('🔑 Token administrativo válido:', finalToken);
    
    return {
      apiOk,
      adminTokenOk, 
      inquiriesOk,
      token: finalToken
    };
  };
  
  // Ejecutar y devolver resultado para su uso en la consola
  return runCompleteCheck();
})();
