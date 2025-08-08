import { useState } from 'react';
import './CashPayment.css';

const CashPayment = ({ 
  reservationData, 
  onPaymentSuccess, 
  onPaymentError, 
  onCancel 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    preferredCurrency: 'USD',
    notes: ''
  });

  const handleCashPaymentConfirm = async () => {
    setIsProcessing(true);
    
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Información del "pago" en efectivo
      const cashPaymentInfo = {
        provider: 'efectivo',
        method: 'cash',
        currency: paymentDetails.preferredCurrency,
        amount: reservationData.total || reservationData.totalAmount,
        status: 'pending_cash_payment',
        confirmedAt: new Date().toISOString(),
        notes: paymentDetails.notes,
        instructions: `Pago en efectivo confirmado. El cliente pagará ${paymentDetails.preferredCurrency} $${reservationData.total || reservationData.totalAmount} al momento del check-in.`
      };

      console.log('💰 Pago en efectivo confirmado:', cashPaymentInfo);
      
      onPaymentSuccess(cashPaymentInfo);
      
    } catch (error) {
      console.error('❌ Error confirmando pago en efectivo:', error);
      onPaymentError({
        error: 'Error al procesar la confirmación de pago en efectivo',
        details: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="cash-payment-container">
      <style>{`
        .cash-payment-container h2::before,
        .cash-payment-container h2::after,
        .cash-payment-container h3::before,
        .cash-payment-container h3::after,
        .cash-payment-container [data-no-duplicate]::before,
        .cash-payment-container [data-no-duplicate]::after {
          content: none !important;
          display: none !important;
        }
        .cash-payment-container [data-no-duplicate] {
          text-decoration: none !important;
          position: relative !important;
        }
      `}</style>
      <div className="cash-payment-header">
        <button className="back-button" onClick={onCancel}>
          ← Volver a métodos de pago
        </button>
        <h2 
          style={{
            position: 'relative',
            textDecoration: 'none'
          }}
          data-no-duplicate="true"
        >
          💰 Efectivo
        </h2>
      </div>

      <div className="cash-payment-content">
        <div className="cash-info-card">
          <div className="cash-icon">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <h3 
            style={{
              position: 'relative',
              textDecoration: 'none'
            }}
            data-no-duplicate="true"
          >
            ¿Cómo funciona el pago en efectivo?
          </h3>
          <ul className="cash-instructions">
            <li>✅ Confirma tu reserva ahora sin pagar online</li>
            <li>💵 Pagarás en efectivo al momento del check-in</li>
            <li>🏠 El anfitrión te estará esperando en la propiedad</li>
            <li>📋 Recibirás toda la información por email</li>
          </ul>
        </div>

        <div className="payment-summary">
          <h3 
            style={{
              position: 'relative',
              textDecoration: 'none'
            }}
            data-no-duplicate="true"
          >
            📋 Resumen de tu reserva
          </h3>
          <div className="summary-details">
            <div className="summary-row">
              <span>Propiedad:</span>
              <span>{reservationData.propertyName || 'Propiedad seleccionada'}</span>
            </div>
            <div className="summary-row">
              <span>Check-in:</span>
              <span>{new Date(reservationData.checkIn).toLocaleDateString('es-ES')}</span>
            </div>
            <div className="summary-row">
              <span>Check-out:</span>
              <span>{new Date(reservationData.checkOut).toLocaleDateString('es-ES')}</span>
            </div>
            <div className="summary-row">
              <span>Huéspedes:</span>
              <span>{reservationData.guests}</span>
            </div>
            <div className="summary-row total">
              <span><strong>Total a pagar en efectivo:</strong></span>
              <span><strong>USD ${(() => {
                const total = reservationData.total || reservationData.totalAmount || reservationData.amount || reservationData.price || 0;
                console.log('🔍 CashPayment - Datos de reserva para total:', {
                  total: reservationData.total,
                  totalAmount: reservationData.totalAmount,
                  amount: reservationData.amount,
                  price: reservationData.price,
                  finalTotal: total,
                  reservationData: reservationData
                });
                return total.toFixed ? total.toFixed(2) : Number(total).toFixed(2);
              })()}</strong></span>
            </div>
          </div>
        </div>

        <div className="cash-payment-options">
          <h3 
            style={{
              position: 'relative',
              textDecoration: 'none'
            }}
            data-no-duplicate="true"
          >
            💱 Opciones de pago
          </h3>
          <div className="currency-selector">
            <label>
              <input
                type="radio"
                name="currency"
                value="USD"
                checked={paymentDetails.preferredCurrency === 'USD'}
                onChange={(e) => setPaymentDetails({...paymentDetails, preferredCurrency: e.target.value})}
              />
              <span className="currency-option">
                <strong>Dólares USD</strong>
                <small>Importe exacto en dólares americanos</small>
              </span>
            </label>
          </div>
          
          <div className="notes-section">
            <label htmlFor="payment-notes">
              <strong>Notas adicionales (opcional):</strong>
            </label>
            <textarea
              id="payment-notes"
              placeholder="Ej: Necesito cambio para $100, prefiero billetes pequeños, etc."
              value={paymentDetails.notes}
              onChange={(e) => setPaymentDetails({...paymentDetails, notes: e.target.value})}
              rows="3"
            />
          </div>
        </div>

        <div className="cash-payment-warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <strong>Importante:</strong>
            <p>La seña correspondiente deberá ser abonada para validar la reserva.</p>
          </div>
        </div>

        <div className="cash-payment-actions">
          <button 
            className="cancel-cash-btn" 
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancelar
          </button>
          <button 
            className="confirm-cash-btn" 
            onClick={handleCashPaymentConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="loading-spinner"></div>
                Confirmando...
              </>
            ) : (
              <>
                💰 Confirmar Pago en Efectivo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashPayment;
