import { createContext, useContext } from 'react';

const AdminContext = createContext();

// ULTRA-BÁSICO: Solo context sin estado
export const AdminProvider = ({ children }) => {
  // Funciones completamente vacías - NO useState, NO useEffect
  const value = {
    // Solo funciones vacías para que no crashee
    getProperty: () => null,
    getAllProperties: () => [],
    updateProperty: () => {},
    addProperty: () => {},
    deleteProperty: () => {},
    updatePromotions: () => {},
    refreshData: () => {},
    resetData: () => {},
    forceRefresh: () => {},
    reinitializeDataWithBlockFields: () => {}
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
