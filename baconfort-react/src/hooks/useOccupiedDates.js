import { useState, useEffect } from 'react';
import { reservationsAPI } from '../services/api';
import { getMockReservationsForProperty } from '../data/mockReservations';

/**
 * Hook personalizado para obtener fechas ocupadas de una propiedad
 * @param {string} propertyId - ID de la propiedad
 * @returns {object} - { occupiedDates, loading, error }
 */
export const useOccupiedDates = (propertyId) => {
  const [occupiedDates, setOccupiedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!propertyId) return;

    const fetchOccupiedDates = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let response;
        
        try {
          // Intentar obtener datos del backend
          console.log(`🌐 [useOccupiedDates] Intentando cargar desde backend para ${propertyId}...`);
          response = await reservationsAPI.getByProperty(propertyId);
          console.log(`✅ [useOccupiedDates] Backend exitoso para ${propertyId}:`, response);
        } catch (backendError) {
          // Si falla el backend, usar datos mock
          console.log(`❌ [useOccupiedDates] Backend falló para ${propertyId}, usando datos mock:`, backendError.message);
          response = await getMockReservationsForProperty(propertyId);
          console.log(`🧪 [useOccupiedDates] Datos mock cargados para ${propertyId}:`, response);
        }
        
        const reservations = response.data || response;
        
        if (Array.isArray(reservations)) {
          // Convertir reservas (reales o mock) en fechas ocupadas
          const dates = [];
          
          console.log(`🗓️ [useOccupiedDates] Procesando reservas para ${propertyId}:`, reservations);
          
          reservations.forEach((reservation, index) => {
            console.log(`🔍 Reserva ${index + 1}:`, {
              checkIn: reservation.checkIn,
              checkOut: reservation.checkOut,
              status: reservation.status
            });
            
            // Solo considerar reservas confirmadas o en proceso
            if (reservation.status === 'confirmed' || reservation.status === 'pending') {
              const checkIn = new Date(reservation.checkIn);
              const checkOut = new Date(reservation.checkOut);
              
              // Generar todas las fechas entre check-in y check-out (inclusivo)
              // Usar solo manipulación de strings para evitar problemas de zona horaria
              const checkInStr = reservation.checkIn.split('T')[0]; // Obtener solo YYYY-MM-DD
              const checkOutStr = reservation.checkOut.split('T')[0]; // Obtener solo YYYY-MM-DD
              
              console.log(`📅 Procesando rango: ${checkInStr} → ${checkOutStr}`);
              
              // Parsear fechas manualmente para evitar problemas de zona horaria
              const [startYear, startMonth, startDay] = checkInStr.split('-').map(Number);
              const [endYear, endMonth, endDay] = checkOutStr.split('-').map(Number);
              
              const startDate = new Date(startYear, startMonth - 1, startDay); // Mes 0-indexed
              const endDate = new Date(endYear, endMonth - 1, endDay);
              
              const currentDate = new Date(startDate);
              
              // Generar fechas día por día usando fecha local
              while (currentDate <= endDate) {
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const day = String(currentDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                
                console.log(`  ➕ Agregando fecha ocupada: ${dateStr}`);
                dates.push(dateStr);
                
                // Avanzar un día
                currentDate.setDate(currentDate.getDate() + 1);
              }
            }
          });
          
          // Eliminar duplicados y ordenar
          const uniqueDates = [...new Set(dates)].sort();
          console.log(`✅ [useOccupiedDates] Fechas ocupadas finales para ${propertyId}:`, uniqueDates);
          setOccupiedDates(uniqueDates);
          
        } else {
          setOccupiedDates([]);
        }
        
      } catch (err) {
        setError(err.message || 'Error al cargar fechas ocupadas');
        setOccupiedDates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOccupiedDates();
  }, [propertyId]);

  /**
   * Verificar si una fecha específica está ocupada
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @returns {boolean}
   */
  const isDateOccupied = (date) => {
    return occupiedDates.includes(date);
  };

  /**
   * Verificar si un rango de fechas está disponible
   * @param {string} startDate - Fecha inicio en formato YYYY-MM-DD
   * @param {string} endDate - Fecha fin en formato YYYY-MM-DD
   * @returns {boolean}
   */
  const isRangeAvailable = (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    
    // Usar solo manipulación de strings para evitar problemas de zona horaria
    const startDateStr = startDate.split('T')[0]; // Obtener solo YYYY-MM-DD
    const endDateStr = endDate.split('T')[0]; // Obtener solo YYYY-MM-DD
    
    // Parsear fechas manualmente para evitar problemas de zona horaria
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
    
    const start = new Date(startYear, startMonth - 1, startDay); // Mes 0-indexed
    const end = new Date(endYear, endMonth - 1, endDay);
    
    const currentDate = new Date(start);
    
    // Verificar cada día en el rango usando fecha local
    while (currentDate <= end) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      if (occupiedDates.includes(dateStr)) {
        return false;
      }
      
      // Avanzar un día
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return true;
  };

  return {
    occupiedDates,
    loading,
    error,
    isDateOccupied,
    isRangeAvailable
  };
};
