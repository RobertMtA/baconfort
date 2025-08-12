/**
 * paymentDefaults.js
 * Este archivo contiene configuraciones por defecto para el sistema de pagos
 * 
 * La configuración actual establece el pago en efectivo como método de pago único
 * para todas las reservas, según lo definido en los requisitos de negocio.
 */

// Método de pago por defecto
const DEFAULT_PAYMENT_METHOD = 'efectivo';

// Precio base para cálculos automáticos (ajustar según necesidad)
const DEFAULT_BASE_PRICE = 10000; // $10,000 ARS por noche

// Configuración para crear información de pago en efectivo
const createCashPaymentInfo = (amount, currency = 'ARS') => {
  return {
    provider: 'efectivo',
    amount: amount,
    currency: currency || 'ARS',
    paymentMethod: 'efectivo',
    paymentStatus: 'pending'
  };
};

// Validar si un pago debe procesarse a través del sistema en efectivo
const shouldUseCashPayment = () => {
  return true; // Siempre retorna true ya que todos los pagos deben ser en efectivo
};

/**
 * Calcula o completa la información de precio basada en fechas si no está definida
 * @param {Object} priceInfo - Información de precio existente (opcional)
 * @param {Date|string} checkIn - Fecha de check-in
 * @param {Date|string} checkOut - Fecha de check-out
 * @param {string} [currency='ARS'] - Moneda (ARS por defecto)
 * @returns {Object} Información de precio completa
 */
const calculatePriceInfo = (priceInfo, checkIn, checkOut, currency = 'ARS') => {
  // Si ya existe información de precio completa, devolverla
  if (priceInfo && priceInfo.totalAmount > 0 && priceInfo.nights > 0) {
    return priceInfo;
  }
  
  try {
    // Convertir fechas a objetos Date si son strings
    const checkInDate = checkIn instanceof Date ? checkIn : new Date(checkIn);
    const checkOutDate = checkOut instanceof Date ? checkOut : new Date(checkOut);
    
    // Validar que las fechas sean válidas
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      console.warn('⚠️ calculatePriceInfo: Fechas inválidas para el cálculo de precio');
      return priceInfo || { totalAmount: 0, currency };
    }
    
    // Calcular número de noches
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Si el número de noches es inválido, devolver información predeterminada
    if (nights <= 0) {
      console.warn('⚠️ calculatePriceInfo: Número de noches inválido:', nights);
      return priceInfo || { totalAmount: 0, currency };
    }
    
    // Calcular precio total
    const totalAmount = nights * DEFAULT_BASE_PRICE;
    
    console.log(`✅ calculatePriceInfo: Calculado precio para ${nights} noches: ${currency} ${totalAmount}`);
    
    // Crear objeto de información de precio
    return {
      ...priceInfo,
      totalAmount,
      currency,
      nights,
      pricePerNight: DEFAULT_BASE_PRICE
    };
  } catch (error) {
    console.error('❌ Error calculando información de precio:', error);
    return priceInfo || { totalAmount: 0, currency };
  }
};

module.exports = {
  DEFAULT_PAYMENT_METHOD,
  createCashPaymentInfo,
  shouldUseCashPayment,
  calculatePriceInfo
};
