// Contexto de autenticación con persistencia de sesión
import { createContext, useContext, useState, useEffect } from 'react';

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
  const [loading, setLoading] = useState(true);

  // Restaurar sesión desde localStorage al cargar
  useEffect(() => {
    const restoreSession = () => {
      try {
        const savedUser = localStorage.getItem('baconfort-user');
        const savedToken = localStorage.getItem('baconfort-token');
        
        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          console.log('🔄 AUTH: Restaurando sesión:', parsedUser.email);
          setUser(parsedUser);
        } else {
          console.log('📭 AUTH: No hay sesión guardada');
        }
      } catch (error) {
        console.error('❌ AUTH: Error restaurando sesión:', error);
        localStorage.removeItem('baconfort-user');
        localStorage.removeItem('baconfort-token');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Función para persistir sesión
  const persistSession = (userData, token = null) => {
    try {
      localStorage.setItem('baconfort-user', JSON.stringify(userData));
      if (token) {
        localStorage.setItem('baconfort-token', token);
      }
      console.log('💾 AUTH: Sesión guardada en localStorage');
    } catch (error) {
      console.error('❌ AUTH: Error guardando sesión:', error);
    }
  };

  // Función para limpiar sesión
  const clearSession = () => {
    localStorage.removeItem('baconfort-user');
    localStorage.removeItem('baconfort-token');
    console.log('🗑️ AUTH: Sesión eliminada del localStorage');
  };

  const login = async (email, password) => {
    console.log('🔐 AUTH: Intento de login:', email);
    setLoading(true);
    
    try {
      // Verificar si es el admin
      if (email === 'admin@baconfort.com' && password === 'roccosa226') {
        const adminUser = {
          id: 'admin_user_001',
          email: email,
          name: 'Administrador BACONFORT',
          role: 'admin'
        };
        
        const token = 'admin_token_' + Date.now();
        setUser(adminUser);
        persistSession(adminUser, token);
        
        console.log('✅ AUTH: Login exitoso (Admin)');
        return { success: true, user: adminUser };
      }
      
      // Para otros usuarios, crear usuario temporal
      const regularUser = {
        id: 'user_' + Date.now(),
        email: email,
        name: email.split('@')[0],
        role: 'user'
      };
      
      setUser(regularUser);
      persistSession(regularUser, 'user_token_' + Date.now());
      
      console.log('✅ AUTH: Login exitoso (Usuario)');
      return { success: true, user: regularUser };
      
    } catch (error) {
      console.error('❌ AUTH: Error en login:', error);
      return { success: false, error: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    console.log('📝 AUTH: Intento de registro:', userData.email);
    setLoading(true);
    
    try {
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        role: 'user'
      };
      
      setUser(newUser);
      persistSession(newUser, 'user_token_' + Date.now());
      
      console.log('✅ AUTH: Registro exitoso');
      return { success: true, user: newUser };
      
    } catch (error) {
      console.error('❌ AUTH: Error en registro:', error);
      return { success: false, error: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 AUTH: Logout');
    setUser(null);
    clearSession();
  };

  const updateProfile = async (userData) => {
    console.log('👤 AUTH: Actualizando perfil:', userData);
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      persistSession(updatedUser);
      return { success: true, user: updatedUser };
    }
    return { success: false, error: 'No user logged in' };
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const hasRole = (role) => {
    return user && user.role === role;
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
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
