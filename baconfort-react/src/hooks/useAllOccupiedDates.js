import { useState, useEffect } from 'react';
import { useOccupiedDates } from './useOccupiedDates';

/**
 * Hook COMBINADO - Incluye tanto bloqueos manuales como reservas reales/mock
 */
export const useAllOccupiedDates = (propertyId) => {
  const [combinedOccupiedDates, setCombinedOccupiedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener fechas de reservas reales/mock
  const { occupiedDates: realOccupiedDates, loading: realLoading } = useOccupiedDates(propertyId);

  // Combinar con bloqueos manuales del admin
  useEffect(() => {
    if (!propertyId) return;
    
    console.log(`🔧 [useAllOccupiedDates] Combinando fechas para ${propertyId}...`);
    
    // Cargar bloqueos manuales del localStorage
    const storageKey = `baconfort_manual_occupancy_${propertyId}`;
    const savedData = localStorage.getItem(storageKey);
    
    let adminDates = [];
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        if (Array.isArray(parsedData)) {
          adminDates = parsedData;
        } else if (parsedData && parsedData.manualOccupiedDates) {
          const manualOccupiedDates = parsedData.manualOccupiedDates || [];
          const manuallyRemovedDates = parsedData.manuallyRemovedDates || [];
          
          // Las fechas manuales agregadas, menos las removidas
          adminDates = manualOccupiedDates.filter(
            date => !manuallyRemovedDates.includes(date)
          );
          
          console.log(`📅 [useAllOccupiedDates] Bloqueos manuales para ${propertyId}:`, adminDates);
        }
      } catch (error) {
        console.error('Error parsing admin dates:', error);
        adminDates = [];
      }
    }
    
    // Combinar fechas reales + fechas manuales (evitar duplicados)
    const realDates = realOccupiedDates || [];
    const allDates = [...realDates, ...adminDates];
    const uniqueDates = [...new Set(allDates)].sort();
    
    console.log(`📊 [useAllOccupiedDates] ${propertyId} - Combinando fechas:`);
    console.log(`   📅 Fechas reales (backend):`, realDates);
    console.log(`   🔒 Fechas admin (manual):`, adminDates);
    console.log(`   ✅ Total combinadas:`, uniqueDates);
    
    setCombinedOccupiedDates(uniqueDates);
    setLoading(realLoading);
    
  }, [propertyId, realOccupiedDates, realLoading]); // Reaccionar a cambios en fechas reales

  const isRangeAvailable = (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startTime = start.getTime();
    const endTime = end.getTime();
    const daysDiff = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)) + 1;
    
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
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

  const isDateOccupied = (date) => {
    return combinedOccupiedDates.includes(date);
  };

  return {
    occupiedDates: combinedOccupiedDates,
    loading,
    error,
    isRangeAvailable,
    isDateOccupied,
    realOccupiedDates: realOccupiedDates || [],
    adminBlockedDates: combinedOccupiedDates
  };
};
