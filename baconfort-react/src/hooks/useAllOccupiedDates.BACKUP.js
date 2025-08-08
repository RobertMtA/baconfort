import { useState, useEffect } from 'react';
import { useOccupiedDates } from './useOccupiedDates';

/**
 * Hook para obtener todas las fechas no disponibles:
 * - Reservas reales del backend
 * - Bloqueos manuales del admin
 * 
 * @param {string} propertyId - ID de la propiedad
 * @returns {object} - { occupiedDates, loading, error, isRangeAvailable }
 */
export const useAllOccupiedDates = (propertyId) => {


  const { 
    occupiedDates: realOccupiedDates, 
    loading, 
    error, 
    isRangeAvailable: isRealRangeAvailable 
  } = useOccupiedDates(propertyId);
  
  const [adminBlockedDates, setAdminBlockedDates] = useState([]);
  const [combinedOccupiedDates, setCombinedOccupiedDates] = useState([]);

  // Función de sincronización manual para debugging (accesible desde consola)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Función para forzar recarga de datos
      window.forceReloadOccupancy = (propertyId) => {
        console.log('Manual reload requested for:', propertyId);
      };
    }
  }, []);

  // Cargar bloqueos manuales del admin desde localStorage (SIMPLIFICADO)
  useEffect(() => {
    if (!propertyId) return;
    
    const loadAdminBlocks = () => {
      const storageKey = `baconfort_manual_occupancy_${propertyId}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          
          if (Array.isArray(parsedData)) {
            // Array simple de fechas
            setAdminBlockedDates(parsedData);
          } else if (parsedData && typeof parsedData === 'object') {
            // Objeto complejo
            const manualOccupiedDates = parsedData.manualOccupiedDates || [];
            const manuallyRemovedDates = parsedData.manuallyRemovedDates || [];
            
            // Fechas activas (manual - removidas)
            const activeManualDates = manualOccupiedDates.filter(
              date => !manuallyRemovedDates.includes(date)
            );
            
            setAdminBlockedDates(activeManualDates);
          }
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
          setAdminBlockedDates([]);
        }
      } else {
        setAdminBlockedDates([]);
      }
    };

    // Solo cargar una vez al inicio
    loadAdminBlocks();

    // ELIMINAR POLLING - solo eventos manuales
    const handleStorageChange = (event) => {
      if (event.key === `baconfort_manual_occupancy_${propertyId}`) {
        loadAdminBlocks();
      }
    };

    const handleCustomEvent = (event) => {
      if (event.detail && event.detail.propertyId === propertyId) {
        setTimeout(loadAdminBlocks, 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('manualOccupancyChanged', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('manualOccupancyChanged', handleCustomEvent);
    };
  }, [propertyId]); // Solo cuando cambie propertyId

  // Combinar fechas reales + bloqueos admin (OPTIMIZADO)
  useEffect(() => {
    const combined = [
      ...realOccupiedDates,
      ...adminBlockedDates
    ].filter((date, index, array) => array.indexOf(date) === index).sort();
    
    // Solo actualizar si realmente cambió
    const currentCombined = JSON.stringify(combined);
    const previousCombined = JSON.stringify(combinedOccupiedDates);
    
    if (currentCombined !== previousCombined) {
      setCombinedOccupiedDates(combined);
    }
  }, [realOccupiedDates, adminBlockedDates]); // Remover propertyId de dependencias

  /**
   * Verificar si un rango de fechas está disponible
   * (No incluye fechas reales ni bloqueadas por admin)
   */
  const isRangeAvailable = (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calcular el número de días en el rango
    const startTime = start.getTime();
    const endTime = end.getTime();
    const daysDiff = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)) + 1;
    
    // Verificar cada día usando un bucle for más controlado
    for (let i = 0; i < daysDiff; i++) {
      // Crear una nueva fecha para cada día
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      // Usar el mismo formato que en la generación de fechas ocupadas
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      if (combinedOccupiedDates.includes(dateStr)) {
        return false;
      }
    }
    
    return true;
  };

  /**
   * Verificar si una fecha específica está ocupada
   */
  const isDateOccupied = (date) => {
    return combinedOccupiedDates.includes(date);
  };

  return {
    occupiedDates: combinedOccupiedDates,
    loading,
    error,
    isRangeAvailable,
    isDateOccupied,
    // Datos separados para debugging
    realOccupiedDates,
    adminBlockedDates
  };
};


