import { useState, useEffect, useContext } from 'react';
import { useAdmin } from '../context/AdminContext-STATEFUL';

// Hook que obtiene propiedades del AdminContext y se actualiza automáticamente
export const usePropertyFromContext = (propertyId) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Obtener contexto admin completo
  const adminContext = useAdmin();
  const { getProperty, getAllProperties, lastUpdate } = adminContext;
  
  // Obtener todas las propiedades para detectar cambios
  const allProperties = getAllProperties();
  
  useEffect(() => {
    const loadProperty = () => {
      try {
        setLoading(true);
        setError(null);
        
        const contextProperty = getProperty(propertyId);
        
        if (contextProperty) {
          // Verificar si la propiedad está bloqueada
          if (contextProperty.isBlocked) {
            console.log('🚫 usePropertyFromContext: Propiedad bloqueada:', propertyId);
            setError(new Error(`Propiedad ${propertyId} está bloqueada y no disponible`));
            setProperty(null);
            setLoading(false);
            return;
          }
          
          // Formatear precios si es necesario - SOLO SI NO TIENEN USD
          const formattedProperty = {
            ...contextProperty,
            prices: contextProperty.prices?.daily?.toString?.()?.includes?.('USD') ? 
              contextProperty.prices : 
              {
                daily: `USD ${contextProperty.prices?.daily?.toString?.() || 0}`,
                weekly: `USD ${contextProperty.prices?.weekly?.toString?.() || 0}`, 
                monthly: `USD ${contextProperty.prices?.monthly?.toString?.() || 0}`,
                currency: 'USD'
              }
          };
          
          setProperty(formattedProperty);
        } else {
          setError(new Error(`Propiedad ${propertyId} no encontrada en contexto`));
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId, lastUpdate, allProperties]); // MEJORADO: También escuchar allProperties
  
  // Función para refrescar manualmente
  const refreshProperty = () => {
    const contextProperty = getProperty(propertyId);
    if (contextProperty) {
      setProperty(contextProperty);
    }
  };

  // Verificar cambios IMMEDIATOS en el contexto - CLAVE PARA ACTUALIZACIONES EN TIEMPO REAL
  useEffect(() => {
    const currentProperty = getProperty(propertyId);
    if (currentProperty && property) {
      // Verificar si los precios han cambiado
      const currentPricesStr = JSON.stringify(currentProperty.prices);
      const savedPricesStr = JSON.stringify(property.prices);
      
      if (currentPricesStr !== savedPricesStr) {
        setProperty(currentProperty);
      }
    }
  }, [allProperties, lastUpdate, propertyId]); // Trigger cuando cambie el contexto
  
  return {
    property,
    loading,
    error,
    refreshProperty,
    isUsingContext: true,
    contextData: allProperties // Para debugging
  };
};
