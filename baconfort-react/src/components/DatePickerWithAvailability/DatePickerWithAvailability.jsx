import { useState, useEffect } from 'react';
import './DatePickerWithAvailability.css';

/**
 * DatePicker mejorado que muestra fechas ocupadas y no permite seleccionarlas
 */
function DatePickerWithAvailability({ 
  id,
  name,
  value, 
  onChange, 
  min,
  max,
  occupiedDates = [], 
  className = '',
  required = false,
  label 
}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // DEBUG: Log de fechas ocupadas recibidas
  useEffect(() => {
    console.log(`📅 [DatePicker] occupiedDates recibidas:`, occupiedDates);
    console.log(`📅 [DatePicker] occupiedDates.length:`, occupiedDates.length);
    if (occupiedDates.length > 0) {
      console.log(`✅ [DatePicker] SÍ hay fechas ocupadas:`, occupiedDates);
    } else {
      console.log(`❌ [DatePicker] NO hay fechas ocupadas - array vacío`);
    }
  }, [occupiedDates]);

  const today = new Date();
  const minDate = min ? new Date(min) : today;
  const maxDate = max ? new Date(max) : new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

  // Formatear fecha para mostrar
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    
    // Parsear fecha manualmente para evitar problemas de zona horaria
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Mes 0-indexed
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Generar días del mes
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Calcular el día de inicio del calendario (domingo anterior al primer día del mes)
    const startDate = new Date(year, month, 1);
    const dayOfWeek = firstDay.getDay();
    
    // Retroceder los días necesarios hasta el domingo de forma más segura
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    const days = [];
    
    // Generar 42 días (6 semanas completas)
    for (let i = 0; i < 42; i++) {
      // Crear una nueva fecha para cada día usando construcción directa
      const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
      
      // Crear fecha en formato local para evitar problemas de zona horaria
      const currentYear = currentDate.getFullYear();
      const currentMonth_num = String(currentDate.getMonth() + 1).padStart(2, '0');
      const currentDay = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${currentYear}-${currentMonth_num}-${currentDay}`;
      
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected = value === dateStr;
      const isOccupied = occupiedDates.includes(dateStr);
      const isDisabled = currentDate < minDate || currentDate > maxDate || isOccupied;
      
      // DEBUG: Log cuando detectamos fechas julio
      if (dateStr === '2025-07-29' || dateStr === '2025-07-30') {
        console.log(`🔍 [DatePicker] ${dateStr}: isOccupied=${isOccupied}, isDisabled=${isDisabled}, en occupiedDates=${occupiedDates.includes(dateStr)}`);
      }
      
      days.push({
        date: new Date(currentDate),
        dateStr,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isOccupied,
        isDisabled
      });
    }
    
    return days;
  };

  const days = generateCalendarDays();

  const handleDateClick = (dayInfo) => {
    if (dayInfo.isDisabled) return;
    
    // Log removido para producción
    
    onChange({
      target: {
        name,
        value: dayInfo.dateStr
      }
    });
    setIsCalendarOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Cerrar calendario al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.date-picker-container')) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isCalendarOpen]);

  return (
    <div className="date-picker-container">
      {label && <label htmlFor={id}>{label}</label>}
      
      <div className="date-input-wrapper">
        <input
          type="text"
          id={id}
          name={name}
          value={formatDisplayDate(value)}
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          onFocus={() => setIsCalendarOpen(true)}
          readOnly
          className={`date-input ${className}`}
          required={required}
          placeholder="Seleccionar fecha"
          autoComplete="off"
        />
        <i className="fas fa-calendar-alt date-icon"></i>
      </div>

      {isCalendarOpen && (
        <div className="calendar-dropdown">
          <div className="calendar-header">
            <button type="button" onClick={handlePrevMonth} className="nav-btn">
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="month-year">
              {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
            <button type="button" onClick={handleNextMonth} className="nav-btn">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          <div className="calendar-grid">
            <div className="weekdays">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>

            <div className="days">
              {days.map((dayInfo, index) => (
                <div
                  key={index}
                  className={`
                    calendar-day
                    ${!dayInfo.isCurrentMonth ? 'other-month' : ''}
                    ${dayInfo.isToday ? 'today' : ''}
                    ${dayInfo.isSelected ? 'selected' : ''}
                    ${dayInfo.isOccupied ? 'occupied' : ''}
                    ${dayInfo.isDisabled ? 'disabled' : ''}
                  `}
                  onClick={() => handleDateClick(dayInfo)}
                  title={
                    dayInfo.isOccupied ? 'Fecha ocupada' : 
                    dayInfo.isDisabled ? 'Fecha no disponible' : 
                    'Seleccionar fecha'
                  }
                >
                  {dayInfo.day}
                  {dayInfo.isOccupied && <div className="occupied-indicator">✖</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-color available"></div>
              <span>Disponible</span>
            </div>
            <div className="legend-item">
              <div className="legend-color occupied"></div>
              <span>Ocupado</span>
            </div>
            <div className="legend-item">
              <div className="legend-color selected"></div>
              <span>Seleccionado</span>
            </div>
          </div>
        </div>
      )}

      {/* Fallback input nativo para dispositivos móviles */}
      <input
        type="date"
        id={`${id}-fallback`}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        required={required}
        className="date-fallback"
        style={{ display: 'none' }}
        autoComplete="off"
      />
    </div>
  );
}

export default DatePickerWithAvailability;
