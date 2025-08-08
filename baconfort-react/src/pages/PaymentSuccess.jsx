import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Obtener información del pago desde URL params (MercadoPago)
        const collection_status = searchParams.get('collection_status');
        const payment_id = searchParams.get('payment_id');
        const external_reference = searchParams.get('external_reference');

        // Solo procesamos pagos de MercadoPago a través de URL params
        if (collection_status === 'approved' && payment_id && external_reference) {
          // MercadoPago payment success handling
          console.log('✅ Pago exitoso con MercadoPago');
          setPaymentInfo({
            provider: 'mercadopago',
            paymentId: payment_id,
            amount: 'Confirmado',
            currency: 'USD'
          });
        } else if (searchParams.get('cash') === 'confirmed') {
          // Cash payment confirmation
          console.log('✅ Pago en efectivo confirmado');
          setPaymentInfo({
            provider: 'efectivo',
            method: 'cash',
            amount: searchParams.get('amount') || 'A confirmar',
            currency: searchParams.get('currency') || 'USD'
          });
        }
      } catch (error) {
        console.error('Error procesando pago exitoso:', error);
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [searchParams]);

  const handleGoToReservations = () => {
    navigate('/my-reservations');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="payment-result-container">
        <div className="payment-result-card">
          <div className="loading-spinner"></div>
          <h2>Procesando pago...</h2>
          <p>Verificando el estado de tu pago</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-container">
      <div className="payment-result-card success">
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        
        <h1>¡Reserva Confirmada!</h1>
        <p className="success-message">
          {paymentInfo?.provider === 'efectivo' 
            ? 'Tu reserva ha sido confirmada. Pagarás en efectivo al momento del check-in.'
            : 'Tu pago ha sido procesado correctamente con MercadoPago'
          }
        </p>

        {paymentInfo && (
          <div className="payment-details">
            <h3>Detalles del Pago</h3>
            <div className="detail-row">
              <span>Método de pago:</span>
              <span>{paymentInfo.provider === 'efectivo' ? 'Pago en Efectivo' : 'MercadoPago'}</span>
            </div>
            <div className="detail-row">
              <span>Monto:</span>
              <span>${paymentInfo.amount} {paymentInfo.currency}</span>
            </div>
            <div className="detail-row">
              <span>Método:</span>
              <span>{paymentInfo.paymentMethod}</span>
            </div>
            <div className="detail-row">
              <span>ID de Sesión:</span>
              <span>{paymentInfo.sessionId}</span>
            </div>
          </div>
        )}

        <div className="success-actions">
          <button 
            onClick={handleGoToReservations}
            className="btn btn-primary"
          >
            <i className="fas fa-calendar-check"></i>
            Ver Mis Reservas
          </button>
          <button 
            onClick={handleGoHome}
            className="btn btn-secondary"
          >
            <i className="fas fa-home"></i>
            Ir al Inicio
          </button>
        </div>

        <div className="success-note">
          <i className="fas fa-info-circle"></i>
          <p>
            Recibirás un email de confirmación con los detalles de tu reserva y pago.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
