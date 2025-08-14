/**
 * priceCalculator.js
 * Sistema unificado de cálculo de precios por propiedad
 */

// Precios por propiedad basados en seedDatabase.js
const PROPERTY_PRICES = {
  'moldes-1680': {
    daily: 65,
    weekly: 350,
    monthly: 1100,
    currency: 'USD'
  },
  'moldes1680': {
    daily: 65,
    weekly: 350,
    monthly: 1100,
    currency: 'USD'
  },
  'ugarteche-2824': {
    daily: 60,
    weekly: 400,
    monthly: 1500,
    currency: 'USD'
  },
  'ugarteche2824': {
    daily: 60,
    weekly: 400,
    monthly: 1500,
    currency: 'USD'
  },
  'santa-fe-3770': {
    daily: 75,
    weekly: 420,
    monthly: 1300,
    currency: 'USD'
  },
  'santafe3770': {
    daily: 75,
    weekly: 420,
    monthly: 1300,
    currency: 'USD'
  },
  'dorrego-1548': {
    daily: 70,
    weekly: 380,
    monthly: 1150,
    currency: 'USD'
  },
  'dorrego1548': {
    daily: 70,
    weekly: 380,
    monthly: 1150,
    currency: 'USD'
  },
  'convencion-1994': {
    daily: 70,
    weekly: 400,
    monthly: 1200,
    currency: 'USD'
  },
  'convencion1994': {
    daily: 70,
    weekly: 400,
    monthly: 1200,
    currency: 'USD'
  }
};

// Función para normalizar ID de propiedad
const normalizePropertyId = (propertyId) => {
  if (!propertyId) return null;
  
  // Remover espacios y convertir a minúsculas
  let normalized = propertyId.toString().toLowerCase().trim();
  
  // Remover caracteres especiales excepto guiones
  normalized = normalized.replace(/[^a-z0-9\-]/g, '');
  
  return normalized;
};

/**
 * Calcula el precio total basado en la propiedad y las fechas
 * @param {string} propertyId - ID de la propiedad
 * @param {Date|string} checkIn - Fecha de check-in
 * @param {Date|string} checkOut - Fecha de check-out
 * @param {Object} options - Opciones adicionales
 * @returns {Object} Información de precio calculada
 */
const calculatePriceByProperty = (propertyId, checkIn, checkOut, options = {}) => {
  try {
    console.log('🧮 PRICE CALCULATOR: Iniciando cálculo para:', { propertyId, checkIn, checkOut });
    
    // Normalizar ID de propiedad
    const normalizedPropertyId = normalizePropertyId(propertyId);
    console.log('🔍 PRICE CALCULATOR: ID normalizado:', normalizedPropertyId);
    
    // Obtener precios de la propiedad
    const propertyPrices = PROPERTY_PRICES[normalizedPropertyId];
    
    if (!propertyPrices) {
      console.warn('⚠️ PRICE CALCULATOR: Propiedad no encontrada, usando precios por defecto');
      const fallbackPrices = {
        daily: 50,
        weekly: 300,
        monthly: 1200,
        currency: 'USD'
      };
      return calculateWithPrices(fallbackPrices, checkIn, checkOut, options);
    }
    
    console.log('✅ PRICE CALCULATOR: Precios encontrados:', propertyPrices);
    return calculateWithPrices(propertyPrices, checkIn, checkOut, options);
    
  } catch (error) {
    console.error('❌ PRICE CALCULATOR: Error:', error);
    return {
      totalAmount: 0,
      currency: 'USD',
      nights: 0,
      breakdown: {},
      error: error.message
    };
  }
};

/**
 * Calcula el precio usando los precios de una propiedad específica
 */
const calculateWithPrices = (prices, checkIn, checkOut, options = {}) => {
  try {
    // Convertir fechas
    const checkInDate = checkIn instanceof Date ? checkIn : new Date(checkIn);
    const checkOutDate = checkOut instanceof Date ? checkOut : new Date(checkOut);
    
    // Validar fechas
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new Error('Fechas inválidas');
    }
    
    // Calcular noches
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
      throw new Error('Número de noches inválido');
    }
    
    console.log('📅 PRICE CALCULATOR: Noches calculadas:', nights);
    
    // Determinar tipo de tarifa y calcular
    let breakdown = {};
    let totalAmount = 0;
    
    if (nights >= 30) {
      // Tarifa mensual
      const months = Math.floor(nights / 30);
      const remainingDays = nights % 30;
      
      totalAmount = (months * prices.monthly) + (remainingDays * prices.daily);
      breakdown = {
        type: 'monthly',
        months: months,
        monthlyPrice: prices.monthly,
        monthlyTotal: months * prices.monthly,
        extraDays: remainingDays,
        dailyPrice: prices.daily,
        extraDaysTotal: remainingDays * prices.daily
      };
      
    } else if (nights >= 7) {
      // Tarifa semanal
      const weeks = Math.floor(nights / 7);
      const remainingDays = nights % 7;
      
      totalAmount = (weeks * prices.weekly) + (remainingDays * prices.daily);
      breakdown = {
        type: 'weekly',
        weeks: weeks,
        weeklyPrice: prices.weekly,
        weeklyTotal: weeks * prices.weekly,
        extraDays: remainingDays,
        dailyPrice: prices.daily,
        extraDaysTotal: remainingDays * prices.daily
      };
      
    } else {
      // Tarifa diaria
      totalAmount = nights * prices.daily;
      breakdown = {
        type: 'daily',
        nights: nights,
        dailyPrice: prices.daily,
        dailyTotal: totalAmount
      };
    }
    
    const result = {
      totalAmount: totalAmount,
      currency: prices.currency,
      nights: nights,
      breakdown: breakdown,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      propertyPrices: prices
    };
    
    console.log('✅ PRICE CALCULATOR: Resultado final:', result);
    return result;
    
  } catch (error) {
    console.error('❌ PRICE CALCULATOR: Error en cálculo:', error);
    throw error;
  }
};

/**
 * Formatea un precio para mostrar
 */
const formatPrice = (amount, currency = 'USD') => {
  const symbol = currency === 'USD' ? 'US$' : '$';
  return `${symbol}${Number(amount).toLocaleString('es-AR')}`;
};

/**
 * Calcula el depósito (30% del total)
 */
const calculateDeposit = (totalAmount) => {
  return Math.round(totalAmount * 0.3);
};

module.exports = {
  calculatePriceByProperty,
  calculateWithPrices,
  formatPrice,
  calculateDeposit,
  PROPERTY_PRICES,
  normalizePropertyId
};
