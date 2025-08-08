import { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

// Versión estática temporal para evitar bucles infinitos
export const AdminProvider = ({ children }) => {
  const [data, setData] = useState({
    promotions: [],
    properties: {}
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // SIN useEffect - versión estática
  const value = {
    data,
    loading,
    error,
    setData,
    // Funciones mock que no hacen nada para evitar errores
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
