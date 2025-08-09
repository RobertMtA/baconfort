# Script para actualizar AdminContext-FIXED.jsx con todas las funciones necesarias

Write-Host "🛠️ Actualizando AdminContext-FIXED.jsx con funciones adicionales..." -ForegroundColor Cyan

# Crear una versión mejorada de AdminContext-FIXED.jsx
$fixedContextContent = @"
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { propertyAPI } from '../services/api';
import { cleanupDemoImages } from '../utils/ImageCleanup';

// Crear el contexto
const AdminContext = createContext();

// Hook personalizado para usar el contexto
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin debe ser usado dentro de un AdminProvider');
  }
  return context;
};

// Utilidad para gestionar localStorage con protección contra quota exceeded
const LocalStorageManager = {
  // Verificar el tamaño actual de localStorage
  getStorageSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  },

  // Limpiar localStorage manteniendo solo lo esencial
  cleanStorage() {
    try {
      const currentProperties = JSON.parse(localStorage.getItem('baconfort_admin_properties') || '{}');
      
      // Mantener solo propiedades recientes (últimas 3)
      const propertyEntries = Object.entries(currentProperties);
      const recentProperties = propertyEntries
        .sort((a, b) => new Date(b[1].updatedAt || 0) - new Date(a[1].updatedAt || 0))
        .slice(0, 3);
      
      const cleanedStorage = Object.fromEntries(recentProperties);
      localStorage.setItem('baconfort_admin_properties', JSON.stringify(cleanedStorage));
      
      console.log('🧹 LocalStorageManager: Limpieza completada, propiedades mantenidas:', Object.keys(cleanedStorage));
      return cleanedStorage;
    } catch (error) {
      console.error('❌ LocalStorageManager: Error en limpieza:', error);
      return {};
    }
  },

  // Guardar con protección contra quota exceeded
  safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('⚠️ LocalStorageManager: Quota excedida, limpiando storage...');
        this.cleanStorage();
        
        // Intentar guardar de nuevo después de limpiar
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (retryError) {
          console.error('❌ LocalStorageManager: Imposible guardar después de limpieza:', retryError);
          return false;
        }
      } else {
        console.error('❌ LocalStorageManager: Error al guardar:', error);
        return false;
      }
    }
  }
};

// Provider Component
export const AdminProvider = ({ children }) => {
  // Estado básico de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [adminUser, setAdminUser] = useState({
    name: 'Administrador BACONFORT',
    email: 'baconfort.centro@gmail.com',
    loginTime: Date.now()
  });

  // Estado para datos de la aplicación
  const [properties, setProperties] = useState({});
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  // Función básica de logout para manejar el cierre de sesión
  const logout = useCallback(() => {
    // Eliminar datos del localStorage
    localStorage.removeItem('baconfort_admin_session');
    localStorage.removeItem('baconfort_admin_user');
    localStorage.removeItem('baconfort-token');
    localStorage.removeItem('baconfort-admin-token');
    localStorage.removeItem('baconfort-user');
    
    // Actualizar estado
    setIsAuthenticated(false);
    
    // Redireccionar a la página de inicio
    window.location.href = '/';
    
    console.log('🚪 AdminProvider: Logout completado');
    return true;
  }, []);

  // Funciones para gestionar propiedades
  const getAllProperties = useCallback(() => {
    return properties;
  }, [properties]);

  const getProperty = useCallback((propertyId) => {
    return properties[propertyId] || null;
  }, [properties]);

  const updateProperty = useCallback(async (id, data) => {
    console.log('🏠 AdminProvider: updateProperty', id, data);
    
    setProperties(prevProperties => ({
      ...prevProperties,
      [id]: {
        ...prevProperties[id],
        ...data,
        updatedAt: new Date().toISOString()
      }
    }));
    
    setLastUpdate(Date.now());
    return { success: true };
  }, []);

  const addProperty = useCallback(async (data) => {
    console.log('🏠 AdminProvider: addProperty', data);
    
    const newId = data.id || \`property-\${Date.now()}\`;
    
    setProperties(prevProperties => ({
      ...prevProperties,
      [newId]: {
        ...data,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }));
    
    setLastUpdate(Date.now());
    return { success: true, propertyId: newId };
  }, []);

  const deleteProperty = useCallback(async (id) => {
    console.log('🏠 AdminProvider: deleteProperty', id);
    
    setProperties(prevProperties => {
      const newProperties = { ...prevProperties };
      delete newProperties[id];
      return newProperties;
    });
    
    setLastUpdate(Date.now());
    return true;
  }, []);

  const loadPropertiesFromBackend = useCallback(async () => {
    console.log('🏠 AdminProvider: loadPropertiesFromBackend');
    try {
      const backendProperties = await propertyAPI.getAllProperties();
      
      const propertiesObject = {};
      if (Array.isArray(backendProperties)) {
        backendProperties.forEach(property => {
          propertiesObject[property.id] = property;
        });
      }
      
      setProperties(propertiesObject);
      return propertiesObject;
    } catch (error) {
      console.error('❌ Error cargando propiedades:', error);
      return {};
    }
  }, []);

  // Funciones de utilidad
  const debugStoredProperties = useCallback(() => {
    console.log('🔍 AdminProvider: debugStoredProperties', properties);
    return properties;
  }, [properties]);

  const cleanupLocalStorageImages = useCallback(() => {
    console.log('🧹 AdminProvider: cleanupLocalStorageImages');
    return true;
  }, []);

  const cleanupTestProperties = useCallback(() => {
    console.log('🧹 AdminProvider: cleanupTestProperties');
    return true;
  }, []);

  const forcePriceSync = useCallback(() => {
    console.log('💰 AdminProvider: forcePriceSync');
    setLastUpdate(Date.now());
    return true;
  }, []);

  // Función para obtener propiedad por nombre (para compatibilidad)
  const getPropertyByName = useCallback((propertyName) => {
    const property = Object.values(properties).find(
      p => p.name?.toLowerCase() === propertyName.toLowerCase()
    );
    return property || null;
  }, [properties]);

  // Mock de funciones para compatibilidad
  const refreshData = useCallback(() => true, []);
  const updatePromotions = useCallback(() => true, []);
  const getPromotions = useCallback(() => [], []);
  const addPromotion = useCallback(() => true, []);
  const deletePromotion = useCallback(() => true, []);
  const resetData = useCallback(() => {}, []);
  const forceRefresh = useCallback(() => {}, []);
  const reinitializeDataWithBlockFields = useCallback(() => {}, []);
  const cleanCorePropertiesLocalFlags = useCallback(() => {}, []);
  const migratePropertyStructure = useCallback(() => {}, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadPropertiesFromBackend();
  }, [loadPropertiesFromBackend]);
  
  const value = {
    // Estado
    isAuthenticated,
    setIsAuthenticated,
    adminUser,
    lastUpdate,
    
    // Data para compatibilidad
    data: {
      properties: properties
    },
    properties,
    
    // Funciones principales
    getProperty,
    getPropertyByName,
    getAllProperties,
    updateProperty,
    addProperty,
    deleteProperty,
    loadPropertiesFromBackend,
    refreshData,
    logout,
    debugStoredProperties,
    cleanupLocalStorageImages,
    cleanupTestProperties,
    forcePriceSync,
    
    // Funciones adicionales
    updatePromotions,
    getPromotions,
    addPromotion,
    deletePromotion,
    resetData,
    forceRefresh,
    reinitializeDataWithBlockFields,
    cleanCorePropertiesLocalFlags,
    migratePropertyStructure
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
"@

# Guardar el archivo
$fixedContextContent | Out-File -FilePath ".\baconfort-react\src\context\AdminContext-FIXED.jsx" -Encoding utf8

Write-Host "✅ AdminContext-FIXED.jsx actualizado exitosamente con funciones adicionales" -ForegroundColor Green
