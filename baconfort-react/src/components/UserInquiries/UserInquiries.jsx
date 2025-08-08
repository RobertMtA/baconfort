import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyInquiries } from '../../services/api';
import './UserInquiries.css';

function UserInquiries() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchMyInquiries();
  }, []);

  const fetchMyInquiries = async () => {
    try {
      setLoading(true);
      console.log('🔄 USER INQUIRIES: Cargando mis consultas...');
      
      const response = await getMyInquiries();
      
      console.log('✅ USER INQUIRIES: Respuesta:', response);
      
      if (response.success) {
        setInquiries(response.inquiries || []);
        setError(null);
      } else {
        setError(response.message || 'Error cargando consultas');
      }
    } catch (error) {
      console.error('❌ USER INQUIRIES: Error:', error);
      setError('Error cargando consultas');
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendiente', className: 'status-pending', icon: '⏳' },
      approved: { label: 'Aprobada', className: 'status-approved', icon: '✅' },
      rejected: { label: 'Rechazada', className: 'status-rejected', icon: '❌' }
    };
    
    const config = statusConfig[status] || { label: status, className: 'status-unknown', icon: '❓' };
    return (
      <span className={`status-badge ${config.className}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const proceedWithReservation = (inquiry) => {
    if (inquiry.propertyId) {
      // Navegar a la página de la propiedad con los datos de la consulta pre-cargados
      const searchParams = new URLSearchParams({
        checkIn: inquiry.checkIn.split('T')[0], // Solo la fecha, sin la hora
        checkOut: inquiry.checkOut.split('T')[0],
        guests: inquiry.guests.toString()
      });
      
      navigate(`/departamentos/${inquiry.propertyId}?${searchParams.toString()}`);
    } else {
      // Fallback: si no hay propertyId, buscar por título
      console.warn('No se encontró propertyId, buscando por título...');
      // Esta es una función de backup, idealmente no debería ser necesaria
      const propertySlug = inquiry.propertyTitle.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      navigate(`/departamentos/${propertySlug}`);
    }
  };

  if (loading) {
    return (
      <div className="user-inquiries">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando tus consultas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-inquiries">
      <div className="inquiries-header">
        <h3>📋 Mis Consultas de Disponibilidad</h3>
        <p className="inquiries-description">
          Aquí puedes ver todas las consultas de disponibilidad que has enviado y su estado actual.
        </p>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {inquiries.length === 0 ? (
        <div className="no-inquiries">
          <div className="no-inquiries-icon">📝</div>
          <h4>No tienes consultas aún</h4>
          <p>Cuando envíes una consulta de disponibilidad desde una propiedad, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="inquiries-grid">
          {inquiries.map((inquiry) => (
            <div key={inquiry._id} className="inquiry-card">
              <div className="inquiry-header">
                <div className="inquiry-property">
                  <h4>{inquiry.propertyTitle}</h4>
                  <span className="inquiry-date">
                    {formatDate(inquiry.createdAt)}
                  </span>
                </div>
                {getStatusBadge(inquiry.status)}
              </div>

              <div className="inquiry-details">
                <div className="detail-row">
                  <span className="detail-label">📅 Check-in:</span>
                  <span className="detail-value">
                    {new Date(inquiry.checkIn).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📅 Check-out:</span>
                  <span className="detail-value">
                    {new Date(inquiry.checkOut).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">👥 Huéspedes:</span>
                  <span className="detail-value">{inquiry.guests}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">💰 Precio:</span>
                  <span className="detail-value">{formatCurrency(inquiry.totalPrice)}</span>
                </div>
              </div>

              {inquiry.customMessage && (
                <div className="inquiry-message">
                  <p><strong>Tu mensaje:</strong></p>
                  <p className="message-text">"{inquiry.customMessage}"</p>
                </div>
              )}

              {inquiry.adminResponse && (
                <div className="admin-response">
                  <p><strong>Respuesta del administrador:</strong></p>
                  <p className="response-text">"{inquiry.adminResponse}"</p>
                </div>
              )}

              <div className="inquiry-actions">
                <button 
                  className="details-button"
                  onClick={() => openDetails(inquiry)}
                >
                  Ver Detalles
                </button>
                {inquiry.status === 'approved' && (
                  <button 
                    className="proceed-button"
                    onClick={() => proceedWithReservation(inquiry)}
                  >
                    ✅ ¡Proceder con la Reserva!
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {showDetailsModal && selectedInquiry && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Detalles de la Consulta</h3>
              <button 
                className="close-button"
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="inquiry-full-details">
                <div className="detail-section">
                  <h4>🏠 Información de la Reserva</h4>
                  <p><strong>Propiedad:</strong> {selectedInquiry.propertyTitle}</p>
                  <p><strong>Check-in:</strong> {formatDate(selectedInquiry.checkIn)}</p>
                  <p><strong>Check-out:</strong> {formatDate(selectedInquiry.checkOut)}</p>
                  <p><strong>Huéspedes:</strong> {selectedInquiry.guests}</p>
                  <p><strong>Precio Total:</strong> {formatCurrency(selectedInquiry.totalPrice)}</p>
                </div>

                <div className="detail-section">
                  <h4>ℹ️ Estado de la Consulta</h4>
                  <p><strong>Estado:</strong> {getStatusBadge(selectedInquiry.status)}</p>
                  <p><strong>Enviada:</strong> {formatDate(selectedInquiry.createdAt)}</p>
                  {selectedInquiry.updatedAt !== selectedInquiry.createdAt && (
                    <p><strong>Última actualización:</strong> {formatDate(selectedInquiry.updatedAt)}</p>
                  )}
                </div>

                {selectedInquiry.customMessage && (
                  <div className="detail-section">
                    <h4>💬 Tu Mensaje</h4>
                    <p className="custom-message">{selectedInquiry.customMessage}</p>
                  </div>
                )}

                {selectedInquiry.adminResponse && (
                  <div className="detail-section">
                    <h4>📧 Respuesta del Administrador</h4>
                    <p className="admin-response-text">{selectedInquiry.adminResponse}</p>
                  </div>
                )}

                {selectedInquiry.status === 'pending' && (
                  <div className="detail-section pending-info">
                    <h4>⏳ Información</h4>
                    <p>Tu consulta está pendiente de revisión. Te notificaremos por email cuando tengamos una respuesta.</p>
                  </div>
                )}

                {selectedInquiry.status === 'approved' && (
                  <div className="detail-section approved-info">
                    <h4>✅ ¡Consulta Aprobada!</h4>
                    <p>Tu consulta ha sido aprobada. Puedes proceder con la reserva haciendo clic en el botón de abajo.</p>
                  </div>
                )}

                {selectedInquiry.status === 'rejected' && (
                  <div className="detail-section rejected-info">
                    <h4>❌ Consulta Rechazada</h4>
                    <p>Lamentablemente, esta consulta no pudo ser aprobada. Puedes intentar con otras fechas.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              {selectedInquiry.status === 'approved' && (
                <button 
                  className="proceed-button"
                  onClick={() => {
                    proceedWithReservation(selectedInquiry);
                    setShowDetailsModal(false);
                  }}
                >
                  ✅ ¡Proceder con la Reserva!
                </button>
              )}
              <button 
                className="close-modal-button"
                onClick={() => setShowDetailsModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserInquiries;
