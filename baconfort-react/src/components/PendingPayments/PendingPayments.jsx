import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContextAPI';
import PaymentMethodSelector from '../Payment/PaymentMethodSelector';
import { API_URL } from '../../services/api';
import './PendingPayments.css';

function PendingPayments() {
  const { user, isAuthenticated } = useAuth();
  const [pendingReservations, setPendingReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      loadPendingPayments();
    }
  }, [isAuthenticated]);

  const loadPendingPayments = async () => {
    try {
      // Usar exactamente la misma lógica que MyReservations
      const token = localStorage.getItem('baconfort-token');
      console.log('🔍 PENDING PAYMENTS: Token encontrado:', token ? 'SÍ' : 'NO');
      console.log('🔍 PENDING PAYMENTS: Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (!token) {
        console.log('❌ PENDING PAYMENTS: No hay token, terminando carga');
        setLoading(false);
        return;
      }
      
      console.log('📡 PENDING PAYMENTS: Haciendo fetch a:', `${API_URL}/reservations`);
      const response = await fetch(`${API_URL}/reservations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 PENDING PAYMENTS: Response status:', response.status);
      console.log('📡 PENDING PAYMENTS: Response ok:', response.ok);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ PENDING PAYMENTS: Respuesta completa:', responseData);
        
        // Extraer reservas igual que en MyReservations
        const reservationsArray = responseData.data || responseData;
        console.log('✅ PENDING PAYMENTS: Reservas extraídas:', reservationsArray);
        
        if (Array.isArray(reservationsArray)) {
          // Filtrar las que necesitan pago
          const pendingPayments = reservationsArray.filter(reservation => 
            reservation.status === 'pending' || 
            reservation.status === 'payment_pending' || 
            (reservation.status === 'confirmed' && (!reservation.paymentInfo || !reservation.paymentInfo.provider || !reservation.paymentInfo.amount))
          );
          
          console.log('🔍 PENDING PAYMENTS: Reservas pendientes de pago encontradas:', pendingPayments.length);
          pendingPayments.forEach((reservation, index) => {
            console.log(`📋 Pago pendiente ${index + 1}:`, {
              id: reservation._id,
              propertyName: reservation.propertyName,
              status: reservation.status,
              hasPaymentInfo: !!(reservation.paymentInfo && reservation.paymentInfo.provider && reservation.paymentInfo.amount)
            });
          });
          
          setPendingReservations(pendingPayments);
        } else {
          console.log('⚠️ PENDING PAYMENTS: reservationsArray no es un array');
          setPendingReservations([]);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ PENDING PAYMENTS: Error response:', errorData);
      }
    } catch (error) {
      console.error('💥 PENDING PAYMENTS: Error en catch:', error);
    } finally {
      console.log('🏁 PENDING PAYMENTS: Terminando carga, seteando loading = false');
      setLoading(false);
    }
  };

  const handlePayNow = (reservation) => {
    setSelectedReservation(reservation);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      const token = localStorage.getItem('baconfort-token');
      const response = await fetch(`${API_URL}/reservations/${selectedReservation._id}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentData,
          status: 'confirmed'
        })
      });

      if (response.ok) {
        alert('¡Pago exitoso! Tu reserva ha sido confirmada.');
        setShowPayment(false);
        setSelectedReservation(null);
        loadPendingPayments(); // Recargar la lista
      }
    } catch (error) {
      console.error('Error procesando pago:', error);
      alert('Error procesando el pago. Intenta nuevamente.');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Error en el pago:', error);
    alert('Error en el proceso de pago. Intenta nuevamente.');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setSelectedReservation(null);
  };

  const calculateTotal = (reservation) => {
    const nights = Math.ceil((new Date(reservation.checkOut) - new Date(reservation.checkIn)) / (1000 * 60 * 60 * 24));
    const pricePerNight = 85; // Obtener del backend o propiedad
    return nights * pricePerNight;
  };

  const calculateNights = (checkIn, checkOut) => {
    return Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  };

  if (!isAuthenticated()) {
    return (
      <div className="pending-payments-container">
        <div className="auth-required">
          <i className="fas fa-lock"></i>
          <h3>Acceso Requerido</h3>
          <p>Debes iniciar sesión para ver tus reservas pendientes de pago.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pending-payments-container">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando reservas pendientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-payments-container">
      <div className="header">
        <h2>Reservas Pendientes de Pago</h2>
        <p>Completa el pago de tus reservas aprobadas</p>
      </div>

      {pendingReservations.length === 0 ? (
        <div className="no-pending">
          <i className="fas fa-check-circle"></i>
          <h3>¡Todo al día!</h3>
          <p>No tienes reservas pendientes de pago en este momento.</p>
        </div>
      ) : (
        <div className="reservations-list">
          {pendingReservations.map((reservation) => (
            <div key={reservation._id} className="reservation-card">
              <div className="reservation-header">
                <h3>{reservation.propertyName}</h3>
                <div className="status-badge approved">
                  <i className="fas fa-check"></i>
                  Aprobada - Pago Pendiente
                </div>
              </div>

              <div className="reservation-details">
                <div className="dates">
                  <div className="date-item">
                    <label>Check-in:</label>
                    <span>{new Date(reservation.checkIn).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="date-item">
                    <label>Check-out:</label>
                    <span>{new Date(reservation.checkOut).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>

                <div className="reservation-info">
                  <div className="info-item">
                    <label>Huéspedes:</label>
                    <span>{reservation.guests}</span>
                  </div>
                  <div className="info-item">
                    <label>Noches:</label>
                    <span>{calculateNights(reservation.checkIn, reservation.checkOut)}</span>
                  </div>
                  <div className="info-item">
                    <label>Total a pagar:</label>
                    <span className="total-amount">USD ${calculateTotal(reservation)}</span>
                  </div>
                </div>

                {reservation.adminNotes && (
                  <div className="admin-notes">
                    <label>Notas del administrador:</label>
                    <p>{reservation.adminNotes}</p>
                  </div>
                )}

                <div className="approval-info">
                  <small>
                    <i className="fas fa-calendar-check"></i>
                    Aprobada el {new Date(reservation.approvedAt).toLocaleDateString('es-ES')}
                    {reservation.approvedBy && ` por ${reservation.approvedBy}`}
                  </small>
                </div>
              </div>

              <div className="reservation-actions">
                <button 
                  className="pay-now-btn"
                  onClick={() => handlePayNow(reservation)}
                >
                  <i className="fas fa-credit-card"></i>
                  Pagar Ahora
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sistema de Pagos */}
      {showPayment && selectedReservation && (
        <div className="payment-modal">
          <div className="payment-modal-content">
            <div className="payment-header">
              <h3>Completar Pago</h3>
              <button 
                className="close-btn" 
                onClick={handlePaymentCancel}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="payment-summary">
              <h4>{selectedReservation.propertyName}</h4>
              <p>
                {new Date(selectedReservation.checkIn).toLocaleDateString('es-ES')} - 
                {new Date(selectedReservation.checkOut).toLocaleDateString('es-ES')}
              </p>
              <p className="total">Total: USD ${calculateTotal(selectedReservation)}</p>
            </div>

            <PaymentMethodSelector
              reservationData={{
                propertyName: selectedReservation.propertyName,
                checkIn: selectedReservation.checkIn,
                checkOut: selectedReservation.checkOut,
                guests: selectedReservation.guests,
                nights: calculateNights(selectedReservation.checkIn, selectedReservation.checkOut),
                amount: calculateTotal(selectedReservation),
                currency: 'USD',
                reservationId: selectedReservation._id,
                customerEmail: selectedReservation.email,
                customerName: selectedReservation.fullName
              }}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingPayments;
