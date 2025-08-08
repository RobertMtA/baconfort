import { useState, useEffect } from 'react';
import PaymentService from '../../services/paymentService';
import MercadoPagoPayment from './MercadoPagoPayment';
import CashPayment from './CashPayment';
import './PaymentMethodSelector.css';
import '../../styles/anti-duplication.css';

const PaymentMethodSelector = ({ 
  reservationData, 
  onPaymentSuccess, 
  onPaymentError,
  onCancel 
}) => {
  const [availableMethods, setAvailableMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [userCountry, setUserCountry] = useState('US');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const country = await PaymentService.detectUserCountry();
        setUserCountry(country);
        
        const methods = await PaymentService.getAvailablePaymentMethods(country);
        setAvailableMethods(methods);
      } catch (err) {
        console.error('Error al cargar métodos de pago:', err);
        setError('No pudimos cargar los métodos de pago. Por favor intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleBackToSelection = () => {
    setSelectedMethod(null);
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <div className="spinner"></div>
        <p>Cargando métodos de pago...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (selectedMethod) {
    return (
      <div className="payment-processor">
        <div className="payment-header">
          <button 
            className="back-button"
            onClick={handleBackToSelection}
            type="button"
            aria-label="Volver a selección de métodos de pago"
          >
            ← Cambiar método
          </button>
        </div>

        {selectedMethod.id === 'mercadopago' && (
          <MercadoPagoPayment
            reservationData={reservationData}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
            onCancel={handleBackToSelection}
          />
        )}

        {(selectedMethod.id === 'cash' || selectedMethod.id === 'efectivo') && (
          <CashPayment
            reservationData={reservationData}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
            onCancel={handleBackToSelection}
          />
        )}
      </div>
    );
  }

  return (
    <div className="payment-method-selector">
      <style>{`
        /* Reglas específicas solo para elementos de pago - no afectar iconos globales */
        .payment-method-selector .method-header h3::before,
        .payment-method-selector .method-header h3::after,
        .payment-method-selector [data-no-duplicate]::before,
        .payment-method-selector [data-no-duplicate]::after {
          content: none !important;
          display: none !important;
          visibility: hidden !important;
        }
        .payment-method-selector [data-no-duplicate] {
          text-decoration: none !important;
          position: relative !important;
        }
        .payment-method-selector .method-header {
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
        }
        .payment-method-selector .method-header h3 {
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1 !important;
        }
      `}</style>
      <div className="payment-header">
        <h1>Completar Pago</h1>
        <div className="reservation-info">
          <p><strong>Reserva #{reservationData.id}</strong></p>
          <p>📅 Fecha de reserva: {new Date(reservationData.bookingDate).toLocaleDateString('es-ES')}</p>
          <p>🏠 Propiedad: {reservationData.propertyName}</p>
          <p>💰 Total a pagar: USD ${reservationData.total ? reservationData.total.toFixed(2) : 'A confirmar'}</p>
        </div>
      </div>

      <div className="reservation-summary">
        <h2>📋 Resumen de tu reserva</h2>
        <div className="summary-details">
          <div className="summary-row">
            <span><strong>Ubicación:</strong></span>
            <span>{reservationData.propertyAddress || reservationData.propertyName}</span>
          </div>
          <div className="summary-row">
            <span><strong>Importe total:</strong></span>
            <span>USD ${reservationData.totalAmount ? reservationData.totalAmount.toFixed(2) : (reservationData.total ? reservationData.total.toFixed(2) : 'A confirmar')}</span>
          </div>
          <div className="summary-row">
            <span><strong>Fecha de entrada:</strong></span>
            <span>{new Date(reservationData.checkIn).toLocaleDateString('es-ES')}</span>
          </div>
          <div className="summary-row">
            <span><strong>Depósito requerido:</strong></span>
            <span>USD ${reservationData.deposit ? reservationData.deposit.toFixed(2) : 'No requerido'}</span>
          </div>
        </div>
      </div>

      <div className="payment-methods-section">
        <h2>💳 Selecciona tu método de pago</h2>
        
        {availableMethods.length > 0 ? (
          availableMethods.map((method) => (
            <div key={method.id} className="payment-method-option">
              <button
                className={`payment-method-card ${method.id === 'cash' || method.id === 'efectivo' ? 'payment-method-cash' : ''}`}
                onClick={() => handleMethodSelect(method)}
                type="button"
                aria-label={`Seleccionar método de pago: ${method.name}`}
              >
                <div className="method-header">
                  <div className="method-icon-container">
                    {method.icon ? (
                      <img src={method.icon} alt={method.name} className="method-icon" />
                    ) : (
                      <div className="method-icon-fallback">
                        {method.id === 'cash' ? '💵' : 
                         method.id === 'efectivo' ? '💵' : 
                         method.id === 'mercadopago' ? '💳' : '💰'}
                      </div>
                    )}
                  </div>
                  <h3 
                    style={{
                      position: 'relative',
                      textDecoration: 'none'
                    }}
                    data-no-duplicate="true"
                  >
                    {method.name}
                  </h3>
                </div>
                <p className="method-description">{method.description}</p>
                <ul className="method-features">
                  {method.features.map((feature, index) => (
                    <li key={index}>✅ {feature}</li>
                  ))}
                </ul>
                <div className="select-method">
                  <span>Seleccionar</span> →
                </div>
              </button>
            </div>
          ))
        ) : (
          <div className="no-methods">
            <p>No hay métodos de pago disponibles para tu región.</p>
          </div>
        )}
      </div>

      <div className="payment-security">
        <h2>🔒 Seguridad de pagos</h2>
        <p>Todos los pagos están protegidos con:</p>
        <ul className="security-features">
          <li>• Encriptación SSL de 256-bit</li>
          <li>• Protección contra fraude</li>
          <li>• Política de reembolso</li>
        </ul>
      </div>

      <div className="payment-actions">
        <button className="cancel-btn" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;