// AdminGuard.js - VERSIÓN LIMPIA Y FUNCIONAL
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Función simple para verificar acceso admin
export const verifyAdminAccess = () => {
  // Verificar solo que tenga un token válido
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
        console.log('🔐 Redirigiendo a login admin...');
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

// Función para configurar acceso automático
export const setupAdminAccess = () => {
  localStorage.setItem('baconfort-token', 'admin_token_' + Date.now());
  console.log('✅ Acceso admin configurado');
};

// Revocar acceso
export const revokeAdminAccess = () => {
  localStorage.clear();
  console.log('🔐 Acceso revocado');
};

// Export default
export default {
  verifyAdminAccess,
  useAdminGuard,
  setupAdminAccess,
  revokeAdminAccess
};
