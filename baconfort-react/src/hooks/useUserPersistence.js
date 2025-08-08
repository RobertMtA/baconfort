// useUserPersistence.js - Hook para persistencia robusta de datos de usuario
import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

// ⚡ CONFIGURACIÓN DE PERSISTENCIA
const SYNC_INTERVAL = 30000; // 30 segundos
const RETRY_DELAY = 5000; // 5 segundos
const MAX_RETRIES = 3;

export const useUserPersistence = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'error'
  const [error, setError] = useState('');

  // 📱 FUNCIONES DE LOCALSTORAGE
  const saveToLocalStorage = useCallback((userData) => {
    try {
      const dataToSave = {
        ...userData,
        lastSync: new Date().toISOString()
      };
      localStorage.setItem('baconfort-user', JSON.stringify(dataToSave));
      console.log('💾 Datos guardados en localStorage');
    } catch (error) {
      console.warn('⚠️ Error al guardar en localStorage:', error.message);
    }
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('baconfort-user');
      if (stored) {
        const userData = JSON.parse(stored);
        console.log('📱 Datos cargados desde localStorage');
        return userData;
      }
    } catch (error) {
      console.warn('⚠️ Error al cargar desde localStorage:', error.message);
    }
    return null;
  }, []);

  // 🔄 SINCRONIZACIÓN CON API
  const syncWithAPI = useCallback(async (retryCount = 0) => {
    try {
      setSyncStatus('syncing');
      console.log('🔄 Sincronizando con API...');
      
      const response = await authAPI.profile();
      const userData = response.user;
      
      // Comparar con datos locales
      const localUser = loadFromLocalStorage();
      const hasChanges = !localUser || JSON.stringify(userData) !== JSON.stringify({
        ...localUser,
        lastSync: localUser.lastSync
      });
      
      if (hasChanges) {
        console.log('📡 Datos actualizados desde servidor');
        setUser(userData);
        saveToLocalStorage(userData);
      } else {
        console.log('✅ Datos ya sincronizados');
      }
      
      setSyncStatus('synced');
      setError('');
      return userData;
      
    } catch (syncError) {
      console.warn('⚠️ Error de sincronización:', syncError.message);
      
      // Intentar nuevamente si no se alcanzó el máximo de reintentos
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Reintentando en ${RETRY_DELAY / 1000}s... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => syncWithAPI(retryCount + 1), RETRY_DELAY);
        return;
      }
      
      // Si falló todas las veces, usar datos locales
      setSyncStatus('error');
      setError(`Error de sincronización: ${syncError.message}`);
      
      const localUser = loadFromLocalStorage();
      if (localUser) {
        console.log('📱 Usando datos locales como fallback');
        setUser(localUser);
      }
      
      return localUser;
    }
  }, [loadFromLocalStorage, saveToLocalStorage]);

  // 📥 CARGAR PERFIL INICIAL
  const loadUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🚀 Cargando perfil de usuario...');
      
      // Intentar cargar desde API primero
      const userData = await syncWithAPI();
      
      if (!userData) {
        // Si no hay datos de API ni localStorage, marcar error
        setError('No se pudieron cargar los datos de usuario');
      }
      
    } catch (error) {
      console.error('❌ Error crítico al cargar perfil:', error);
      setError('Error crítico al cargar el perfil');
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  }, [syncWithAPI]);

  // 💾 ACTUALIZAR PERFIL
  const updateUserProfile = useCallback(async (updateData) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('💾 Actualizando perfil:', updateData);
      
      // Intentar actualizar en API
      const response = await authAPI.updateProfile(updateData);
      const updatedUser = response.user;
      
      // Actualizar estado y localStorage
      setUser(updatedUser);
      saveToLocalStorage(updatedUser);
      setSyncStatus('synced');
      
      console.log('✅ Perfil actualizado exitosamente');
      return { success: true, user: updatedUser };
      
    } catch (updateError) {
      console.error('❌ Error al actualizar perfil:', updateError);
      
      // Mantener cambios localmente como fallback
      const tempUser = { ...user, ...updateData, updatedAt: new Date().toISOString() };
      setUser(tempUser);
      saveToLocalStorage(tempUser);
      setSyncStatus('error');
      setError(`Error al sincronizar: ${updateError.message}`);
      
      console.warn('⚠️ Cambios guardados localmente, reintentando sincronización...');
      
      // Reintenta sincronizar en 5 segundos
      setTimeout(() => syncWithAPI(), RETRY_DELAY);
      
      return { 
        success: false, 
        user: tempUser, 
        error: updateError.message,
        savedLocally: true 
      };
      
    } finally {
      setLoading(false);
    }
  }, [user, saveToLocalStorage, syncWithAPI]);

  // 🔄 CONFIGURAR SINCRONIZACIÓN AUTOMÁTICA
  useEffect(() => {
    // Cargar perfil inicial
    loadUserProfile();
    
    // Configurar sincronización automática
    const syncInterval = setInterval(() => {
      if (syncStatus !== 'syncing') {
        syncWithAPI();
      }
    }, SYNC_INTERVAL);
    
    // Sincronizar antes de cerrar la página
    const handleBeforeUnload = () => {
      // Solo sincronizar si hay cambios pendientes
      if (syncStatus === 'error') {
        syncWithAPI();
      }
    };
    
    const handleVisibilityChange = () => {
      // Sincronizar cuando la página vuelve a ser visible
      if (document.visibilityState === 'visible' && syncStatus === 'error') {
        syncWithAPI();
      }
    };
    
    // Event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadUserProfile, syncWithAPI, syncStatus]);

  // 🔄 SINCRONIZACIÓN MANUAL
  const forceSyncNow = useCallback(() => {
    console.log('🔄 Sincronización manual forzada');
    return syncWithAPI();
  }, [syncWithAPI]);

  // 📊 ESTADO DE PERSISTENCIA
  const persistenceInfo = {
    hasLocalData: !!loadFromLocalStorage(),
    lastSync: user?.lastSync || null,
    isOnline: navigator.onLine,
    syncStatus,
    error
  };

  return {
    // Datos de usuario
    user,
    loading,
    error,
    
    // Estado de sincronización
    syncStatus,
    persistenceInfo,
    
    // Funciones
    updateUserProfile,
    forceSyncNow,
    loadUserProfile
  };
};
