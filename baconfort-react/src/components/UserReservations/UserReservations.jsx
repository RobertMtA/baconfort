import React, { useState, useEffect } from 'react';
import { getUserReservations, updateReservationStatus } from '../../services/api';
import './UserReservations.css';

const UserReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // active, completed, cancelled
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    console.log('🔄 UserReservations: useEffect triggered');
    loadReservations();
    
    // Agregar interval para auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 UserReservations: Auto-refresh triggered');
      loadReservations();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadReservations = async () => {
    console.log('📥 UserReservations: iniciando carga de reservas...');
    try {
      setLoading(true);
      setError(''); // Limpiar errores previos
      
      const token = localStorage.getItem('baconfort-token');
      console.log('🔑 UserReservations: Token encontrado:', token ? `${token.substring(0, 20)}...` : 'NO EXISTE');
      
      if (!token) {
        setError('No hay sesión activa. Por favor inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      // Verificar si el token parece expirado
      if (token.startsWith('eyJ')) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Date.now() / 1000;
          if (payload.exp && payload.exp < now) {
            console.log('⏰ Token expirado, intentando renovar...');
            const user = JSON.parse(localStorage.getItem('baconfort-user') || '{}');
            if (user.email) {
              // Intentar renovar el token automáticamente
              const refreshResponse = await fetch(`http://localhost:3002/api/auth/refresh-token`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: user.email }),
              });
              
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                localStorage.setItem('baconfort-token', refreshData.token);
                localStorage.setItem('baconfort-user', JSON.stringify(refreshData.user));
                console.log('✅ Token renovado exitosamente');
              }
            }
          }
        } catch (e) {
          console.log('⚠️ No se pudo verificar expiración del token:', e.message);
        }
      }

      console.log('🌐 UserReservations: Haciendo llamada a API usando getUserReservations...');
      const result = await getUserReservations();
      
      console.log('📡 UserReservations: Resultado de getUserReservations:', result);
      
      // Manejar respuesta: puede ser Array directo o objeto con success/reservations
      if (Array.isArray(result)) {
        // Si es un array directo
        setReservations(result);
        console.log('✅ UserReservations: Reservas cargadas exitosamente (array directo):', result.length);
        
        // Logging detallado de estados
        result.forEach((res, index) => {
          console.log(`📋 Reserva ${index + 1}: ID=${res._id}, Estado=${res.status}, Propiedad=${res.propertyTitle}`);
        });
        
      } else if (result.success && result.reservations) {
        // Si es objeto con estructura {success, reservations}
        setReservations(result.reservations);
        console.log('✅ UserReservations: Reservas cargadas exitosamente (objeto):', result.reservations.length);
        
        // Logging detallado de estados
        result.reservations.forEach((res, index) => {
          console.log(`📋 Reserva ${index + 1}: ID=${res._id}, Estado=${res.status}, Propiedad=${res.propertyTitle}`);
        });
        
      } else {
        // Error o sin datos
        console.log('❌ UserReservations: No se pudieron cargar las reservas:', result?.error || 'Estructura de respuesta inesperada');
        setError(result?.error || 'Error al cargar las reservas');
        setReservations([]);
      }
      
    } catch (err) {
      console.error('Error al cargar reservas:', err);
      
      // Manejar diferentes tipos de errores
      if (err.message.includes('Token inválido') || err.message.includes('Token expirado')) {
        setError('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        // Limpiar tokens expirados
        localStorage.removeItem('baconfort-token');
        localStorage.removeItem('baconfort-user');
        
        // Redirigir a login después de un momento
        setTimeout(() => {
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login?reason=session_expired';
          }
        }, 3000);
      } else if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        setError('Error de conexión. Verifica que el servidor esté ejecutándose en http://localhost:3002');
      } else {
        setError(`Error al cargar reservas: ${err.message}`);
      }
      
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      return;
    }

    try {
      await updateReservationStatus(reservationId, 'cancelled');
      setReservations(prev => 
        prev.map(res => 
          res._id === reservationId 
            ? { ...res, status: 'cancelled' }
            : res
        )
      );
    } catch (err) {
      console.error('Error al cancelar reserva:', err);
      setError('Error al cancelar la reserva');
    }
  };

  const handleViewDetails = (reservation) => {
    console.log('🔍 Ver detalles de reserva:', reservation._id);
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedReservation(null);
  };

  const filterReservations = (status) => {
    const now = new Date();
    
    switch (status) {
      case 'active':
        return reservations.filter(res => 
          ['pending', 'confirmed'].includes(res.status) && 
          new Date(res.checkOut) >= now
        );
      case 'completed':
        return reservations.filter(res => 
          res.status === 'completed' || 
          (res.status === 'confirmed' && new Date(res.checkOut) < now)
        );
      case 'cancelled':
        return reservations.filter(res => res.status === 'cancelled');
      default:
        return reservations;
    }
  };

  const handlePayReservation = (reservation) => {
    // Redireccionar al componente de pagos pendientes
    window.location.href = `/pending-payments?reservation=${reservation._id}`;
  };

  const getStatusText = (status, reservation) => {
    const statusMap = {
      'pending': 'Pendiente de aprobación',
      'approved': 'Aprobada',
      'payment_pending': '💳 Pendiente de pago',
      'confirmed': 'Confirmada',
      'cancelled': 'Cancelada',
      'completed': 'Completada',
      'rejected': 'Rechazada'
    };
    
    // Si está confirmada pero sin información de pago, significa que pagó la seña del 30%
    if (status === 'confirmed' && (!reservation.paymentInfo || !reservation.paymentInfo.provider || !reservation.paymentInfo.amount)) {
      return '✅ Seña pagada - Lista para estadía';
    }
    
    // Si es pago en efectivo y aún no es completada, mostrar como pendiente de pago
    if (status === 'confirmed' && 
        reservation.paymentInfo && 
        (reservation.paymentInfo.provider === 'cash' || reservation.paymentInfo.provider === 'efectivo') && 
        new Date(reservation.checkOut) >= new Date()) {
      return '💳 Pago pendiente';
    }
    
    return statusMap[status] || status;
  };

  const getStatusClass = (status, reservation) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'approved': 
      case 'payment_pending': return 'status-ready-pay';
      case 'confirmed': 
        // Si está confirmada pero sin pago válido, tratarla como lista para pagar
        if (!reservation.paymentInfo || !reservation.paymentInfo.provider || !reservation.paymentInfo.amount) {
          return 'status-ready-pay';
        }
        // Si es pago en efectivo y aún no es completada, tratarla como lista para pagar
        if (reservation.paymentInfo && 
            (reservation.paymentInfo.provider === 'cash' || reservation.paymentInfo.provider === 'efectivo') && 
            new Date(reservation.checkOut) >= new Date()) {
          return 'status-ready-pay';
        }
        return 'status-confirmed';
      case 'cancelled': 
      case 'rejected': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return 'status-default';
    }
  };

  const canCancelReservation = (reservation) => {
    const checkInDate = new Date(reservation.checkIn);
    const now = new Date();
    const diffTime = checkInDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return ['pending', 'confirmed'].includes(reservation.status) && diffDays > 1;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredReservations = filterReservations(activeTab);

  if (loading) {
    return (
      <div className="user-reservations-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <h3>Cargando reservas...</h3>
          <p>Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-reservations-container">
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error al cargar reservas</h3>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button 
              className="retry-btn"
              onClick={() => {
                setError('');
                loadReservations();
              }}
            >
              <i className="fas fa-retry"></i>
              Reintentar
            </button>
            {error.includes('sesión') && (
              <a href="/login" className="login-btn">
                <i className="fas fa-sign-in-alt"></i>
                Iniciar Sesión
              </a>
            )}
            {error.includes('servidor') && (
              <div className="server-help">
                <p><strong>Para desarrolladores:</strong></p>
                <p>1. Verifica que el backend esté ejecutándose</p>
                <p>2. Ejecuta: <code>cd baconfort-backend && npm start</code></p>
                <p>3. El servidor debe estar en: <code>http://localhost:3002</code></p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-reservations-container">
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error al cargar reservas</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={loadReservations}>
              <i className="fas fa-redo"></i>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-reservations-container">
      <div className="page-header">
        <h2>
          <i className="fas fa-calendar-alt"></i>
          Mis Reservas
        </h2>
        <p>Gestiona y revisa el historial de tus reservas</p>
        <button 
          className="refresh-btn"
          onClick={() => {
            console.log('🔄 Manual refresh triggered');
            loadReservations();
          }}
          disabled={loading}
        >
          <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Estadísticas */}
      <div className="stats-cards">
        <div className="stat-card active">
          <i className="fas fa-clock"></i>
          <div>
            <h3>{filterReservations('active').length}</h3>
            <p>Reservas Activas</p>
          </div>
        </div>
        <div className="stat-card completed">
          <i className="fas fa-check-circle"></i>
          <div>
            <h3>{filterReservations('completed').length}</h3>
            <p>Completadas</p>
          </div>
        </div>
        <div className="stat-card cancelled">
          <i className="fas fa-times-circle"></i>
          <div>
            <h3>{filterReservations('cancelled').length}</h3>
            <p>Canceladas</p>
          </div>
        </div>
      </div>

      {/* Filtros de pestañas */}
      <div className="tab-filters">
        <button 
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <i className="fas fa-clock"></i>
          Activas ({filterReservations('active').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <i className="fas fa-check-circle"></i>
          Completadas ({filterReservations('completed').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          <i className="fas fa-times-circle"></i>
          Canceladas ({filterReservations('cancelled').length})
        </button>
      </div>

      {/* Lista de reservas */}
      <div className="reservations-list">
        {filteredReservations.length === 0 ? (
          <div className="no-reservations">
            <i className="fas fa-calendar-times"></i>
            <h3>No hay reservas en esta categoría</h3>
            <p>
              {activeTab === 'active' && 'No tienes reservas activas en este momento.'}
              {activeTab === 'completed' && 'No tienes reservas completadas.'}
              {activeTab === 'cancelled' && 'No tienes reservas canceladas.'}
            </p>
            
            {reservations.length === 0 && (
              <div className="empty-state-actions">
                <p>¿Es la primera vez que visitas? ¡Haz tu primera reserva!</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/'}
                >
                  <i className="fas fa-plus"></i>
                  Hacer una Reserva
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={loadReservations}
                >
                  <i className="fas fa-redo"></i>
                  Actualizar
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredReservations.map(reservation => (
            <div key={reservation._id} className="reservation-card">
              <div className="reservation-header">
                <div className="property-info">
                  <h4>{reservation.propertyName}</h4>
                  <span className="property-id">ID: {reservation.propertyId}</span>
                </div>
                <div className={getStatusClass(reservation.status, reservation)}>
                  {getStatusText(reservation.status, reservation)}
                </div>
              </div>

              <div className="reservation-details">
                <div className="detail-group">
                  <div className="detail-item">
                    <i className="fas fa-calendar-check"></i>
                    <div>
                      <strong>Check-in</strong>
                      <span>{formatDate(reservation.checkIn)}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar-times"></i>
                    <div>
                      <strong>Check-out</strong>
                      <span>{formatDate(reservation.checkOut)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-group">
                  <div className="detail-item">
                    <i className="fas fa-moon"></i>
                    <div>
                      <strong>Noches</strong>
                      <span>{calculateNights(reservation.checkIn, reservation.checkOut)}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-users"></i>
                    <div>
                      <strong>Huéspedes</strong>
                      <span>{reservation.guests}</span>
                    </div>
                  </div>
                </div>

                {/* Información de pago si existe Y es válida */}
                {reservation.paymentInfo && reservation.paymentInfo.provider && reservation.paymentInfo.amount && (
                  <div className="payment-info-section">
                    <div className="detail-item payment-detail">
                      <i className="fas fa-credit-card"></i>
                      <div>
                        <strong>Información de Pago</strong>
                        <div className="payment-details">
                          <span className="payment-provider">
                            {console.log(`🔍 [PaymentInfo] Renderizando provider para ${reservation._id}: ${reservation.paymentInfo.provider}`)}
                            {reservation.paymentInfo.provider === 'mercadopago' ? 'Mercado Pago' : 
                             reservation.paymentInfo.provider === 'payoneer' ? 'Payoneer' : 
                             reservation.paymentInfo.provider === 'efectivo' ? 'Pago en Efectivo' :
                             reservation.paymentInfo.provider === 'cash' ? 'Pago en Efectivo' :
                             'Método desconocido'}
                          </span>
                          {reservation.paymentInfo.amount && (
                            <span className="payment-amount">
                              {reservation.paymentInfo.currency || 'USD'} ${reservation.paymentInfo.amount}
                            </span>
                          )}
                          {reservation.paymentInfo.paidAt && (
                            <span className="payment-date">
                              {(reservation.paymentInfo.provider === 'efectivo' || reservation.paymentInfo.provider === 'cash') && 
                               reservation.status !== 'completed' ? 
                                'Pago pendiente (al llegar)' :
                               reservation.paymentInfo.paymentStatus === 'approved' ? 
                                `Pagado: ${formatDate(reservation.paymentInfo.paidAt)}` :
                                `Pagado: ${formatDate(reservation.paymentInfo.paidAt)}`
                              }
                            </span>
                          )}
                          {reservation.paymentInfo.paymentId && (
                            <span className="payment-id">
                              ID: {reservation.paymentInfo.paymentId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mensajes de estado */}
                <div className="reservation-status-message">
                  {reservation.status === 'pending' && (
                    <div className="status-message pending">
                      <i className="fas fa-clock"></i>
                      <span>Tu reserva está siendo revisada por nuestro equipo. Te notificaremos cuando esté lista.</span>
                    </div>
                  )}
                  
                  {reservation.status === 'payment_pending' && (
                    <div className="status-message payment-ready">
                      <i className="fas fa-credit-card"></i>
                      <span>¡Tu reserva ha sido aprobada! Puedes proceder con el pago.</span>
                    </div>
                  )}
                  
                  {reservation.status === 'confirmed' && reservation.paymentInfo && reservation.paymentInfo.provider && reservation.paymentInfo.amount && (
                    <div className="status-message confirmed">
                      <i className="fas fa-check-circle"></i>
                      <span>
                        {(reservation.paymentInfo.provider === 'efectivo' || reservation.paymentInfo.provider === 'cash') ? 
                          '¡Reserva confirmada! Te esperamos en las fechas indicadas.' : 
                          '¡Reserva confirmada y pagada! Te esperamos en las fechas indicadas.'
                        }
                      </span>
                    </div>
                  )}
                  
                  {reservation.status === 'confirmed' && (!reservation.paymentInfo || !reservation.paymentInfo.provider || !reservation.paymentInfo.amount) && (
                    <div className="status-message payment-ready">
                      <i className="fas fa-check-circle"></i>
                      <span>¡Seña del 30% pagada! Ya puedes prepararte para tu estadía. El 70% restante lo pagas al llegar.</span>
                    </div>
                  )}
                  
                  {reservation.status === 'rejected' && reservation.rejectedReason && (
                    <div className="status-message rejected">
                      <i className="fas fa-times-circle"></i>
                      <span>Reserva rechazada: {reservation.rejectedReason}</span>
                    </div>
                  )}
                  
                  {reservation.status === 'completed' && (
                    <div className="status-message completed">
                      <i className="fas fa-flag-checkered"></i>
                      <span>¡Estadía completada! Esperamos que hayas disfrutado tu experiencia.</span>
                    </div>
                  )}
                </div>

                {/* Notas del admin si existen */}
                {reservation.adminNotes && (
                  <div className="admin-notes-section">
                    <div className="detail-item">
                      <i className="fas fa-sticky-note"></i>
                      <div>
                        <strong>Nota del administrador:</strong>
                        <span className="admin-note">{reservation.adminNotes}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="reservation-dates">
                  <small>
                    Reserva creada el {formatDate(reservation.createdAt)}
                  </small>
                </div>
              </div>

              <div className="reservation-actions">
                {canCancelReservation(reservation) && (
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleCancelReservation(reservation._id)}
                  >
                    <i className="fas fa-times"></i>
                    Cancelar Reserva
                  </button>
                )}
                
                <button 
                  className="btn btn-info"
                  onClick={() => handleViewDetails(reservation)}
                >
                  <i className="fas fa-eye"></i>
                  Ver Detalles
                </button>

                {['approved', 'payment_pending'].includes(reservation.status) && (
                  <button 
                    className="btn btn-primary btn-pay"
                    onClick={() => handlePayReservation(reservation)}
                  >
                    <i className="fas fa-credit-card"></i>
                    💳 Realizar Pago
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de detalles de reserva */}
      {showDetailsModal && (
        <div className="details-modal">
          <div className="modal-content">
            <span className="close" onClick={closeDetailsModal}>&times;</span>
            <h3>Detalles de la Reserva</h3>
            
            {selectedReservation && (
              <div className="reservation-details-modal">
                <div className="detail-item">
                  <strong>PROPIEDAD:</strong>
                  <span>{selectedReservation.propertyName}</span>
                </div>
                <div className="detail-item">
                  <strong>ID DE PROPIEDAD:</strong>
                  <span>{selectedReservation.propertyId}</span>
                </div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-icon">
                      <i className="fas fa-moon"></i>
                    </div>
                    <div className="detail-content">
                      <strong>NOCHES</strong>
                      <span>{calculateNights(selectedReservation.checkIn, selectedReservation.checkOut)}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-icon">
                      <i className="fas fa-users"></i>
                    </div>
                    <div className="detail-content">
                      <strong>HUÉSPEDES</strong>
                      <span>{selectedReservation.guests}</span>
                    </div>
                  </div>
                </div>
                <div className="detail-item">
                  <strong>CHECK-IN:</strong>
                  <span>{formatDate(selectedReservation.checkIn)}</span>
                </div>
                <div className="detail-item">
                  <strong>CHECK-OUT:</strong>
                  <span>{formatDate(selectedReservation.checkOut)}</span>
                </div>
                {selectedReservation.specialRequests && (
                  <div className="detail-item special-requests">
                    <strong>SOLICITUDES ESPECIALES:</strong>
                    <span>{selectedReservation.specialRequests}</span>
                  </div>
                )}
                <div className="detail-item">
                  <strong>ESTADO:</strong>
                  <span className={`status ${selectedReservation.status.toLowerCase()}`}>
                    {getStatusText(selectedReservation.status, selectedReservation)}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>RESERVA CREADA EL:</strong>
                  <span>{formatDate(selectedReservation.createdAt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReservations;
