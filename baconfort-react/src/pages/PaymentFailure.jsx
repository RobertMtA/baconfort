import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentFailure.css';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  useEffect(() => {
    // Obtener información del error desde URL params
    const error_message = searchParams.get('error_message');
    const error_code = searchParams.get('error_code');

    if (error_message || error_code) {
      setErrorDetails({ message: error_message, code: error_code });
    }
  }, [searchParams]);

  const handleRetryPayment = () => {
    // Mantener la información del pago para retry
    navigate('/my-reservations');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    const email = 'soporte@baconfort.com';
    const subject = encodeURIComponent('Error en Pago - Ayuda Requerida');
    const body = encodeURIComponent(`
Hola, tuve un problema con mi pago en MercadoPago.

Detalles del error:
- Código: ${errorDetails?.code || 'No disponible'}
- Mensaje: ${errorDetails?.message || 'Error desconocido'}

Por favor, ayúdenme a completar mi reserva.

Gracias.
    `);

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="payment-result-container">
      <div className="payment-result-card failure">
        <div className="failure-icon">
          <i className="fas fa-times-circle"></i>
        </div>
        
        <h1>Pago No Completado</h1>
        <p className="failure-message">
          Hubo un problema al procesar tu pago con MercadoPago
        </p>

        {errorDetails && (
          <div className="error-details">
            <h3>Detalles del Error</h3>
            {errorDetails.code && (
              <div className="detail-row">
                <span>Código de Error:</span>
                <span>{errorDetails.code}</span>
              </div>
            )}
            {errorDetails.message && (
              <div className="detail-row">
                <span>Mensaje:</span>
                <span>{errorDetails.message}</span>
              </div>
            )}
          </div>
        )}

        {paymentInfo && (
          <div className="payment-details">
            <h3>Información del Pago</h3>
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

        <div className="failure-actions">
          <button 
            onClick={handleRetryPayment}
            className="btn btn-primary"
          >
            <i className="fas fa-redo"></i>
            Intentar Nuevamente
          </button>
          <button 
            onClick={handleContactSupport}
            className="btn btn-warning"
          >
            <i className="fas fa-envelope"></i>
            Contactar Soporte
          </button>
          <button 
            onClick={handleGoHome}
            className="btn btn-secondary"
          >
            <i className="fas fa-home"></i>
            Ir al Inicio
          </button>
        </div>

        <div className="failure-note">
          <h4>¿Qué puedes hacer?</h4>
          <ul>
            <li>Verificar que tus datos de pago sean correctos</li>
            <li>Asegurarte de tener fondos suficientes en tu cuenta</li>
            <li>Intentar con un método de pago diferente</li>
            <li>Contactar a tu banco si el problema persiste</li>
          </ul>
        </div>

        <div className="failure-support">
          <i className="fas fa-phone"></i>
          <p>
            Si necesitas ayuda inmediata, contáctanos al: 
            <strong> +54 11 1234-5678</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
