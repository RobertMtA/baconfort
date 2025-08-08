import { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import PaymentService from '../../services/paymentService';
import './MercadoPagoPayment.css';

const MercadoPagoPayment = ({ 
  reservationData, 
  onPaymentSuccess, 
  onPaymentError, 
  onCancel 
}) => {
  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWallet, setShowWallet] = useState(false);

  useEffect(() => {
    // Inicializar Mercado Pago con la public key
    const initPayment = async () => {
      try {
        // Inicializar SDK de MercadoPago
        initMercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || 'TEST-4b4b4b4b-4b4b-4b4b-4b4b-4b4b4b4b4b4b');
        
        // Crear preferencia de pago
        const preference = await PaymentService.createMercadoPagoPreference(reservationData);
        
        console.log('🔍 Respuesta completa del backend:', preference);
        
        if (preference && preference.preferenceId) {
          setPreferenceId(preference.preferenceId);
          setShowWallet(true);
          console.log('✅ Preferencia de Mercado Pago creada:', preference.preferenceId);
          console.log('🔗 Init Point disponible:', preference.initPoint);
          
          // Si el Wallet no funciona, podemos usar redirección directa
          window.mercadoPagoInitPoint = preference.initPoint;
        } else {
          console.error('❌ Estructura de respuesta inválida:', preference);
          throw new Error('No se pudo crear la preferencia de pago');
        }
      } catch (err) {
        console.error('❌ Error al crear preferencia de Mercado Pago:', err);
        setError(err.message);
        onPaymentError(err);
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [reservationData, onPaymentError]);

  const handlePaymentSuccess = (paymentData) => {
    console.log('✅ Pago exitoso con Mercado Pago:', paymentData);
    
    // Verificar si tenemos datos del pago
    if (paymentData && typeof paymentData === 'object') {
      onPaymentSuccess({
        provider: 'mercadopago',
        paymentId: paymentData.payment_id || paymentData.id || 'mp_success',
        status: paymentData.status || 'approved',
        preferenceId: preferenceId,
        amount: reservationData.amount,
        currency: reservationData.currency,
        ...paymentData
      });
    } else {
      // Si no tenemos datos específicos, pero el pago fue exitoso
      console.log('⚠️ Pago exitoso pero sin datos específicos');
      onPaymentSuccess({
        provider: 'mercadopago',
        paymentId: 'mp_success_' + Date.now(),
        status: 'approved',
        preferenceId: preferenceId,
        amount: reservationData.amount,
        currency: reservationData.currency
      });
    }
  };

  const handlePaymentFailure = (paymentError) => {
    console.error('❌ Error en el pago de Mercado Pago:', paymentError);
    setError('El pago no pudo ser procesado. Por favor, intenta nuevamente.');
    onPaymentError(paymentError);
  };

  const retryPayment = () => {
    setError(null);
    setLoading(true);
    window.location.reload(); // Reiniciar el proceso
  };

  if (loading) {
    return (
      <div className="mercadopago-loading">
        <div className="mp-spinner"></div>
        <h4>Preparando tu pago...</h4>
        <p>Conectando con Mercado Pago de forma segura</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mercadopago-error">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h4>Ups! Algo salió mal</h4>
        <p>{error}</p>
        <div className="error-actions">
          <button 
            className="retry-button"
            onClick={retryPayment}
          >
            <i className="fas fa-redo"></i>
            Intentar nuevamente
          </button>
          <button 
            className="cancel-button"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mercadopago-payment">
      <div className="payment-info">
        <div className="mp-header">
          <img 
            src="https://http2.mlstatic.com/storage/logos-api-admin/51b446b0-571c-11e8-9a2d-4b2bd7b1bf77-xl@2x.png" 
            alt="Mercado Pago"
            className="mp-logo"
          />
        </div>

        <div className="payment-features">
          <div className="feature">
            <i className="fas fa-shield-alt"></i>
            <span>Protección al comprador</span>
          </div>
          <div className="feature">
            <i className="fas fa-credit-card"></i>
            <span>Todos los métodos de pago</span>
          </div>
          <div className="feature">
            <i className="fas fa-clock"></i>
            <span>Confirmación inmediata</span>
          </div>
        </div>

        <div className="payment-summary">
          <h5>💰 Total a pagar</h5>
          <div className="amount">
            {reservationData.currency || 'ARS'} ${reservationData.amount || '0'}
          </div>
          <p className="amount-description">
            Reserva de {reservationData.nights || 1} noche(s) en {reservationData.propertyName}
          </p>
        </div>
      </div>

      {showWallet && preferenceId && (
        <div className="wallet-container">
          <Wallet
            initialization={{
              preferenceId: preferenceId,
              redirectMode: 'self'
            }}
            customization={{
              texts: {
                valueProp: 'smart_option'
              },
              visual: {
                buttonBackground: 'default',
                borderRadius: '8px'
              }
            }}
            onSubmit={handlePaymentSuccess}
            onError={handlePaymentFailure}
            onReady={() => {
              console.log('✅ Wallet de Mercado Pago listo');
            }}
          />
        </div>
      )}

      {/* Botón de respaldo para redirección directa */}
      {showWallet && preferenceId && window.mercadoPagoInitPoint && (
        <div className="direct-payment-option">
          <p style={{textAlign: 'center', margin: '10px 0', fontSize: '14px', color: '#666'}}>
            ¿Problemas con el botón de pago?
          </p>
          <button 
            className="direct-payment-button"
            onClick={() => {
              console.log('🔗 Redirigiendo directamente a MercadoPago');
              window.open(window.mercadoPagoInitPoint, '_blank');
            }}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: '#009ee3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            🔗 Abrir Checkout en Nueva Ventana
          </button>
        </div>
      )}

      <div className="payment-help">
        <h6>💡 ¿Necesitas ayuda?</h6>
        <div className="help-links">
          <a 
            href="https://www.mercadopago.com.ar/ayuda" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Centro de ayuda
          </a>
          <span>•</span>
          <a 
            href="https://www.mercadopago.com.ar/ayuda/terminos-y-condiciones_299" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Términos y condiciones
          </a>
        </div>
      </div>

      <div className="payment-security-info">
        <div className="security-text">
          <i className="fas fa-lock"></i>
          <span>Tus datos están protegidos con encriptación de nivel bancario</span>
        </div>
      </div>
    </div>
  );
};

export default MercadoPagoPayment;
