// Versión estática temporal para evitar bucles infinitos
import { createContext, useContext, useState } from 'react';

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

  // SIN useEffect - versión estática
  const login = async (email, password) => {
    console.log('Login attempt:', email);
    // Simular login exitoso
    const mockUser = {
      id: 'demo_user_123',
      email: email,
      name: 'Usuario Demo',
      role: 'user'
    };
    setUser(mockUser);
    return { success: true, user: mockUser };
  };

  const register = async (userData) => {
    console.log('Register attempt:', userData.email);
    const mockUser = {
      id: 'demo_user_123',
      email: userData.email,
      name: userData.name || 'Usuario Demo',
      role: 'user'
    };
    setUser(mockUser);
    return { success: true, user: mockUser };
  };

  const logout = () => {
    console.log('Logout');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    console.log('Update profile:', userData);
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    }
    return { success: false, error: 'No user logged in' };
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
