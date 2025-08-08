import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, usersAPI } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Verificar token al iniciar la aplicación
  useEffect(() => {
    const checkAuthToken = async () => {
      const token = localStorage.getItem('baconfort-token');
      console.log('🔍 AUTH CONTEXT: Verificando token al iniciar...');
      console.log('🔍 AUTH CONTEXT: Token encontrado:', token ? 'SÍ' : 'NO');
      
      if (token) {
        console.log('🔍 AUTH CONTEXT: Token preview:', token.substring(0, 30) + '...');
        
        // Verificar si es el token demo
        if (token.includes('demo_user_123')) {
          console.log('✅ AUTH CONTEXT: Token demo detectado, seteando usuario demo');
          const demoUser = {
            id: 'demo_user_123',
            email: 'demo@baconfort.com',
            name: 'Usuario Demo BACONFORT',
            role: 'user'
          };
          setUser(demoUser);
          console.log('✅ AUTH CONTEXT: Usuario demo configurado:', demoUser);
          return;
        }
        
        try {
          // Verificar que el token sea válido usando el endpoint correcto
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            console.log('✅ AUTH CONTEXT: Token válido, usuario:', userData.user);
            setUser(userData.user);
          } else {
            // Token inválido, remover
            console.log('❌ AUTH CONTEXT: Token inválido, removiendo');
            localStorage.removeItem('baconfort-token');
          }
        } catch (error) {
          console.log('❌ AUTH CONTEXT: Error verificando token:', error);
          localStorage.removeItem('baconfort-token');
        }
      } else {
        console.log('ℹ️ AUTH CONTEXT: No hay token en localStorage');
      }
      setLoading(false);
    };
    
    checkAuthToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        setUser(response.user);
        // Guardar el token en localStorage
        if (response.token) {
          localStorage.setItem('baconfort-token', response.token);
        }
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.error || 'Error en el login' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (response.success) {
        setUser(response.user);
        // Guardar el token en localStorage
        if (response.token) {
          localStorage.setItem('baconfort-token', response.token);
        }
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.error || 'Error en el registro' };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    console.log('🚪 Cerrando sesión...');
    setUser(null);
    localStorage.removeItem('baconfort-token');
    console.log('✅ Sesión cerrada exitosamente');
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      if (response.success) {
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.error || 'Error actualizando perfil' };
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return { success: false, error: error.message };
    }
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('baconfort-token');
  };

  const isAdmin = () => {
    // Modo demo: simular admin temporal
    return true; // Temporalmente permitir acceso admin para desarrollo
    // return user?.role === 'admin';
  };

  // Métodos de gestión de usuarios (solo para admin)
  const getAllUsers = async () => {
    try {
      // Temporalmente: Saltar la validación de permisos para desarrollo
      const response = await usersAPI.getAll();
      return response;
    } catch (error) {
      console.error('❌ AuthContext: Error obteniendo usuarios:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      if (!isAdmin()) {
        return { success: false, error: 'No tienes permisos para actualizar usuarios' };
      }
      const response = await usersAPI.update(userId, userData);
      return response;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteUser = async (userId) => {
    try {
      if (!isAdmin()) {
        return { success: false, error: 'No tienes permisos para eliminar usuarios' };
      }
      const response = await usersAPI.delete(userId);
      return response;
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      return { success: false, error: error.message };
    }
  };

  const getStats = async () => {
    try {
      console.log('🔍 AuthContext: Obteniendo estadísticas...');
      if (!isAdmin()) {
        return { success: false, error: 'No tienes permisos para acceder a las estadísticas' };
      }
      const response = await usersAPI.getStats();
      console.log('📊 AuthContext: Estadísticas obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ AuthContext: Error obteniendo estadísticas:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    isAdmin,
    getAllUsers,
    updateUser,
    deleteUser,
    getStats,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
