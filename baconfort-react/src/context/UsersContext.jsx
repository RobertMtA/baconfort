import React, { createContext, useState, useContext, useEffect } from 'react';
import { usersAPI } from '../services/api';

const UsersContext = createContext();

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para cargar usuarios
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usersAPI.getAll();
      
      if (response.success) {
        setUsers(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('❌ UsersContext: Error cargando usuarios:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener estadísticas
  const getStats = async () => {
    console.log('🔍 UsersContext: Obteniendo estadísticas...');
    try {
      const response = await usersAPI.getStats();
      console.log('📊 UsersContext: Estadísticas:', response);
      return response;
    } catch (err) {
      console.error('❌ UsersContext: Error obteniendo estadísticas:', err);
      return { success: false, error: err.message };
    }
  };

  // Función para actualizar usuario
  const updateUser = async (userId, userData) => {
    console.log('🔍 UsersContext: Actualizando usuario:', userId);
    try {
      const response = await usersAPI.update(userId, userData);
      console.log('📊 UsersContext: Usuario actualizado:', response);
      
      if (response.success) {
        // Recargar usuarios
        await loadUsers();
      }
      
      return response;
    } catch (err) {
      console.error('❌ UsersContext: Error actualizando usuario:', err);
      return { success: false, error: err.message };
    }
  };

  // Función para eliminar usuario
  const deleteUser = async (userId) => {
    console.log('🔍 UsersContext: Eliminando usuario:', userId);
    try {
      const response = await usersAPI.delete(userId);
      console.log('📊 UsersContext: Usuario eliminado:', response);
      
      if (response.success) {
        // Recargar usuarios
        await loadUsers();
      }
      
      return response;
    } catch (err) {
      console.error('❌ UsersContext: Error eliminando usuario:', err);
      return { success: false, error: err.message };
    }
  };

  // Cargar usuarios al inicializar
  useEffect(() => {
    loadUsers();
  }, []);

  const value = {
    users,
    loading,
    error,
    loadUsers,
    getStats,
    updateUser,
    deleteUser,
    // Estadísticas calculadas
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    guestUsers: users.filter(u => u.role === 'guest').length
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
};

export default UsersProvider;
