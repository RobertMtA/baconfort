import { useState, useEffect } from 'react';
import { useManualOccupancy } from '../../hooks/useManualOccupancy';
import './AdminCalendar.css';

/**
 * Calendario de administración para ver y gestionar ocupación de propiedades
 */
function AdminCalendar({ propertyId, propertyTitle, isVisible = true }) {
  // Añadir manejo de errores y valores por defecto
  const hookResult = useManualOccupancy(propertyId);
  
  // Debug del hook result
  useEffect(() => {
    console.log(`🔧 [AdminCalendar] Hook result para ${propertyTitle}:`, {
      hookResult: hookResult ? 'válido' : 'null/undefined',
      keys: hookResult ? Object.keys(hookResult) : 'N/A',
      occupiedDates: hookResult?.occupiedDates?.length || 0,
      manualOccupiedDates: hookResult?.manualOccupiedDates?.length || 0,
      loading: hookResult?.loading,
    });
  }, [hookResult, propertyTitle]);
  
  const { 
    occupiedDates = [], 
    loading = false, 
    toggleOccupiedDate = () => {},
    addOccupiedRange = () => {},
    removeOccupiedRange = () => {},
    pendingChanges = { added: [], removed: [] },
    hasChanges = false,
    saveChanges = () => {},
    discardChanges = () => {},
    originalOccupiedDates = [],
    manualOccupiedDates = [],
    manuallyRemovedDates = []
  } = hookResult || {};
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectionMode, setSelectionMode] = useState('single'); // 'single' | 'range'
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });
  const [isSelecting, setIsSelecting] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date();

  // Generar días del mes con información de ocupación
  const generateCalendarDays = () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Calcular el día de inicio del calendario (domingo anterior al primer día del mes)
      const startDate = new Date(year, month, 1);
      const dayOfWeek = firstDay.getDay();
      startDate.setDate(1 - dayOfWeek); // Retroceder los días necesarios hasta el domingo
      
      const days = [];
      
      // Generar 42 días (6 semanas completas)
      for (let i = 0; i < 42; i++) {
        // Crear una nueva fecha para cada día
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        // Crear fecha en formato local para evitar problemas de zona horaria
        const currentYear = currentDate.getFullYear();
        const currentMonth_num = String(currentDate.getMonth() + 1).padStart(2, '0');
        const currentDay = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${currentYear}-${currentMonth_num}-${currentDay}`;
        
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = currentDate.toDateString() === today.toDateString();
        const isOccupied = Array.isArray(occupiedDates) && occupiedDates.includes(dateStr);
        
        // Mejorar lógica de fechas pasadas - comparar solo fechas, no horas
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const isPast = currentDateOnly < todayDateOnly; // Solo considerar fechas anteriores al día de hoy
        
        // Determinar el tipo de ocupación
        let occupationType = 'available';
        if (isOccupied) {
          if (Array.isArray(originalOccupiedDates) && originalOccupiedDates.includes(dateStr) && 
              (!Array.isArray(manuallyRemovedDates) || !manuallyRemovedDates.includes(dateStr))) {
            occupationType = 'reserved'; // Reserva real
          } else if (Array.isArray(manualOccupiedDates) && manualOccupiedDates.includes(dateStr)) {
            occupationType = 'manual'; // Ocupación manual
          } else if (Array.isArray(originalOccupiedDates) && originalOccupiedDates.includes(dateStr) && 
                     Array.isArray(manuallyRemovedDates) && manuallyRemovedDates.includes(dateStr)) {
            occupationType = 'available'; // Fue removida manualmente
          }
        }
        
        // Debug para fechas manuales
        if (Array.isArray(manualOccupiedDates) && manualOccupiedDates.includes(dateStr)) {
          console.log(`🟡 [${propertyTitle}] Fecha manual detectada: ${dateStr} - occupationType: ${occupationType}`);
        }
        
        // Verificar si está en el rango de selección actual
        const isInSelectedRange = selectedRange.start && selectedRange.end && 
          currentDate >= new Date(selectedRange.start) && currentDate <= new Date(selectedRange.end);
        
        days.push({
          date: new Date(currentDate),
          dateStr,
          day: currentDate.getDate(),
          isCurrentMonth,
          isToday,
          isOccupied,
          occupationType,
          isPast,
          isInSelectedRange
        });
      }
      
      return days;
    } catch (error) {
      console.error('Error generando días del calendario:', error);
      return [];
    }
  };

  const days = generateCalendarDays();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Contar días ocupados por RESERVAS REALES (no manuales) en el mes actual
  const realReservedDaysThisMonth = days.filter(day => 
    day.isCurrentMonth && day.occupationType === 'reserved'
  ).length;

  const totalDaysThisMonth = days.filter(day => day.isCurrentMonth).length;
  const realOccupancyRate = totalDaysThisMonth > 0 ? 
    Math.round((realReservedDaysThisMonth / totalDaysThisMonth) * 100) : 0;

  // Manejar click en una fecha
  const handleDateClick = (dayInfo) => {
    // ADMIN PUEDE BLOQUEAR CUALQUIER FECHA - Removida restricción de fechas pasadas
    // Para propósitos administrativos, permitir bloquear cualquier fecha
    
    console.log('🏢 AdminCalendar - Fecha clickeada:', {
      dayNumber: dayInfo.day,
      dateStr: dayInfo.dateStr,
      fullDate: dayInfo.date,
      selectionMode,
      isPast: dayInfo.isPast,
      isOccupied: dayInfo.isOccupied,
      occupationType: dayInfo.occupationType
    });

    // PROTECCIÓN: No permitir eliminar reservas de clientes reales
    if (dayInfo.occupationType === 'reserved') {
      console.log('🚫 AdminCalendar - No se puede modificar reserva de cliente:', dayInfo.dateStr);
      alert('⚠️ Esta fecha tiene una reserva confirmada por un cliente.\nNo se puede modificar desde el panel de administración.');
      return;
    }

    if (selectionMode === 'single') {
      console.log('🏢 AdminCalendar - Llamando toggleOccupiedDate con:', dayInfo.dateStr);
      toggleOccupiedDate(dayInfo.dateStr);
    } else if (selectionMode === 'range') {
      handleRangeSelection(dayInfo);
    }
  };

  // Manejar selección de rango
  const handleRangeSelection = (dayInfo) => {
    // No permitir seleccionar fechas reservadas por clientes en rangos
    if (dayInfo.occupationType === 'reserved') {
      console.log('🚫 AdminCalendar - No se puede incluir reserva de cliente en rango:', dayInfo.dateStr);
      alert('⚠️ No se pueden incluir fechas con reservas de clientes en la selección de rango.');
      return;
    }

    if (!selectedRange.start) {
      // Primer click: establecer fecha de inicio
      setSelectedRange({ start: dayInfo.dateStr, end: null });
      setIsSelecting(true);
    } else if (!selectedRange.end) {
      // Segundo click: establecer fecha de fin
      const start = new Date(selectedRange.start);
      const end = new Date(dayInfo.dateStr);
      
      if (end >= start) {
        // Verificar que no haya reservas de clientes en el rango
        const rangeHasReservedDays = days.some(day => {
          const dayDate = new Date(day.dateStr);
          return dayDate >= start && dayDate <= end && day.occupationType === 'reserved';
        });

        if (rangeHasReservedDays) {
          alert('⚠️ El rango seleccionado contiene fechas con reservas de clientes.\nPor favor, selecciona un rango diferente.');
          setSelectedRange({ start: null, end: null });
          setIsSelecting(false);
          return;
        }

        setSelectedRange({ start: selectedRange.start, end: dayInfo.dateStr });
        setIsSelecting(false);
      } else {
        // Si la fecha fin es anterior a la de inicio, reiniciar
        setSelectedRange({ start: dayInfo.dateStr, end: null });
      }
    } else {
      // Ya hay un rango seleccionado, empezar uno nuevo
      setSelectedRange({ start: dayInfo.dateStr, end: null });
      setIsSelecting(true);
    }
  };

  // Aplicar acción al rango seleccionado
  const applyRangeAction = (action) => {
    if (!selectedRange.start || !selectedRange.end) return;
    
    if (action === 'occupy') {
      addOccupiedRange(selectedRange.start, selectedRange.end);
    } else if (action === 'free') {
      removeOccupiedRange(selectedRange.start, selectedRange.end);
    }
    
    // Limpiar selección
    setSelectedRange({ start: null, end: null });
  };

  // Cancelar selección de rango
  const cancelRangeSelection = () => {
    setSelectedRange({ start: null, end: null });
    setIsSelecting(false);
    setSelectionMode('single');
  };

  // Guardar cambios
  const handleSaveChanges = async () => {
    setSaving(true);
    const result = await saveChanges();
    setSaving(false);
    
    if (result.success) {
      // Mostrar mensaje de éxito
      
      // Mostrar alerta temporal de éxito
      const successMsg = document.createElement('div');
      successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      `;
      successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Cambios guardados exitosamente';
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        document.body.removeChild(successMsg);
      }, 3000);
      
    } else {
      // Mostrar mensaje de error
      console.error('❌ Error guardando cambios:', result.error);
      alert('Error al guardar los cambios. Por favor, intenta nuevamente.');
    }
  };

  // Debug logs mejorado para verificar datos del hook
  // Log simple para monitoreo
  useEffect(() => {
    if (!loading && (manualOccupiedDates?.length > 0 || manuallyRemovedDates?.length > 0)) {
      console.log(`📅 [${propertyTitle}] Bloqueos manuales: ${manualOccupiedDates?.length || 0} activos`);
    }
  }, [propertyTitle, loading, manualOccupiedDates, manuallyRemovedDates]);

  if (!isVisible) return null;

  if (loading) {
    return (
      <div className="admin-calendar">
        <div className="calendar-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-calendar">
      <div className="calendar-header">
        <div className="property-info">
          <h4>
            <i className="fas fa-calendar-alt"></i>
            {propertyTitle}
          </h4>
          <div className="occupancy-stats">
            <span className="occupancy-rate" style={{
              color: realOccupancyRate > 70 ? '#d32f2f' : realOccupancyRate > 40 ? '#f57c00' : '#388e3c'
            }}>
              {realOccupancyRate}% ocupado
            </span>
            <span className="month-stats">
              {realReservedDaysThisMonth}/{totalDaysThisMonth} días
            </span>
            {hasChanges && (
              <span className="changes-indicator">
                <i className="fas fa-exclamation-circle"></i>
                {pendingChanges.added.length + pendingChanges.removed.length} cambios
              </span>
            )}
          </div>
        </div>
        
        <div className="calendar-controls">
          {loading && (
            <div className="loading-indicator">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
          )}
          <button 
            type="button"
            className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Ocultar calendario' : 'Mostrar calendario'}
          >
            <span className="expand-btn-text">
              {isExpanded ? 'Ocultar' : 'Ver calendario'}
            </span>
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="calendar-body">
          {/* Descripción de uso */}
          <div className="calendar-description">
            <div className="description-content">
              <i className="fas fa-info-circle"></i>
              <span>
                <strong>Gestión de Disponibilidad:</strong> Bloquea días que no quieres alquilar (mantenimiento, uso personal, etc.) 
                o libera días previamente bloqueados. Los días con reservas reales aparecen en <span className="reserved-color">rojo</span>.
              </span>
            </div>
            <div className="quick-actions">
              <span className="quick-action-title">
                <i className="fas fa-lightning-bolt"></i>
                Acciones rápidas:
              </span>
              <span className="quick-action-item">• Click en día: Bloquear/Liberar individual</span>
              <span className="quick-action-item">• Rango: Seleccionar múltiples días</span>
            </div>
          </div>

          {/* Controles de gestión */}
          <div className="management-controls">
            <div className="mode-selector">
              <button 
                type="button"
                className={`mode-btn ${selectionMode === 'single' ? 'active' : ''}`}
                onClick={() => {
                  setSelectionMode('single');
                  cancelRangeSelection();
                }}
              >
                <i className="fas fa-mouse-pointer"></i>
                Click individual
              </button>
              <button 
                type="button"
                className={`mode-btn ${selectionMode === 'range' ? 'active' : ''}`}
                onClick={() => setSelectionMode('range')}
              >
                <i className="fas fa-arrows-alt-h"></i>
                Seleccionar rango
              </button>
            </div>

            {selectionMode === 'range' && selectedRange.start && selectedRange.end && (
              <div className="range-actions">
                <span className="selected-range">
                  {new Date(selectedRange.start).toLocaleDateString('es-ES')} - {new Date(selectedRange.end).toLocaleDateString('es-ES')}
                </span>
                <button 
                  type="button"
                  className="action-btn occupy"
                  onClick={() => applyRangeAction('occupy')}
                >
                  <i className="fas fa-ban"></i>
                  Bloquear días
                </button>
                <button 
                  type="button"
                  className="action-btn free"
                  onClick={() => applyRangeAction('free')}
                >
                  <i className="fas fa-check-circle"></i>
                  Liberar días
                </button>
                <button 
                  type="button"
                  className="action-btn cancel"
                  onClick={cancelRangeSelection}
                >
                  <i className="fas fa-times"></i>
                  Cancelar
                </button>
              </div>
            )}

            {hasChanges && (
              <div className="changes-actions">
                <button 
                  type="button"
                  className="save-btn"
                  onClick={handleSaveChanges}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      Guardar ({pendingChanges.added.length + pendingChanges.removed.length})
                    </>
                  )}
                </button>
                <button 
                  type="button"
                  className="discard-btn"
                  onClick={discardChanges}
                  disabled={saving}
                >
                  <i className="fas fa-undo"></i>
                  Descartar
                </button>
              </div>
            )}
          </div>

          <div className="month-navigation">
            <button type="button" onClick={handlePrevMonth} className="nav-btn">
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="month-year">
              {currentMonth.toLocaleDateString('es-ES', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
            <button type="button" onClick={handleNextMonth} className="nav-btn">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          <div className="calendar-grid">
            <div className="weekdays" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '2px',
              marginBottom: '8px'
            }}>
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>

            <div className="days-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '2px'
            }}>
              {days.map((dayInfo, index) => (
                <div
                  key={index}
                  className={`
                    admin-day
                    ${!dayInfo.isCurrentMonth ? 'other-month' : ''}
                    ${dayInfo.isToday ? 'today' : ''}
                    ${dayInfo.occupationType}
                    ${dayInfo.isPast ? 'past' : ''}
                    ${dayInfo.occupationType !== 'reserved' ? 'clickable' : ''}
                    ${dayInfo.isInSelectedRange ? 'in-range' : ''}
                    ${selectedRange.start === dayInfo.dateStr ? 'range-start' : ''}
                    ${selectedRange.end === dayInfo.dateStr ? 'range-end' : ''}
                  `}                  title={
                    dayInfo.occupationType === 'reserved' ?
                      `${dayInfo.dateStr} - 🔒 RESERVADO POR CLIENTE (No se puede modificar)` :
                    dayInfo.occupationType === 'manual' ?
                      `${dayInfo.dateStr} - 🚫 Bloqueado por administración (click para liberar)` :
                    dayInfo.isPast ?
                      `${dayInfo.dateStr} - Fecha pasada (click para bloquear)` :
                      `${dayInfo.dateStr} - ✅ Disponible (click para bloquear)`
                  }
                  onClick={() => handleDateClick(dayInfo)}
                >
                  <span className="day-number">{dayInfo.day}</span>
                  {dayInfo.isOccupied && (
                    <div className="occupied-indicator">
                      <i className={`fas ${
                        dayInfo.occupationType === 'reserved' ? 'fa-user' : 'fa-ban'
                      }`}></i>
                    </div>
                  )}
                  {dayInfo.isInSelectedRange && (
                    <div className="range-overlay"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-dot available"></div>
              <span>✅ Disponible (click para bloquear)</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot reserved"></div>
              <span>🔒 Reservado por cliente (PROTEGIDO)</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot manual"></div>
              <span>🚫 Bloqueado por admin (click para liberar)</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot today"></div>
              <span>📅 Día actual</span>
            </div>
          </div>

          {/* Resumen de próximas reservas */}
          {occupiedDates.length > 0 && (
            <div className="upcoming-reservations">
              <h5>
                <i className="fas fa-clock"></i>
                Próximas ocupaciones
              </h5>
              <div className="reservation-list">
                {occupiedDates
                  .filter(date => new Date(date) >= today)
                  .slice(0, 3)
                  .map((date, index) => (
                    <div key={index} className="reservation-item">
                      <i className="fas fa-calendar-day"></i>
                      <span>{new Date(date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}</span>
                      <span className="reservation-type">
                        {originalOccupiedDates.includes(date) ? 
                          (manuallyRemovedDates.includes(date) ? 'Removida' : 'Reserva') : 
                          'Manual'
                        }
                      </span>
                    </div>
                  ))
                }
                {occupiedDates.filter(date => new Date(date) >= today).length > 3 && (
                  <div className="more-reservations">
                    +{occupiedDates.filter(date => new Date(date) >= today).length - 3} más...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminCalendar;
