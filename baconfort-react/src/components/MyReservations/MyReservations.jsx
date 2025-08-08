import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContextAPI';
import { API_URL } from '../../services/api';
import './MyReservations.css';

function MyReservations() {
  const { user, isAuthenticated } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchReservations();
    }
  }, [isAuthenticated]);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('baconfort-token');
      
      if (!token) {
        setError('Debes iniciar sesión para ver tus reservas');
        return;
      }
      
      const response = await fetch(`${API_URL}/reservations/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ MY RESERVATIONS: Respuesta completa:', responseData);
        
        // Extraer el array de reservas de la respuesta
        const reservationsArray = responseData.data || responseData;
        console.log('✅ MY RESERVATIONS: Reservas cargadas:', reservationsArray.length);
        
        setReservations(reservationsArray);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error cargando reservas');
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      return;
    }

    try {
      const token = localStorage.getItem('baconfort-token');
      
      if (!token) {
        alert('Debes iniciar sesión para cancelar reservas');
        return;
      }
      
      const response = await fetch(`${API_URL}/reservations/${reservationId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Actualizar la lista de reservas
        fetchReservations();
        alert('Reserva cancelada exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error cancelando reserva');
      }
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      alert('Error de conexión');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Pendiente', class: 'status-pending' },
      confirmed: { text: 'Confirmada', class: 'status-confirmed' },
      cancelled: { text: 'Cancelada', class: 'status-cancelled' },
      completed: { text: 'Completada', class: 'status-completed' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'status-unknown' };
    
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!isAuthenticated()) {
    return (
      <div className="my-reservations-container">
        <div className="auth-required">
          <i className="fas fa-user-lock"></i>
          <h3>Inicia sesión para ver tus reservas</h3>
          <p>Necesitas estar autenticado para acceder a tu historial de reservas.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-reservations-container">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando tus reservas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-reservations-container">
        <div className="error">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error cargando reservas</h3>
          <p>{error}</p>
          <button onClick={fetchReservations} className="retry-btn">
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-reservations-container">
      <div className="page-header">
        <h1>
          <i className="fas fa-calendar-check"></i>
          Mis Reservas
        </h1>
        <p>Gestiona y revisa todas tus reservas en BACONFORT</p>
      </div>

      {reservations.length === 0 ? (
        <div className="no-reservations">
          <i className="fas fa-calendar-times"></i>
          <h3>No tienes reservas aún</h3>
          <p>Cuando hagas tu primera reserva, aparecerá aquí.</p>
          <a href="/" className="browse-btn">
            <i className="fas fa-search"></i>
            Explorar Propiedades
          </a>
        </div>
      ) : (
        <div className="reservations-grid">
          {reservations.map((reservation) => (
            <div key={reservation._id} className="reservation-card">
              <div className="reservation-header">
                <h3>{reservation.propertyName}</h3>
                {getStatusBadge(reservation.status)}
              </div>
              
              <div className="reservation-dates">
                <div className="date-info">
                  <i className="fas fa-calendar-alt"></i>
                  <div>
                    <strong>Check-in:</strong> {formatDate(reservation.checkIn)}
                    <br />
                    <strong>Check-out:</strong> {formatDate(reservation.checkOut)}
                  </div>
                </div>
                <div className="nights-info">
                  <i className="fas fa-moon"></i>
                  <span>{calculateNights(reservation.checkIn, reservation.checkOut)} noches</span>
                </div>
              </div>

              <div className="reservation-details">
                <div className="detail-item">
                  <i className="fas fa-users"></i>
                  <span>{reservation.guests} huéspedes</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-user"></i>
                  <span>{reservation.fullName}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-envelope"></i>
                  <span>{reservation.email}</span>
                </div>
                {reservation.phone && (
                  <div className="detail-item">
                    <i className="fas fa-phone"></i>
                    <span>{reservation.phone}</span>
                  </div>
                )}
              </div>

              {reservation.message && (
                <div className="reservation-message">
                  <h4><i className="fas fa-comment"></i> Mensaje:</h4>
                  <p>{reservation.message}</p>
                </div>
              )}

              <div className="reservation-footer">
                <div className="reservation-date">
                  <i className="fas fa-clock"></i>
                  <span>Creada: {formatDate(reservation.createdAt)}</span>
                </div>
                
                {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                  <button 
                    onClick={() => cancelReservation(reservation._id)}
                    className="cancel-btn"
                  >
                    <i className="fas fa-times"></i>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyReservations;
