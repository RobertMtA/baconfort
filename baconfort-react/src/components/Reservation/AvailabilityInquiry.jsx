import React, { useState } from 'react';
import './AvailabilityInquiry.css';

const AvailabilityInquiry = ({ 
  reservationData, 
  propertyTitle, 
  onSuccess, 
  onCancel 
}) => {
  const [customMessage, setCustomMessage] = useState(
    `Hola, me interesa reservar ${propertyTitle}. ¿Está disponible para las fechas indicadas? Por favor contactarme a mi email o teléfono. Saludos.`
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const sendInquiry = async () => {
    console.log('🚀 INQUIRY: Iniciando envío de consulta...');
    
    setIsLoading(true);
    setError('');

    try {
      const inquiryData = {
        propertyId: reservationData.propertyId,
        propertyTitle,
        checkIn: reservationData.checkIn,
        checkOut: reservationData.checkOut,
        guests: parseInt(reservationData.guests),
        totalPrice: parseFloat(reservationData.totalPrice),
        guestName: reservationData.fullName,
        guestEmail: reservationData.email,
        guestPhone: reservationData.phone,
        guestDni: reservationData.dni,
        customMessage: customMessage.trim()
      };

      console.log('📋 INQUIRY: Datos a enviar:', inquiryData);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inquiryData)
      });

      console.log('📡 INQUIRY: Respuesta del servidor - Status:', response.status);

      const data = await response.json();
      console.log('📋 INQUIRY: Datos de respuesta:', data);

      if (response.ok) {
        console.log('✅ INQUIRY: Consulta enviada exitosamente');
        onSuccess(data);
      } else {
        console.error('❌ INQUIRY: Error del servidor:', data.message);
        setError(data.message || 'Error al enviar la consulta');
      }
    } catch (error) {
      console.error('❌ INQUIRY: Error de red o parsing:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="availability-inquiry">
      <div className="inquiry-container">
        <div className="inquiry-header">
          <h2>📞 Consultar Disponibilidad</h2>
          <p>Envía una consulta al administrador para verificar la disponibilidad antes de reservar.</p>
        </div>

        <div className="reservation-summary">
          <h3>📋 Resumen de tu consulta</h3>
          <div className="summary-details">
            <div className="summary-row">
              <span><strong>🏠 Propiedad:</strong></span>
              <span>{propertyTitle}</span>
            </div>
            <div className="summary-row">
              <span><strong>📅 Check-in:</strong></span>
              <span>{formatDate(reservationData.checkIn)}</span>
            </div>
            <div className="summary-row">
              <span><strong>📅 Check-out:</strong></span>
              <span>{formatDate(reservationData.checkOut)}</span>
            </div>
            <div className="summary-row">
              <span><strong>👥 Huéspedes:</strong></span>
              <span>{reservationData.guests} {reservationData.guests === '1' ? 'persona' : 'personas'}</span>
            </div>
            <div className="summary-row price-total-row">
              <span><strong>💰 Precio Total:</strong></span>
              <span><strong>${reservationData.totalPrice} USD</strong></span>
            </div>
            <div className="summary-row">
              <span><strong>📧 Tu email:</strong></span>
              <span>{reservationData.email}</span>
            </div>
            <div className="summary-row">
              <span><strong>📱 Teléfono:</strong></span>
              <span>{reservationData.phone || 'No especificado'}</span>
            </div>
            <div className="summary-row">
              <span><strong>🆔 DNI:</strong></span>
              <span>{reservationData.dni || 'No especificado'}</span>
            </div>
          </div>
        </div>

        <div className="message-section">
          <label htmlFor="inquiry-message">
            <strong>💬 Tu mensaje:</strong>
          </label>
          <textarea
            id="inquiry-message"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Personaliza tu mensaje de consulta..."
            rows="4"
            className="message-textarea"
          />
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <div className="inquiry-actions">
          <button 
            onClick={onCancel} 
            className="cancel-btn"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            onClick={sendInquiry} 
            className="send-btn"
            disabled={isLoading}
          >
            {isLoading ? '⏳ Enviando...' : '📤 Enviar Consulta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityInquiry;
