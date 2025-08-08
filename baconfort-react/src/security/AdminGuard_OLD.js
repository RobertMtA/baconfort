// secure-admin-guard.js - VERSIÓN SIMPLE RESTAURADA
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Función simple para verificar acceso admin
export const verifyAdminAccess = () => {
  // Por simplicidad, verificar solo que tenga un token válido
  const token = localStorage.getItem('baconfort-token');
  return {
    isAuthorized: !!token,
    domain: window.location.hostname,
    hasCode: true,
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
        console.log('� Redirigiendo a login admin...');
        navigate('/admin/login');
        return;
      }
      
      setIsAuthorized(true);
      setIsChecking(false);
    };
    
    checkAccess();
  }, [navigate]);
  
  return { isAuthorized, isChecking };
};

// Función simple para configurar acceso
export const setupAdminAccess = () => {
  localStorage.setItem('baconfort_admin_access_code', 'BACONFORT_ADMIN_2025_7D3F9K2L');
  localStorage.setItem('baconfort_admin_session_token', 'admin_session_' + Date.now());
  localStorage.setItem('baconfort_admin_last_access', Date.now().toString());
  console.log('✅ Acceso admin configurado');
};

// Revocar acceso
export const revokeAdminAccess = () => {
  localStorage.clear();
  console.log('🔐 Acceso revocado');
};

export default {
  verifyAdminAccess,
  useAdminGuard,
  setupAdminAccess,
  revokeAdminAccess
};

// Función para solicitar acceso autorizado
export const requestAdminAccess = (accessCode, adminCredentials) => {
  return new Promise((resolve, reject) => {
    // Verificar código de acceso
    if (accessCode !== ADMIN_ACCESS_CODE) {
      reject(new Error('Código de acceso inválido'));
      return;
    }
    
    // Verificar credenciales admin simples
    const validCredentials = [
      { email: 'admin@baconfort.com', password: 'admin123', role: 'admin' }
    ];
    
    const validUser = validCredentials.find(
      cred => cred.email === adminCredentials.email && cred.password === adminCredentials.password
    );
    
    if (!validUser) {
      reject(new Error('Credenciales administrativas inválidas'));
      return;
    }
    
    // Generar token de sesión seguro
    const sessionToken = generateSecureToken();
    
    // Guardar datos de acceso
    localStorage.setItem('baconfort_admin_access_code', accessCode);
    localStorage.setItem('baconfort_admin_session_token', sessionToken);
    localStorage.setItem('baconfort_admin_last_access', Date.now().toString());
    localStorage.setItem('baconfort_admin_user_role', validUser.role);
    
    console.log('✅ Acceso autorizado concedido');
    resolve({
      success: true,
      user: validUser,
      sessionToken: sessionToken,
      expiresAt: Date.now() + (2 * 60 * 60 * 1000) // 2 horas
    });
  });
};

// Generar token seguro
const generateSecureToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const timestamp = Date.now().toString(36);
  const random = Array.from({ length: 32 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  return `BACONFORT_${timestamp}_${random}`;
};

// Revocar acceso
export const revokeAdminAccess = () => {
  localStorage.removeItem('baconfort_admin_access_code');
  localStorage.removeItem('baconfort_admin_session_token');
  localStorage.removeItem('baconfort_admin_last_access');
  localStorage.removeItem('baconfort_admin_user_role');
  localStorage.removeItem('baconfort_admin_session');
  localStorage.removeItem('baconfort_admin_user');
  localStorage.removeItem('baconfort-token');
  
  console.log('🔐 Acceso administrativo revocado');
};

export default {
  verifyAdminAccess,
  useAdminGuard,
  requestAdminAccess,
  revokeAdminAccess
};
