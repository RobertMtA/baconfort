import { useState, useEffect } from 'react';
import { useOccupiedDates } from './useOccupiedDates';

/**
 * Hook SIMPLIFICADO para obtener todas las fechas no disponibles
 * Versión temporal para detener bucles infinitos
 */
export const useAllOccupiedDates = (propertyId) => {
  const { 
    occupiedDates: realOccupiedDates, 
    loading, 
    error
  } = useOccupiedDates(propertyId);
  
  const [adminBlockedDates, setAdminBlockedDates] = useState([]);
  const [combinedOccupiedDates, setCombinedOccupiedDates] = useState([]);

  // Cargar datos del admin SOLO una vez al inicio
  useEffect(() => {
    if (!propertyId) return;
    
    const storageKey = `baconfort_manual_occupancy_${propertyId}`;
    const savedData = localStorage.getItem(storageKey);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        if (Array.isArray(parsedData)) {
          setAdminBlockedDates(parsedData);
        } else if (parsedData && parsedData.manualOccupiedDates) {
          const manualOccupiedDates = parsedData.manualOccupiedDates || [];
          const manuallyRemovedDates = parsedData.manuallyRemovedDates || [];
          
          const activeManualDates = manualOccupiedDates.filter(
            date => !manuallyRemovedDates.includes(date)
          );
          
          setAdminBlockedDates(activeManualDates);
        }
      } catch (error) {
        console.error('Error parsing admin blocked dates:', error);
        setAdminBlockedDates([]);
      }
    } else {
      setAdminBlockedDates([]);
    }
  }, [propertyId]); // Solo cuando cambie el propertyId

  // Combinar fechas SOLO cuando cambien las dependencias
  useEffect(() => {
    const combined = [
      ...realOccupiedDates,
      ...adminBlockedDates
    ].filter((date, index, array) => array.indexOf(date) === index).sort();
    
    setCombinedOccupiedDates(combined);
  }, [realOccupiedDates, adminBlockedDates]);

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
    realOccupiedDates,
    adminBlockedDates
  };
};
