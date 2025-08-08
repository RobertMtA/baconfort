// Versión estática temporal para evitar bucles infinitos
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
  const [loading, setLoading] = useState(true); // Inicia en true para mostrar loading al restaurar sesión

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
        // Limpiar datos corruptos
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

  // LOGIN CON VERIFICACIÓN REAL EN BACKEND
  const login = async (email, password) => {
    console.log('🔐 AUTH: Intento de login:', email);
    setLoading(true);
    
    try {
      // LLAMAR AL BACKEND REAL PARA VALIDAR CREDENCIALES
      const response = await fetch('http://localhost:5004/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        const authenticatedUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          phone: data.user.phone,
          emailVerified: data.user.emailVerified,
          createdAt: data.user.createdAt
        };
        
        setUser(authenticatedUser);
        persistSession(authenticatedUser, data.token);
        
        console.log('✅ AUTH: Login exitoso verificado por backend:', data.user.role);
        return { success: true, user: authenticatedUser };
      } else {
        console.error('❌ AUTH: Error en login:', data.error);
        
        // Caso específico: email no verificado
        if (data.needsEmailVerification) {
          return { 
            success: false, 
            error: data.error,
            suggestion: 'verify-email',
            message: 'Necesitas verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada y haz clic en el enlace de verificación.'
          };
        }
        
        // Si el usuario no existe, sugerir registro
        if (data.error === 'Credenciales inválidas') {
          return { 
            success: false, 
            error: data.error,
            suggestion: 'register',
            message: 'El usuario no existe. ¿Deseas registrarte?'
          };
        }
        return { success: false, error: data.error };
      }
      
    } catch (error) {
      console.error('❌ AUTH: Error en login:', error);
      // Error de conexión - el backend no está disponible
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        return { 
          success: false, 
          error: 'No se pudo conectar al servidor. Verifica que el backend esté corriendo.',
          suggestion: 'retry',
          technical: 'ERR_CONNECTION_REFUSED - Backend no disponible en puerto 5004'
        };
      }
      return { success: false, error: 'Error de conexión al servidor' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    console.log('📝 AUTH: Intento de registro real:', userData.email);
    setLoading(true);
    
    try {
      // Llamar al endpoint real del backend
      const response = await fetch('http://localhost:5004/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ AUTH: Registro exitoso en base de datos');
        
        // Verificar si requiere verificación de email
        if (data.requiresEmailVerification) {
          console.log('📧 AUTH: Registro exitoso pero requiere verificación de email');
          return { 
            success: true, 
            requiresEmailVerification: true,
            message: data.message,
            user: {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              emailVerified: false
            }
          };
        }
        
        // Si tiene token (para usuarios que no requieren verificación)
        if (data.token) {
          const realUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role
          };
          
          setUser(realUser);
          persistSession(realUser, data.token);
          
          return { success: true, user: realUser };
        }
        
        // Fallback: registro exitoso sin token
        return { 
          success: true, 
          message: data.message,
          requiresEmailVerification: true
        };
      } else {
        console.error('❌ AUTH: Error del servidor:', data.error);
        return { success: false, error: data.error };
      }
      
    } catch (error) {
      console.error('❌ AUTH: Error en registro:', error);
      return { success: false, error: 'Error de conexión al servidor' };
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

  // Funciones adicionales requeridas por los componentes
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
