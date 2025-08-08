import { useState, useEffect } from 'react';
import { API_URL } from '../../services/api';
import { usePriceCalculator } from '../../hooks/usePriceCalculator';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import './AdminReservations.css';

function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Estados para manejar precios dinámicos
  const [propertyPrices, setPropertyPrices] = useState({});
  const { properties } = useAdmin();

  useEffect(() => {
    fetchAllReservations();
    loadPropertyPrices();
  }, []);

  // Función para cargar precios de las propiedades
  const loadPropertyPrices = async () => {
    try {
      console.log('💰 PRICES: Cargando precios de propiedades...');
      
      if (properties && Object.keys(properties).length > 0) {
        console.log('💰 PRICES: Usando propiedades del contexto:', Object.keys(properties));
        
        const pricesMap = {};
        Object.values(properties).forEach(property => {
          if (property.pricing) {
            // Mapear tanto por nombre como por ID para mayor compatibilidad
            pricesMap[property.name] = property.pricing;
            pricesMap[property.id] = property.pricing;
            console.log(`💰 PRICES: ${property.name} (${property.id}):`, property.pricing);
          }
        });
        
        setPropertyPrices(pricesMap);
      } else {
        console.log('💰 PRICES: No hay propiedades en el contexto, cargando directamente...');
        
        // Cargar directamente desde la API si no hay contexto
        const response = await fetch(`${API_URL}/properties`);
        if (response.ok) {
          const responseData = await response.json();
          const propertiesData = responseData.data || responseData;
          const pricesMap = {};
          
          propertiesData.forEach(property => {
            // La API usa 'prices', no 'pricing'
            if (property.prices) {
              pricesMap[property.title] = property.prices; // usar title como nombre
              pricesMap[property.id] = property.prices;
              console.log(`💰 PRICES: ${property.title} (${property.id}):`, property.prices);
            }
          });
          
          setPropertyPrices(pricesMap);
          console.log('💰 PRICES: Precios cargados desde API:', pricesMap);
        }
      }
    } catch (error) {
      console.error('❌ PRICES: Error cargando precios:', error);
    }
  };

  const fetchAllReservations = async () => {
    try {
      console.log('🔄 RESERVAS: Cargando reservas desde backend...');
      
      // Obtener token de sesión actual
      const savedSession = localStorage.getItem('baconfort_admin_session');
      const sessionData = savedSession ? JSON.parse(savedSession) : null;
      const authToken = sessionData?.token || 'BACONFORT_ADMIN_2025_7D3F9K2L';
      
      console.log('🔑 RESERVAS: Usando token:', authToken);
      
      const response = await fetch(`${API_URL}/reservations/admin/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ RESERVAS: Respuesta completa:', responseData);
        
        // Extraer el array de reservas de la respuesta
        const reservationsArray = responseData.data || responseData;
        console.log('✅ RESERVAS: Datos cargados:', reservationsArray.length, 'reservas');
        
        setReservations(reservationsArray);
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('❌ RESERVAS: Error del servidor:', errorData);
        setError(errorData.message || 'Error cargando reservas');
      }
    } catch (err) {
      console.error('❌ RESERVAS: Error de conexión:', err);
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  const changeReservationStatus = async (reservationId, newStatus) => {
    console.log('🔄 Cambiando estado:', { reservationId, newStatus });
    try {
      // Obtener token de sesión actual
      const savedSession = localStorage.getItem('baconfort_admin_session');
      const sessionData = savedSession ? JSON.parse(savedSession) : null;
      const authToken = sessionData?.token || 'BACONFORT_ADMIN_2025_7D3F9K2L';
      
      const response = await fetch(`${API_URL}/reservations/admin/${reservationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setReservations(prev => prev.map(reservation => 
          reservation._id === reservationId 
            ? { ...reservation, status: newStatus, updatedAt: new Date().toISOString() }
            : reservation
        ));
        alert(`✅ Estado cambiado a: ${newStatus}`);
        console.log('✅ Estado actualizado exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al cambiar estado');
        console.error('❌ Error del servidor:', errorData);
      }
    } catch (err) {
      console.error('❌ Error changing reservation status:', err);
      alert('Error de conexión al cambiar estado');
    }
  };

  // Función para obtener información de precios calculados para una reserva
  const getReservationPriceInfo = (reservation) => {
    try {
      // SIEMPRE calcular dinámicamente usando los precios reales del AdminContext
      // para asegurar que los precios sean correctos
      let propertyPricing = propertyPrices[reservation.propertyName] || 
                           propertyPrices[reservation.propertyId] ||
                           propertyPrices['Moldes 1680']; // fallback específico
      
      if (!propertyPricing) {
        console.log('💰 CALC: No hay precios para:', reservation.propertyName, 'o ID:', reservation.propertyId);
        console.log('💰 CALC: Precios disponibles:', Object.keys(propertyPrices));
        
        // Como fallback, usar priceInfo si está disponible
        if (reservation.priceInfo && reservation.priceInfo.totalAmount > 0) {
          console.log('💰 CALC: Usando priceInfo como fallback:', reservation.priceInfo);
          return {
            totalAmount: reservation.priceInfo.totalAmount,
            currency: reservation.priceInfo.currency || 'USD',
            nights: reservation.priceInfo.nights || 0,
            pricePerNight: reservation.priceInfo.pricePerNight || 0,
            period: reservation.priceInfo.period || 'daily',
            source: 'stored'
          };
        }
        
        return null;
      }

      // Calcular manualmente sin usar el hook (ya que estamos dentro de una función)
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (nights <= 0) {
        return null;
      }

      // Extraer precios numéricos
      const extractPrice = (priceString) => {
        if (typeof priceString === 'number') return priceString;
        if (typeof priceString === 'string') {
          const match = priceString.match(/[\d,]+/);
          return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
        }
        return 0;
      };

      const dailyPrice = extractPrice(propertyPricing.daily) || 0;
      const weeklyPrice = extractPrice(propertyPricing.weekly) || 0;
      const monthlyPrice = extractPrice(propertyPricing.monthly) || 0;

      let finalPrice = 0;
      let period = 'daily';
      let pricePerNight = dailyPrice;

      // Lógica de selección de tarifa
      if (nights >= 30 && monthlyPrice > 0) {
        period = 'monthly';
        pricePerNight = monthlyPrice / 30;
        finalPrice = Math.ceil(nights / 30) * monthlyPrice + (nights % 30) * pricePerNight;
      } else if (nights >= 7 && weeklyPrice > 0) {
        period = 'weekly';
        pricePerNight = weeklyPrice / 7;
        finalPrice = Math.ceil(nights / 7) * weeklyPrice + (nights % 7) * dailyPrice;
      } else {
        period = 'daily';
        pricePerNight = dailyPrice;
        finalPrice = nights * dailyPrice;
      }

      console.log(`💰 CALC: Precio calculado para ${reservation.propertyName}:`, {
        nights,
        period,
        finalPrice,
        pricePerNight,
        dailyPrice,
        weeklyPrice,
        monthlyPrice
      });

      return {
        totalAmount: Math.round(finalPrice),
        currency: propertyPricing.currency || 'USD',
        nights: nights,
        pricePerNight: Math.round(pricePerNight),
        period: period,
        source: 'calculated'
      };
    } catch (error) {
      console.error('❌ CALC: Error calculando precio:', error);
      return null;
    }
  };

  const deleteReservation = async (reservationId, propertyName) => {
    // Confirmar antes de eliminar
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente la reserva para "${propertyName}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmed) return;

    console.log('🗑️ Eliminando reserva:', reservationId);
    try {
      // Obtener token de sesión actual
      const savedSession = localStorage.getItem('baconfort_admin_session');
      const sessionData = savedSession ? JSON.parse(savedSession) : null;
      const authToken = sessionData?.token || 'BACONFORT_ADMIN_2025_7D3F9K2L';
      
      const response = await fetch(`${API_URL}/reservations/admin/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        // Remover la reserva del estado local
        setReservations(prev => prev.filter(reservation => reservation._id !== reservationId));
        alert('✅ Reserva eliminada exitosamente');
        console.log('✅ Reserva eliminada exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al eliminar la reserva');
        console.error('❌ Error del servidor:', errorData);
      }
    } catch (err) {
      console.error('❌ Error eliminando reserva:', err);
      alert('Error de conexión al eliminar la reserva');
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

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Pendiente',
      confirmed: 'Confirmada', 
      cancelled: 'Cancelada',
      completed: 'Completada'
    };
    return statusMap[status] || status;
  };

  // Funciones para manejar el modal de mensajes
  const openMessageModal = (reservation) => {
    setSelectedMessage({
      message: reservation.message || 'Sin mensaje',
      propertyName: reservation.propertyName,
      userName: reservation.fullName || reservation.userName,
      userEmail: reservation.email || reservation.userEmail,
      phone: reservation.phone,
      createdAt: reservation.createdAt
    });
    setShowMessageModal(true);
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setSelectedMessage(null);
  };

  // Funciones para manejar el modal de detalles mejorado
  const handleViewDetails = (reservation) => {
    console.log('🔍 Ver detalles de reserva (admin):', reservation._id);
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedReservation(null);
  };

  // Función para truncar texto largo
  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'Sin mensaje';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime()) || date.getTime() <= 0) {
      return 'Fecha no disponible';
    }
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime()) || date.getTime() <= 0) {
      return 'Fecha no disponible';
    }
    
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'all') return true;
    return reservation.status === filter;
  });

  const getStatusCounts = () => {
    return {
      all: reservations.length,
      pending: reservations.filter(r => r.status === 'pending').length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      cancelled: reservations.filter(r => r.status === 'cancelled').length,
      completed: reservations.filter(r => r.status === 'completed').length
    };
  };

  if (loading) {
    return (
      <div className="admin-reservations-container">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando reservas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-reservations-container">
        <div className="error">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error cargando reservas</h3>
          <p>{error}</p>
          <button onClick={fetchAllReservations} className="retry-btn">
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="admin-reservations-container">
      <div className="page-header">
        <h2>
          <i className="fas fa-calendar-check"></i>
          Gestión de Reservas
        </h2>
        <p>Administra todas las reservas del sistema</p>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <i className="fas fa-calendar-alt"></i>
          <div>
            <h3>{statusCounts.all}</h3>
            <p>Total Reservas</p>
          </div>
        </div>
        <div className="stat-card pending">
          <i className="fas fa-clock"></i>
          <div>
            <h3>{statusCounts.pending}</h3>
            <p>Pendientes</p>
          </div>
        </div>
        <div className="stat-card confirmed">
          <i className="fas fa-check-circle"></i>
          <div>
            <h3>{statusCounts.confirmed}</h3>
            <p>Confirmadas</p>
          </div>
        </div>
        <div className="stat-card cancelled">
          <i className="fas fa-times-circle"></i>
          <div>
            <h3>{statusCounts.cancelled}</h3>
            <p>Canceladas</p>
          </div>
        </div>
        <div className="stat-card completed">
          <i className="fas fa-flag-checkered"></i>
          <div>
            <h3>{statusCounts.completed}</h3>
            <p>Completadas</p>
          </div>
        </div>
      </div>

      <div className="filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Todas ({statusCounts.all})
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Pendientes ({statusCounts.pending})
        </button>
        <button 
          className={filter === 'confirmed' ? 'active' : ''}
          onClick={() => setFilter('confirmed')}
        >
          Confirmadas ({statusCounts.confirmed})
        </button>
        <button 
          className={filter === 'cancelled' ? 'active' : ''}
          onClick={() => setFilter('cancelled')}
        >
          Canceladas ({statusCounts.cancelled})
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completadas ({statusCounts.completed})
        </button>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="no-reservations">
          <i className="fas fa-calendar-times"></i>
          <h3>No hay reservas</h3>
          <p>No se encontraron reservas para el filtro seleccionado.</p>
        </div>
      ) : (
        <div className="reservations-cards-container">
          {filteredReservations.map((reservation) => (
            <div key={reservation._id} className="reservation-card">
              <div className="reservation-header">
                <div className="reservation-title">
                  <i className="fas fa-home"></i>
                  {reservation.propertyName}
                </div>
                {getStatusBadge(reservation.status)}
              </div>
              
              <div className="reservation-details">
                <div className="detail-row">
                  <span className="detail-label">Usuario:</span>
                  <span className="detail-value">
                    {reservation.userName || reservation.fullName}<br />
                    <small>{reservation.userEmail || reservation.email}</small>
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Fechas:</span>
                  <span className="detail-value">
                    {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}<br />
                    <small>{calculateNights(reservation.checkIn, reservation.checkOut)} noches</small>
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Huéspedes:</span>
                  <span className="detail-value">{reservation.guests}</span>
                </div>
                
                {/* Información de precios calculados */}
                {(() => {
                  const priceInfo = getReservationPriceInfo(reservation);
                  return priceInfo ? (
                    <div className="detail-row">
                      <span className="detail-label">💰 Precio:</span>
                      <span className="detail-value">
                        <div className="price-info">
                          <div className="price-total">
                            <strong style={{color: '#2d8659', fontSize: '1.1em'}}>
                              {priceInfo.currency === 'USD' ? 'US$' : '$'}{priceInfo.totalAmount.toLocaleString()}
                            </strong>
                            <small style={{color: '#666', marginLeft: '8px'}}>
                              ({priceInfo.nights} noches)
                            </small>
                          </div>
                          <div className="price-details" style={{fontSize: '0.85em', color: '#666', marginTop: '4px'}}>
                            <div>📊 Tarifa {priceInfo.period === 'monthly' ? 'mensual' : priceInfo.period === 'weekly' ? 'semanal' : 'diaria'}</div>
                            <div>💵 {priceInfo.currency === 'USD' ? 'US$' : '$'}{priceInfo.pricePerNight.toLocaleString()}/noche</div>
                            <div style={{color: '#e67e22', fontWeight: 'bold'}}>
                              🔒 Seña: {priceInfo.currency === 'USD' ? 'US$' : '$'}{Math.round(priceInfo.totalAmount * 0.3).toLocaleString()} (30%)
                            </div>
                            {priceInfo.source === 'calculated' && (
                              <div style={{color: '#3498db', fontSize: '0.8em'}}>
                                📈 Calculado dinámicamente
                              </div>
                            )}
                            {priceInfo.breakdown && (
                              <div style={{color: '#9b59b6', fontSize: '0.8em'}}>
                                {priceInfo.breakdown.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </span>
                    </div>
                  ) : null;
                })()}
                
                {/* Información de pago (si existe) */}
                {reservation.paymentInfo && (
                  <div className="detail-row">
                    <span className="detail-label">Pago:</span>
                    <span className="detail-value">
                      <div className="payment-info">
                        <div className="payment-provider">
                          <i className={`fas ${reservation.paymentInfo.provider === 'mercadopago' ? 'fa-credit-card' : 'fa-money-bill-wave'}`}></i>
                          {reservation.paymentInfo.provider === 'mercadopago' ? 'MercadoPago' : 
                           reservation.paymentInfo.provider === 'efectivo' ? 'Pago en Efectivo' : 
                           reservation.paymentInfo.paymentStatus === 'pending' ? 'Pendiente de pago' : 'No especificado'}
                        </div>
                        {reservation.paymentInfo.amount && (
                          <div className="payment-amount">
                            {reservation.paymentInfo.currency} ${reservation.paymentInfo.amount}
                          </div>
                        )}
                        {reservation.paymentInfo.paidAt && new Date(reservation.paymentInfo.paidAt).getTime() > 0 ? (
                          <div className="payment-date">
                            <small>Pagado: {formatDate(reservation.paymentInfo.paidAt)}</small>
                          </div>
                        ) : (
                          <div className="payment-date">
                            <small style={{color: '#f39c12'}}>Estado: {
                              reservation.paymentInfo.paymentStatus === 'pending' ? 'Pendiente de pago' :
                              reservation.paymentInfo.paymentStatus === 'completed' ? 'Pago completado' :
                              'Pendiente de confirmación'
                            }</small>
                          </div>
                        )}
                        {reservation.paymentInfo.paymentId && (
                          <div className="payment-id">
                            <small>ID: {reservation.paymentInfo.paymentId}</small>
                          </div>
                        )}
                      </div>
                    </span>
                  </div>
                )}
                
                {/* Mostrar estado de pago */}
                {!reservation.paymentInfo && ['confirmed', 'completed'].includes(reservation.status) && (
                  <div className="detail-row">
                    <span className="detail-label">🚨 Estado Pago:</span>
                    <span className="detail-value">
                      <span className="no-payment-info" style={{color: '#e74c3c', fontWeight: 'bold'}}>
                        ⚠️ Reserva confirmada sin registro de pago
                      </span>
                    </span>
                  </div>
                )}
                
                {!reservation.paymentInfo && reservation.status === 'pending' && (
                  <div className="detail-row">
                    <span className="detail-label">⏳ Estado Pago:</span>
                    <span className="detail-value">
                      <span style={{color: '#f39c12'}}>
                        🔄 Pendiente - Esperando confirmación de pago
                      </span>
                    </span>
                  </div>
                )}
                
                <div className="detail-row">
                  <span className="detail-label">Contacto:</span>
                  <span className="detail-value">
                    {reservation.fullName}<br />
                    <small>{reservation.email}</small>
                    {reservation.phone && <><br /><small>{reservation.phone}</small></>}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Mensaje:</span>
                  <span className="detail-value">
                    <div className="message-preview-card" title={reservation.message || 'Sin mensaje'}>
                      {truncateText(reservation.message, 100)}
                    </div>
                    <button 
                      className="view-message-btn-card"
                      onClick={() => openMessageModal(reservation)}
                      title="Ver mensaje completo"
                    >
                      Ver completo
                    </button>
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Creada:</span>
                  <span className="detail-value">
                    <small>{formatDateTime(reservation.createdAt)}</small>
                  </span>
                </div>
              </div>
              
              <div className="card-actions">
                <button 
                  className="details-btn"
                  onClick={() => handleViewDetails(reservation)}
                  title="Ver detalles completos"
                >
                  <i className="fas fa-eye"></i>
                  Ver Detalles
                </button>
                
                <button 
                  className="view-btn"
                  onClick={() => openMessageModal(reservation)}
                  title="Ver mensaje completo"
                >
                  💬 Ver Mensaje
                </button>
                
                {reservation.status === 'pending' && (
                  <>
                    <button 
                      className="confirm-btn"
                      onClick={() => changeReservationStatus(reservation._id, 'confirmed')}
                      title="Confirmar reserva"
                    >
                      ✅ OK
                    </button>
                    
                    <button 
                      className="cancel-btn"
                      onClick={() => changeReservationStatus(reservation._id, 'cancelled')}
                      title="Cancelar reserva"
                    >
                      ❌ No
                    </button>
                  </>
                )}
                
                {reservation.status === 'confirmed' && (
                  <button 
                    className="complete-btn"
                    onClick={() => changeReservationStatus(reservation._id, 'completed')}
                    title="Marcar como completada"
                  >
                    🏁 Done
                  </button>
                )}
                
                <button 
                  className="delete-btn"
                  onClick={() => deleteReservation(reservation._id, reservation.propertyName)}
                  title="Eliminar reserva permanentemente"
                >
                  🗑️ Eliminar
                </button>
                
                <select 
                  className="status-selector"
                  value={reservation.status}
                  onChange={(e) => changeReservationStatus(reservation._id, e.target.value)}
                  title="Cambiar estado"
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="completed">Completada</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal para mostrar mensaje completo */}
      {showMessageModal && selectedMessage && (
        <div className="message-modal-overlay" onClick={closeMessageModal}>
          <div className="message-modal" onClick={(e) => e.stopPropagation()}>
            <div className="message-modal-header">
              <h3>Mensaje de Reserva</h3>
              <button className="close-modal-btn" onClick={closeMessageModal}>
                ✕
              </button>
            </div>
            
            <div className="message-modal-body">
              <div className="reservation-info">
                <div className="info-row">
                  <strong>Propiedad:</strong> {selectedMessage.propertyName}
                </div>
                <div className="info-row">
                  <strong>Cliente:</strong> {selectedMessage.userName}
                </div>
                <div className="info-row">
                  <strong>Email:</strong> {selectedMessage.userEmail}
                </div>
                {selectedMessage.phone && (
                  <div className="info-row">
                    <strong>Teléfono:</strong> {selectedMessage.phone}
                  </div>
                )}
                <div className="info-row">
                  <strong>Fecha:</strong> {formatDateTime(selectedMessage.createdAt)}
                </div>
              </div>
              
              <div className="message-content">
                <h4>Mensaje:</h4>
                <div className="message-text">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
            
            <div className="message-modal-footer">
              <button className="btn-primary" onClick={closeMessageModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para detalles de reserva (mejorado) */}
      {showDetailsModal && selectedReservation && (
        <div className="details-modal-overlay" onClick={closeDetailsModal}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="details-modal-header">
              <h3>Detalles de la Reserva</h3>
              <button className="close-modal-btn" onClick={closeDetailsModal}>
                ✕
              </button>
            </div>
            
            <div className="details-modal-body">
              <div className="reservation-info">
                <div className="info-row">
                  <strong>Propiedad:</strong> {selectedReservation.propertyName}
                </div>
                <div className="info-row">
                  <strong>Cliente:</strong> {selectedReservation.userName}
                </div>
                <div className="info-row">
                  <strong>Email:</strong> {selectedReservation.userEmail}
                </div>
                {selectedReservation.phone && (
                  <div className="info-row">
                    <strong>Teléfono:</strong> {selectedReservation.phone}
                  </div>
                )}
                <div className="info-row">
                  <strong>Fechas:</strong> {formatDate(selectedReservation.checkIn)} - {formatDate(selectedReservation.checkOut)}
                </div>
                <div className="info-row">
                  <strong>Noches:</strong> {calculateNights(selectedReservation.checkIn, selectedReservation.checkOut)}
                </div>
                <div className="info-row">
                  <strong>Huéspedes:</strong> {selectedReservation.guests}
                </div>
                <div className="info-row">
                  <strong>Estado:</strong> {getStatusBadge(selectedReservation.status)}
                </div>
                <div className="info-row">
                  <strong>Creada:</strong> {formatDateTime(selectedReservation.createdAt)}
                </div>
                <div className="info-row">
                  <strong>Mensaje:</strong>
                  <div className="message-text">
                    {selectedReservation.message || 'Sin mensaje'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="details-modal-footer">
              <button className="btn-primary" onClick={closeDetailsModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles de reserva mejorado */}
      {showDetailsModal && selectedReservation && (
        <div className="details-modal">
          <div className="modal-content">
            <span className="close" onClick={closeDetailsModal}>&times;</span>
            <h3>Detalles de la Reserva</h3>
            
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
              <div className="detail-item">
                <strong>CLIENTE:</strong>
                <span>{selectedReservation.fullName || selectedReservation.userName}</span>
              </div>
              <div className="detail-item">
                <strong>EMAIL:</strong>
                <span>{selectedReservation.email || selectedReservation.userEmail}</span>
              </div>
              {selectedReservation.dni && (
                <div className="detail-item">
                  <strong>DNI:</strong>
                  <span>{selectedReservation.dni}</span>
                </div>
              )}
              {selectedReservation.phone && (
                <div className="detail-item">
                  <strong>TELÉFONO:</strong>
                  <span>{selectedReservation.phone}</span>
                </div>
              )}
              {selectedReservation.message && (
                <div className="detail-item special-requests">
                  <strong>MENSAJE DEL CLIENTE:</strong>
                  <span>{selectedReservation.message}</span>
                </div>
              )}
              <div className="detail-item">
                <strong>ESTADO:</strong>
                <span className={`status ${selectedReservation.status.toLowerCase()}`}>
                  {getStatusText(selectedReservation.status)}
                </span>
              </div>
              <div className="detail-item">
                <strong>RESERVA CREADA EL:</strong>
                <span>{formatDateTime(selectedReservation.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReservations;
