import { useState, useEffect, useRef } from 'react';
import { reservationsAPI } from '../../services/api';
import './OccupancySummary.css';

/**
 * Resumen rápido de ocupación de todas las propiedades
 */
function OccupancySummary({ properties }) {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLoadingRef = useRef(false); // Prevenir cargas múltiples

  useEffect(() => {
    const loadOccupancyData = async () => {
      // Evitar cargas múltiples simultáneas
      if (isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;
      setLoading(true);
      
      const summaries = await Promise.all(
        properties.map(async (property) => {
          try {
            // Solo log cuando sea necesario
            console.log(`📊 Cargando ocupación real para ${property.id}`);
            
            let response;
            try {
              // Intentar obtener datos del backend real
              response = await reservationsAPI.getByProperty(property.id);
            } catch (backendError) {
              // Si falla el backend, devolver datos vacíos (sin mock)
              response = { data: [] };
            }
            
            const reservations = response.data || response || [];
            
            // Log solo si hay reservas
            if (reservations.length > 0) {
              console.log(`📊 Reservas reales para ${property.id}: Array(${reservations.length})`);
            }
            
            
            // Calcular fechas ocupadas solo de reservas reales
            const occupiedDates = [];
            if (Array.isArray(reservations)) {
              reservations.forEach(reservation => {
                if (reservation.status === 'confirmed' || reservation.status === 'pending') {
                  const checkIn = new Date(reservation.checkIn);
                  const checkOut = new Date(reservation.checkOut);
                  
                  for (let date = new Date(checkIn); date <= checkOut; date.setDate(date.getDate() + 1)) {
                    occupiedDates.push(new Date(date).toISOString().split('T')[0]);
                  }
                }
              });
            }
            
            // Calcular estadísticas del mes actual
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            
            const occupiedThisMonth = occupiedDates.filter(date => {
              const d = new Date(date);
              return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            }).length;
            
            const occupancyRate = Math.round((occupiedThisMonth / daysInMonth) * 100);
            
            return {
              propertyId: property.id,
              propertyTitle: property.title,
              totalReservations: Array.isArray(reservations) ? reservations.length : 0,
              occupiedDates: occupiedDates.length,
              occupiedThisMonth,
              daysInMonth,
              occupancyRate,
              isBlocked: property.isBlocked || false
            };
          } catch (error) {
            console.error(`❌ Error cargando ocupación para ${property.id}:`, error);
            return {
              propertyId: property.id,
              propertyTitle: property.title,
              totalReservations: 0,
              occupiedDates: 0,
              occupiedThisMonth: 0,
              daysInMonth: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
              occupancyRate: 0,
              isBlocked: property.isBlocked || false
            };
          }
        })
      );
      
      setSummaryData(summaries);
      setLoading(false);
      isLoadingRef.current = false; // Reset loading flag
    };

    if (properties && properties.length > 0) {
      loadOccupancyData();
    } else {
      isLoadingRef.current = false; // Reset if no properties
    }
  }, [properties]);

  if (loading) {
    return (
      <div className="occupancy-summary loading">
        <i className="fas fa-spinner fa-spin"></i>
        Cargando estadísticas de ocupación...
      </div>
    );
  }

  const totalProperties = summaryData.length;
  const averageOccupancy = totalProperties > 0 ? 
    Math.round(summaryData.reduce((sum, prop) => sum + prop.occupancyRate, 0) / totalProperties) : 0;
  const totalReservations = summaryData.reduce((sum, prop) => sum + prop.totalReservations, 0);
  const blockedProperties = summaryData.filter(prop => prop.isBlocked).length;

  return (
    <div className="occupancy-summary">
      <div className="summary-header">
        <h4>
          <i className="fas fa-chart-pie"></i>
          Resumen de Ocupación - {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </h4>
      </div>

      <div className="summary-stats">
        <div className="stat-card-summary">
          <div className="stat-icon-summary occupancy">
            <i className="fas fa-percentage"></i>
          </div>
          <div className="stat-content-summary">
            <h3>{averageOccupancy}%</h3>
            <p>Ocupación Promedio</p>
          </div>
        </div>

        <div className="stat-card-summary">
          <div className="stat-icon-summary reservations">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-content-summary">
            <h3>{totalReservations}</h3>
            <p>Reservas Activas</p>
          </div>
        </div>

        <div className="stat-card-summary">
          <div className="stat-icon-summary available">
            <i className="fas fa-home"></i>
          </div>
          <div className="stat-content-summary">
            <h3>{totalProperties - blockedProperties}</h3>
            <p>Disponibles</p>
          </div>
        </div>

        <div className="stat-card-summary">
          <div className="stat-icon-summary blocked">
            <i className="fas fa-lock"></i>
          </div>
          <div className="stat-content-summary">
            <h3>{blockedProperties}</h3>
            <p>Bloqueadas</p>
          </div>
        </div>
      </div>

      <div className="properties-summary">
        <h5>
          <i className="fas fa-list"></i>
          Estado por Propiedad
        </h5>
        <div className="properties-list">
          {summaryData.map(property => (
            <div key={property.propertyId} className={`property-summary-item ${property.isBlocked ? 'blocked' : ''}`}>
              <div className="property-name">
                <i className={`fas fa-${property.isBlocked ? 'lock' : 'home'}`}></i>
                {property.propertyTitle}
              </div>
              <div className="property-stats">
                <span className={`occupancy-badge ${getOccupancyLevel(property.occupancyRate)}`}>
                  {property.occupancyRate}%
                </span>
                <span className="days-info">
                  {property.occupiedThisMonth}/{property.daysInMonth} días
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Función auxiliar para determinar el nivel de ocupación
function getOccupancyLevel(rate) {
  if (rate >= 70) return 'high';
  if (rate >= 40) return 'medium';
  return 'low';
}

export default OccupancySummary;
