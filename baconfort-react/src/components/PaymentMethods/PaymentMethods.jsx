import { useState } from 'react';
import './PaymentMethods.css';

function PaymentMethods({ reservation, onPaymentComplete, onCancel }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // SOLO EFECTIVO - Mercado Pago y otros métodos comentados
  const paymentMethods = [
    // MÉTODOS DIGITALES DESHABILITADOS
    /*
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      icon: '💳',
      description: 'Paga con tarjeta de crédito, débito o efectivo',
      fees: '3.5% + IVA',
      processingTime: 'Instantáneo'
    },
    {
      id: 'payoneer',
      name: 'Payoneer',
      icon: '🌐',
      description: 'Pagos internacionales seguros',
      fees: '2.9% + USD $0.30',
      processingTime: '1-3 días hábiles'
    },
    {
      id: 'bank_transfer',
      name: 'Transferencia Bancaria',
      icon: '🏦',
      description: 'Transferencia directa a cuenta bancaria',
      fees: 'Sin comisiones',
      processingTime: '24-48 horas'
    }
    */
    
    // MÉTODO ACTIVO: SOLO EFECTIVO
    {
      id: 'cash',
      name: 'Efectivo',
      icon: '💵',
      description: 'Paga en efectivo al momento del servicio',
      fees: 'Sin comisiones',
      processingTime: 'Al momento del servicio',
      active: true
    }
  ];

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    setError(null);
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Por favor selecciona un método de pago');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 PAYMENT: Iniciando pago con', selectedMethod);
      
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // PROCESAMIENTO SOLO PARA EFECTIVO
      switch (selectedMethod) {
        case 'cash':
          await processCashPayment(reservation);
          break;
        
        // MÉTODOS DIGITALES DESHABILITADOS
        /*
        case 'mercadopago':
          await processMercadoPagoPayment(reservation);
          break;
        case 'payoneer':
          await processPayoneerPayment(reservation);
          break;
        case 'bank_transfer':
          await processBankTransfer(reservation);
          break;
        */
        
        default:
          throw new Error('Método de pago no válido. Solo se acepta efectivo.');
      }

      // Respuesta para pago en efectivo
      const paymentResult = {
        success: true,
        paymentId: `CASH_${Date.now()}`,
        method: selectedMethod,
        amount: calculateTotal(reservation),
        currency: 'ARS',
        status: 'pending_cash', // Pendiente de pago en efectivo
        message: 'Reserva confirmada. Pago en efectivo al momento del servicio.'
      };

      console.log('✅ PAYMENT: Reserva confirmada para pago en efectivo:', paymentResult);
      onPaymentComplete(paymentResult);

    } catch (err) {
      console.error('❌ PAYMENT: Error procesando pago:', err);
      setError(err.message || 'Error procesando el pago');
    } finally {
      setLoading(false);
    }
  };

  // FUNCIÓN PARA PROCESAR PAGO EN EFECTIVO
  const processCashPayment = async (reservation) => {
    console.log('💵 EFECTIVO: Confirmando reserva para pago en efectivo...');
    
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      provider: 'cash',
      paymentId: `CASH_${Date.now()}`,
      status: 'confirmed',
      message: 'Reserva confirmada. Recuerda traer el dinero exacto.',
      instructions: [
        'Llega 10 minutos antes de tu cita',
        'Trae el dinero exacto',
        'Presenta tu confirmación de reserva'
      ]
    };
  };

  // MÉTODOS DE PAGO DIGITALES DESHABILITADOS
  /*
  const processMercadoPagoPayment = async (reservation) => {
    console.log('💳 MERCADO PAGO: Procesando pago...');
    // Aquí iría la integración real con Mercado Pago SDK
    return {
      provider: 'mercadopago',
      paymentId: `MP_${Date.now()}`,
      status: 'approved'
    };
  };

  const processPayoneerPayment = async (reservation) => {
    console.log('🌐 PAYONEER: Procesando pago...');
    // Aquí iría la integración real con Payoneer API
    return {
      provider: 'payoneer',
      paymentId: `PY_${Date.now()}`,
      status: 'approved'
    };
  };

  const processBankTransfer = async (reservation) => {
    console.log('🏦 BANK TRANSFER: Procesando transferencia...');
    return {
      provider: 'bank_transfer',
      paymentId: `BT_${Date.now()}`,
      status: 'pending'
    };
  };
  */

  const calculateTotal = (reservation) => {
    // Cálculo simple del total (aquí deberías implementar tu lógica de precios)
    const basePrice = 150000; // Precio base por noche en ARS
    const nights = Math.ceil((new Date(reservation.checkOut) - new Date(reservation.checkIn)) / (1000 * 60 * 60 * 24));
    const subtotal = basePrice * nights * reservation.guests;
    const taxes = subtotal * 0.21; // IVA 21%
    return subtotal + taxes;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  return (
    <div className="payment-methods" style={{
      position: 'relative',
      isolation: 'isolate'
    }}>
      <style>{`
        .payment-methods h4::before,
        .payment-methods h4::after,
        [data-no-duplicate]::before,
        [data-no-duplicate]::after {
          content: none !important;
          display: none !important;
        }
        [data-no-duplicate] {
          text-decoration: none !important;
          position: relative !important;
        }
      `}</style>
      <div className="payment-header">
        <h3>💳 Completar Pago</h3>
        <p>Selecciona tu método de pago preferido</p>
      </div>

      <div className="reservation-summary">
        <h4>📋 Resumen de Reserva</h4>
        <div className="summary-item">
          <span>Propiedad:</span>
          <span>{reservation.propertyName}</span>
        </div>
        <div className="summary-item">
          <span>Check-in:</span>
          <span>{new Date(reservation.checkIn).toLocaleDateString('es-ES')}</span>
        </div>
        <div className="summary-item">
          <span>Check-out:</span>
          <span>{new Date(reservation.checkOut).toLocaleDateString('es-ES')}</span>
        </div>
        <div className="summary-item">
          <span>Huéspedes:</span>
          <span>{reservation.guests}</span>
        </div>
        <div className="summary-item total">
          <span>Total a pagar:</span>
          <span>{formatCurrency(calculateTotal(reservation))}</span>
        </div>
      </div>

      <div className="payment-methods-grid">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`payment-method ${selectedMethod === method.id ? 'selected' : ''}`}
            onClick={() => handleMethodSelect(method.id)}
          >
            <div className="method-icon">{method.icon}</div>
            <div className="method-info">
              <h4 
                id={`payment-method-name-${method.id}`}
                style={{
                  position: 'relative',
                  textDecoration: 'none'
                }}
                data-no-duplicate="true"
              >
                {method.name}
              </h4>
              <p>{method.description}</p>
              <div className="method-details">
                <small>Comisión: {method.fees}</small>
                <small>Tiempo: {method.processingTime}</small>
              </div>
            </div>
            {selectedMethod === method.id && (
              <div className="selected-indicator">✓</div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="payment-error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="payment-actions">
        <button 
          onClick={onCancel}
          className="cancel-payment-btn"
          disabled={loading}
        >
          <i className="fas fa-times"></i>
          Cancelar
        </button>
        <button 
          onClick={handlePayment}
          className="confirm-payment-btn"
          disabled={!selectedMethod || loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Procesando...
            </>
          ) : (
            <>
              <i className="fas fa-credit-card"></i>
              Pagar {selectedMethod && formatCurrency(calculateTotal(reservation))}
            </>
          )}
        </button>
      </div>

      <div className="payment-security">
        <p>
          <i className="fas fa-shield-alt"></i>
          Tus datos están protegidos con encriptación SSL de 256 bits
        </p>
      </div>
    </div>
  );
}

export default PaymentMethods;
