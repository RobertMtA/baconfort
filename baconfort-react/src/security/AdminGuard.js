// AdminGuard.js - VERSIÓN SINCRONIZADA
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Credenciales correctas del sistema
const ADMIN_CREDENTIALS = {
  email: 'admin@baconfort.com',
  password: 'roccosa226',
  accessCode: 'BACONFORT_ADMIN_2025_7D3F9K2L'
};

// Función para verificar acceso admin
export const verifyAdminAccess = () => {
  const token = localStorage.getItem('baconfort-token');
  const accessCode = localStorage.getItem('baconfort_admin_access_code');
  
  return {
    isAuthorized: !!token && accessCode === ADMIN_CREDENTIALS.accessCode,
    domain: window.location.hostname,
    hasCode: accessCode === ADMIN_CREDENTIALS.accessCode,
    hasSession: !!token,
    withinTimeLimit: true
  };
};

// Hook para proteger componentes de admin
export const useAdminGuard = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAccess = () => {
      const verification = verifyAdminAccess();
      
      if (!verification.isAuthorized) {
        console.log('🔐 Acceso no autorizado, redirigiendo...');
        navigate('/admin/access-required');
        return;
      }
      
      setIsAuthorized(true);
      setIsChecking(false);
    };
    
    checkAccess();
  }, [navigate]);
  
  return { isAuthorized, isChecking };
};

// Función para configurar acceso completo
export const setupAdminAccess = () => {
  localStorage.setItem('baconfort-token', 'admin_token_' + Date.now());
  localStorage.setItem('baconfort_admin_access_code', ADMIN_CREDENTIALS.accessCode);
  localStorage.setItem('baconfort_admin_session_token', 'session_' + Date.now());
  localStorage.setItem('baconfort_admin_last_access', Date.now().toString());
  
  console.log('✅ Acceso admin configurado completamente');
  return true;
};

// Función para solicitar acceso (compatible con AdminAccessRequired)
export const requestAdminAccess = (accessCode, adminCredentials) => {
  return new Promise((resolve, reject) => {
    console.log('🔍 Verificando acceso admin...');
    console.log('Código recibido:', accessCode);
    console.log('Email recibido:', adminCredentials.email);
    
    // Verificar código de acceso
    if (accessCode !== ADMIN_CREDENTIALS.accessCode) {
      console.log('❌ Código de acceso incorrecto');
      reject(new Error('Código de acceso incorrecto'));
      return;
    }
    
    // Verificar credenciales
    if (adminCredentials.email !== ADMIN_CREDENTIALS.email || 
        adminCredentials.password !== ADMIN_CREDENTIALS.password) {
      console.log('❌ Credenciales incorrectas');
      reject(new Error('Email o contraseña incorrectos'));
      return;
    }
    
    // Configurar acceso completo
    const token = 'admin_token_' + Date.now();
    localStorage.setItem('baconfort-token', token);
    localStorage.setItem('baconfort_admin_access_code', accessCode);
    localStorage.setItem('baconfort_admin_session_token', 'session_' + Date.now());
    localStorage.setItem('baconfort_admin_last_access', Date.now().toString());
    localStorage.setItem('baconfort_admin_user_role', 'admin');
    localStorage.setItem('baconfort_admin_user_email', adminCredentials.email);
    
    console.log('✅ Acceso admin autorizado exitosamente');
    
    resolve({
      success: true,
      user: { 
        email: adminCredentials.email, 
        role: 'admin',
        accessCode: accessCode
      },
      token: token
    });
  });
};

// Revocar acceso
export const revokeAdminAccess = () => {
  localStorage.removeItem('baconfort-token');
  localStorage.removeItem('baconfort_admin_access_code');
  localStorage.removeItem('baconfort_admin_session_token');
  localStorage.removeItem('baconfort_admin_last_access');
  localStorage.removeItem('baconfort_admin_user_role');
  localStorage.removeItem('baconfort_admin_user_email');
  localStorage.removeItem('baconfort_admin_session');
  localStorage.removeItem('baconfort_admin_user');
  
  console.log('🔐 Acceso admin revocado completamente');
};

// Export default
export default {
  verifyAdminAccess,
  useAdminGuard,
  setupAdminAccess,
  requestAdminAccess,
  revokeAdminAccess,
  ADMIN_CREDENTIALS
};
