import { useState, useEffect } from 'react';
import { useOccupiedDates } from './useOccupiedDates';

/**
 * Hook para manejar ocupación manual de fechas en el calendario admin
 * Permite agregar y quitar fechas de ocupación manualmente
 */
export const useManualOccupancy = (propertyId) => {
  // Log inicial simplificado
  useEffect(() => {
    console.log('🔧 [useManualOccupancy] Inicializado para:', propertyId);
  }, [propertyId]);

  const { occupiedDates: originalOccupiedDates, loading, error } = useOccupiedDates(propertyId);
  const [manualOccupiedDates, setManualOccupiedDates] = useState([]);
  const [manuallyRemovedDates, setManuallyRemovedDates] = useState([]);
  
  // Mantener el estado de fechas ya guardadas para comparación
  const [persistedManualDates, setPersistedManualDates] = useState([]);
  const [persistedRemovedDates, setPersistedRemovedDates] = useState([]);

  // Estado para guardar cambios pendientes
  const [pendingChanges, setPendingChanges] = useState({
    added: [],
    removed: []
  });

  // Combinar fechas originales con las manuales, excluyendo las removidas manualmente
  const combinedOccupiedDates = [
    ...originalOccupiedDates.filter(date => !manuallyRemovedDates.includes(date)),
    ...manualOccupiedDates
  ].filter((date, index, array) => array.indexOf(date) === index).sort();

  /**
   * Agregar una fecha como ocupada manualmente
   * @param {string} date - Fecha en formato YYYY-MM-DD
   */
  const addOccupiedDate = (date) => {
    if (!date) return;
    
    console.log('➕ useManualOccupancy - addOccupiedDate llamado con:', date);
    
    // Si la fecha ya está ocupada originalmente, no hacer nada
    if (originalOccupiedDates.includes(date)) return;
    
    // Si la fecha estaba removida manualmente, quitarla de la lista de removidas
    if (manuallyRemovedDates.includes(date)) {
      setManuallyRemovedDates(prev => prev.filter(d => d !== date));
      setPendingChanges(prev => ({
        ...prev,
        removed: prev.removed.filter(d => d !== date)
      }));
      return;
    }
    
    // Agregar a fechas manuales si no está ya
    if (!manualOccupiedDates.includes(date)) {
      setManualOccupiedDates(prev => [...prev, date]);
      setPendingChanges(prev => ({
        ...prev,
        added: [...prev.added.filter(d => d !== date), date]
      }));
    }
  };

  /**
   * Quitar una fecha ocupada manualmente
   * @param {string} date - Fecha en formato YYYY-MM-DD
   */
  const removeOccupiedDate = (date) => {
    if (!date) return;
    
    console.log('➖ useManualOccupancy - removeOccupiedDate llamado con:', date);
    console.log('📊 Estado actual antes de remover:');
    console.log('   persistedManualDates:', persistedManualDates);
    console.log('   manualOccupiedDates:', manualOccupiedDates);
    console.log('   pendingChanges:', pendingChanges);
    
    // PROTECCIÓN: No permitir remover reservas reales de clientes
    if (originalOccupiedDates.includes(date)) {
      console.log('🚫 useManualOccupancy - PROTECCIÓN ACTIVADA: No se puede remover reserva de cliente:', date);
      return; // Bloquear completamente la acción
    }
    
    // Si es una fecha manual que ya estaba guardada, marcarla como cambio pendiente
    if (manualOccupiedDates.includes(date)) {
      setManualOccupiedDates(prev => prev.filter(d => d !== date));
      
      // Verificar si la fecha estaba previamente guardada (persistida)
      const wasPersistedBefore = persistedManualDates.includes(date);
      
      if (wasPersistedBefore) {
        // Si era una fecha guardada previamente, marcarla como removed
        setPendingChanges(prev => ({
          ...prev,
          added: prev.added.filter(d => d !== date),
          removed: [...prev.removed.filter(d => d !== date), date]
        }));
        console.log('↪️ Fecha manual previamente guardada marcada como removed');
      } else {
        // Si era una fecha recién agregada, simplemente quitarla de added
        setPendingChanges(prev => ({
          ...prev,
          added: prev.added.filter(d => d !== date)
        }));
        console.log('↪️ Fecha recién agregada removida de pendingChanges.added');
      }
    }
  };

  /**
   * Alternar el estado de ocupación de una fecha
   * @param {string} date - Fecha en formato YYYY-MM-DD
   */
  const toggleOccupiedDate = (date) => {
    console.log('🔄 useManualOccupancy - toggleOccupiedDate llamado con:', date);
    console.log('📊 Estado actual combinedOccupiedDates:', combinedOccupiedDates);
    
    // PROTECCIÓN ADICIONAL: Verificar si es una reserva real antes de hacer toggle
    if (originalOccupiedDates.includes(date)) {
      console.log('🚫 useManualOccupancy - PROTECCIÓN: No se puede modificar reserva de cliente:', date);
      return; // Bloquear completamente la acción
    }
    
    if (combinedOccupiedDates.includes(date)) {
      console.log('➖ Fecha ya ocupada (manual), removiendo:', date);
      removeOccupiedDate(date);
    } else {
      console.log('➕ Fecha libre, agregando:', date);
      addOccupiedDate(date);
    }
    
    // DEBUG: Verificar estado después del toggle
    setTimeout(() => {
      console.log('🔍 Estado después del toggle:');
      console.log('📊 pendingChanges.added:', pendingChanges.added);
      console.log('📊 pendingChanges.removed:', pendingChanges.removed);
      console.log('📊 hasChanges():', (pendingChanges.added.length > 0 || pendingChanges.removed.length > 0));
    }, 100);
  };

  /**
   * Agregar un rango de fechas como ocupadas
   * @param {string} startDate - Fecha inicio en formato YYYY-MM-DD
   * @param {string} endDate - Fecha fin en formato YYYY-MM-DD
   */
  const addOccupiedRange = (startDate, endDate) => {
    if (!startDate || !endDate) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      addOccupiedDate(dateStr);
    }
  };

  /**
   * Quitar un rango de fechas ocupadas
   * @param {string} startDate - Fecha inicio en formato YYYY-MM-DD
   * @param {string} endDate - Fecha fin en formato YYYY-MM-DD
   */
  const removeOccupiedRange = (startDate, endDate) => {
    if (!startDate || !endDate) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      removeOccupiedDate(dateStr);
    }
  };

  /**
   * Guardar cambios con persistencia en localStorage
   */
  const saveChanges = async () => {
    try {
      console.log('💾 [useManualOccupancy] Guardando cambios...');
      console.log('📊 Estado antes de guardar:');
      console.log('   manualOccupiedDates:', manualOccupiedDates);
      console.log('   manuallyRemovedDates:', manuallyRemovedDates);
      console.log('   pendingChanges:', pendingChanges);
      
      // APLICAR los cambios pendientes antes de guardar
      let finalManualOccupied = [...manualOccupiedDates];
      let finalManuallyRemoved = [...manuallyRemovedDates];
      
      // Aplicar fechas agregadas pendientes
      pendingChanges.added.forEach(date => {
        if (!finalManualOccupied.includes(date)) {
          finalManualOccupied.push(date);
        }
      });
      
      // Aplicar fechas removidas pendientes
      pendingChanges.removed.forEach(date => {
        // Si la fecha era manual, quitarla de finalManualOccupied
        if (finalManualOccupied.includes(date)) {
          finalManualOccupied = finalManualOccupied.filter(d => d !== date);
        }
        // Si la fecha era original, agregarla a finalManuallyRemoved
        if (originalOccupiedDates.includes(date) && !finalManuallyRemoved.includes(date)) {
          finalManuallyRemoved.push(date);
        }
      });
      
      console.log('📊 Estado final a guardar:');
      console.log('   finalManualOccupied:', finalManualOccupied);
      console.log('   finalManuallyRemoved:', finalManuallyRemoved);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Guardar en localStorage para persistencia
      const storageKey = `baconfort_manual_occupancy_${propertyId}`;
      const dataToSave = {
        manualOccupiedDates: finalManualOccupied,
        manuallyRemovedDates: finalManuallyRemoved,
        timestamp: Date.now()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      console.log('✅ [useManualOccupancy] Datos guardados en localStorage:', dataToSave);
      
      // VERIFICACIÓN INMEDIATA: Leer de vuelta lo que se guardó
      const verification = localStorage.getItem(storageKey);
      console.log('🔍 [useManualOccupancy] VERIFICACIÓN INMEDIATA - Datos leídos de vuelta:', verification);
      
      if (verification) {
        try {
          const parsed = JSON.parse(verification);
          console.log('✅ [useManualOccupancy] VERIFICACIÓN EXITOSA - Datos parseados:', parsed);
        } catch (e) {
          console.error('❌ [useManualOccupancy] ERROR EN VERIFICACIÓN - No se pudo parsear:', e);
        }
      } else {
        console.error('❌ [useManualOccupancy] ERROR CRÍTICO - No se encontraron datos después de guardar!');
        
        // Mostrar todas las claves para debug
        const allKeys = Object.keys(localStorage);
        console.log('🔑 [useManualOccupancy] Todas las claves en localStorage después de guardar:', allKeys);
        allKeys.forEach(key => {
          if (key.includes('moldes') || key.includes('manual') || key.includes('occupancy')) {
            console.log(`   ${key}:`, localStorage.getItem(key));
          }
        });
      }
      
      // Disparar evento personalizado para notificar cambios inmediatos
      const customEvent = new CustomEvent('manualOccupancyChanged', {
        detail: { propertyId, data: dataToSave }
      });
      window.dispatchEvent(customEvent);
      console.log('📡 [useManualOccupancy] Evento personalizado disparado para sincronización inmediata');
      
      // Actualizar el estado con los cambios aplicados
      setManualOccupiedDates(finalManualOccupied);
      setManuallyRemovedDates(finalManuallyRemoved);
      
      // Actualizar el estado persistido para comparaciones futuras
      setPersistedManualDates(finalManualOccupied);
      setPersistedRemovedDates(finalManuallyRemoved);
      
      // Limpiar cambios pendientes
      setPendingChanges({ added: [], removed: [] });
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ [useManualOccupancy] Error guardando cambios:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Descartar cambios pendientes
   */
  const discardChanges = () => {
    // Primero intentar recargar desde localStorage
    const storageKey = `baconfort_manual_occupancy_${propertyId}`;
    const savedData = localStorage.getItem(storageKey);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setManualOccupiedDates(parsedData.manualOccupiedDates || []);
        setManuallyRemovedDates(parsedData.manuallyRemovedDates || []);
      } catch (error) {
        console.error('Error cargando datos guardados al descartar:', error);
        setManualOccupiedDates([]);
        setManuallyRemovedDates([]);
      }
    } else {
      setManualOccupiedDates([]);
      setManuallyRemovedDates([]);
    }
    
    setPendingChanges({ added: [], removed: [] });
    console.log('🔄 Cambios descartados, datos restaurados');
  };

  /**
   * Verificar si hay cambios pendientes
   */
  const hasChanges = () => {
    const hasAdded = pendingChanges.added.length > 0;
    const hasRemoved = pendingChanges.removed.length > 0;
    const result = hasAdded || hasRemoved;
    
    console.log('🔍 hasChanges() verificando:', {
      hasAdded,
      hasRemoved,
      result,
      pendingChanges
    });
    
    return result;
  };

  // Efecto para cargar datos guardados desde localStorage
  useEffect(() => {
    if (!propertyId) return;
    
    const storageKey = `baconfort_manual_occupancy_${propertyId}`;
    const savedData = localStorage.getItem(storageKey);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log(`📁 Cargando datos guardados para ${propertyId}:`, parsedData);
        
        const loadedManualDates = parsedData.manualOccupiedDates || [];
        const loadedRemovedDates = parsedData.manuallyRemovedDates || [];
        
        setManualOccupiedDates(loadedManualDates);
        setManuallyRemovedDates(loadedRemovedDates);
        
        // Establecer el estado persistido inicial
        setPersistedManualDates(loadedManualDates);
        setPersistedRemovedDates(loadedRemovedDates);
        
        console.log('✅ Datos cargados desde localStorage y estado persistido establecido');
      } catch (error) {
        console.error('❌ Error cargando datos guardados:', error);
        // Si hay error, limpiar datos corruptos
        localStorage.removeItem(storageKey);
      }
    }
  }, [propertyId]);

  // No agregar datos mock automáticamente - solo usar datos reales

  return {
    // Fechas combinadas (originales + manuales - removidas)
    occupiedDates: combinedOccupiedDates,
    
    // Estados de carga y error del hook original
    loading,
    error,
    
    // Fechas separadas por tipo
    originalOccupiedDates,
    manualOccupiedDates,
    manuallyRemovedDates,
    
    // Funciones de manipulación
    addOccupiedDate,
    removeOccupiedDate,
    toggleOccupiedDate,
    addOccupiedRange,
    removeOccupiedRange,
    
    // Gestión de cambios
    pendingChanges,
    hasChanges: hasChanges(),
    saveChanges,
    discardChanges
  };
};

// Debug functions específicas - agregar al final antes del export
window.debugAdminSave = function(propertyId, selectedDates) {
  console.log('=== DEBUG ADMIN SAVE SIMULATION ===');
  const key = `baconfort_manual_occupancy_${propertyId}`;
  console.log('PropertyID:', propertyId);
  console.log('Clave que se usará:', key);
  console.log('Fechas a guardar:', selectedDates);
  
  // Simular el guardado
  localStorage.setItem(key, JSON.stringify(selectedDates));
  console.log('Datos guardados en localStorage');
  
  // Verificar inmediatamente
  const verification = localStorage.getItem(key);
  console.log('Verificación inmediata:', verification);
  
  // Verificar todas las claves después del guardado
  console.log('Todas las claves después del guardado:');
  Object.keys(localStorage).forEach(storageKey => {
    if (storageKey.includes('manual_occupancy')) {
      console.log(`${storageKey}:`, localStorage.getItem(storageKey));
    }
  });
  
  return verification !== null;
};

window.testFullFlow = function() {
  console.log('=== TEST FLUJO COMPLETO MOLDES ===');
  
  // 1. Limpiar datos existentes de Moldes
  const moldesKey = 'baconfort_manual_occupancy_moldes-1680';
  localStorage.removeItem(moldesKey);
  console.log('1. Datos de Moldes limpiados');
  
  // 2. Simular que admin guarda fechas para Moldes
  const testDates = ['2024-01-20', '2024-01-21', '2024-01-22'];
  const success = window.debugAdminSave('moldes-1680', testDates);
  console.log('2. Guardado admin exitoso:', success);
  
  // 3. Simular que usuario busca las fechas
  const userKey = 'baconfort_manual_occupancy_moldes-1680';
  const userFinds = localStorage.getItem(userKey);
  console.log('3. Usuario encuentra la clave:', userFinds !== null);
  console.log('3. Datos que encuentra el usuario:', userFinds);
  
  // 4. Verificar que son los mismos datos
  if (userFinds) {
    try {
      const parsed = JSON.parse(userFinds);
      const matches = JSON.stringify(parsed) === JSON.stringify(testDates);
      console.log('4. Los datos coinciden:', matches);
      console.log('4. Datos originales:', testDates);
      console.log('4. Datos recuperados:', parsed);
    } catch (e) {
      console.log('4. Error al parsear datos del usuario:', e);
    }
  }
  
  console.log('=== FIN TEST FLUJO COMPLETO ===');
};
