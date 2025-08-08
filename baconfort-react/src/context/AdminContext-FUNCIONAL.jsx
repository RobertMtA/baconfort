import { createContext, useContext } from 'react';

const AdminContext = createContext();

// AdminProvider FUNCIONAL sin estado que causa bucles
export const AdminProvider = ({ children }) => {
  // SIN useState - Usar solo funciones que retornan datos estáticos
  
  // Mock data estático para evitar llamadas a API
  const mockProperties = {
    'moldes-1680': {
      id: 'moldes-1680',
      title: 'Moldes 1680',
      name: 'Moldes 1680',
      address: 'Moldes 1680, CABA',
      prices: { daily: 'USD 65', weekly: 'USD 350', monthly: 'USD 1100' },
      coverImage: '/img/img-portada-moldes-1680.jpg',
      amenities: {
        departamento: [
          { icon: 'fas fa-tv', text: 'Smart TV 55"' },
          { icon: 'fas fa-wifi', text: 'WiFi 500MB Fibra Óptica' },
          { icon: 'fas fa-snowflake', text: 'Aire Acondicionado F/C' }
        ],
        servicios: [
          { icon: 'fas fa-shield-alt', text: 'Seguridad 24hs' },
          { icon: 'fas fa-tshirt', text: 'Lavarropas' }
        ]
      }
    },
    'santa-fe-3770': {
      id: 'santa-fe-3770', 
      title: 'Santa Fe 3770',
      name: 'Santa Fe 3770',
      address: 'Santa Fe 3770, CABA',
      prices: { daily: 'USD 75', weekly: 'USD 420', monthly: 'USD 1300' },
      coverImage: '/img/img-portada-santa-fe-3770.jpg',
      amenities: {
        departamento: [
          { icon: 'fas fa-tv', text: 'Smart TV 65"' },
          { icon: 'fas fa-wifi', text: 'WiFi Fibra Óptica' },
          { icon: 'fas fa-snowflake', text: 'Aire Acondicionado' }
        ]
      }
    },
    'dorrego-1548': {
      id: 'dorrego-1548',
      title: 'Dorrego 1548',
      name: 'Dorrego 1548', 
      address: 'Dorrego 1548, CABA',
      prices: { daily: 'USD 70', weekly: 'USD 380', monthly: 'USD 1150' },
      coverImage: '/img/img-portada-dorrego-1548.jpg',
      amenities: {
        departamento: [
          { icon: 'fas fa-tv', text: 'Smart TV' },
          { icon: 'fas fa-wifi', text: 'WiFi' }
        ]
      }
    },
    'convencion-1994': {
      id: 'convencion-1994',
      title: 'Convención 1994',
      name: 'Convención 1994',
      address: 'Convención 1994, CABA',
      prices: { daily: 'USD 70', weekly: 'USD 400', monthly: 'USD 1200' },
      coverImage: '/img/img-portada-convencion-1994.jpg',
      amenities: {
        departamento: [
          { icon: 'fas fa-tv', text: 'Smart TV' },
          { icon: 'fas fa-wifi', text: 'WiFi' }
        ]
      }
    },
    'ugarteche-2824': {
      id: 'ugarteche-2824',
      title: 'Ugarteche 2824',
      name: 'Ugarteche 2824',
      address: 'Ugarteche 2824, CABA',
      prices: { daily: 'USD 80', weekly: 'USD 450', monthly: 'USD 1400' },
      coverImage: '/img/img-portada-ugarteche-2824.jpg',
      amenities: {
        departamento: [
          { icon: 'fas fa-tv', text: 'Smart TV' },
          { icon: 'fas fa-wifi', text: 'WiFi Premium' }
        ]
      }
    }
  };

  // Funciones que retornan datos estáticos - SIN estado interno
  const getProperty = (propertyId) => {
    console.log('🏠 AdminProvider: getProperty', propertyId);
    return mockProperties[propertyId] || null;
  };

  const getAllProperties = () => {
    console.log('🏠 AdminProvider: getAllProperties');
    return Object.values(mockProperties);
  };

  const value = {
    // Estado mock
    isAuthenticated: true, // Siempre autenticado en versión funcional
    adminUser: {
      name: 'Administrador BACONFORT',
      email: 'admin@baconfort.com',
      loginTime: Date.now()
    },
    sessionId: 'admin-session-001',
    
    // Data mock para AmenitiesManager
    data: {
      properties: mockProperties
    },
    
    // Funciones funcionales
    getProperty,
    getAllProperties,
    
    // Función de logout mock
    logout: () => {
      console.log('🏠 AdminProvider: logout (mock)');
      return Promise.resolve(true);
    },
    
    // Funciones mock para componentes que las necesiten
    updateProperty: (id, data) => {
      console.log('🏠 AdminProvider: updateProperty (mock)', id, data);
      return Promise.resolve(data);
    },
    addProperty: (data) => {
      console.log('🏠 AdminProvider: addProperty (mock)', data);
      return Promise.resolve(data);
    },
    deleteProperty: (id) => {
      console.log('🏠 AdminProvider: deleteProperty (mock)', id);
      return Promise.resolve(true);
    },
    updatePromotions: (data) => {
      console.log('🏠 AdminProvider: updatePromotions (mock)', data);
      return Promise.resolve(data);
    },
    getPromotions: () => {
      console.log('🏠 AdminProvider: getPromotions (mock)');
      return [];
    },
    addPromotion: (data) => {
      console.log('🏠 AdminProvider: addPromotion (mock)', data);
      return Promise.resolve(data);
    },
    deletePromotion: (id) => {
      console.log('🏠 AdminProvider: deletePromotion (mock)', id);
      return Promise.resolve(true);
    },
    refreshData: () => {
      console.log('🏠 AdminProvider: refreshData (mock)');
      return Promise.resolve(true);
    },
    loadPropertiesFromBackend: () => {
      console.log('🏠 AdminProvider: loadPropertiesFromBackend (mock)');
      return Promise.resolve(mockProperties);
    },
    resetData: () => {
      console.log('🏠 AdminProvider: resetData (mock)');
    },
    forceRefresh: () => {
      console.log('🏠 AdminProvider: forceRefresh (mock)');
    },
    reinitializeDataWithBlockFields: () => {
      console.log('🏠 AdminProvider: reinitializeDataWithBlockFields (mock)');
    }
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
