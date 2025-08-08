// services/priceService.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5004/api';

/**
 * Servicio para manejar precios de propiedades
 */
export class PriceService {
  
  /**
   * Obtener precios de una propiedad específica
   * @param {string} propertyId - ID de la propiedad
   * @returns {Promise<Object>} Objeto con precios de la propiedad
   */
  static async getPropertyPrices(propertyId) {
    try {
      console.log(`💰 [PriceService] Obteniendo precios para propiedad: ${propertyId}`);
      
      // Intentar endpoint específico de precios primero
      let response = await fetch(`${API_URL}/properties/${propertyId}/prices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log(`⚠️ [PriceService] Endpoint de precios falló, probando endpoint general...`);
        
        // Si falla, intentar endpoint general
        response = await fetch(`${API_URL}/properties/${propertyId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (!response.ok) {
        throw new Error(`Error al obtener precios: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Manejar ambos formatos de respuesta
        const prices = data.data.prices || (data.data.id ? data.data.prices : null);
        
        if (prices) {
          console.log(`✅ [PriceService] Precios obtenidos:`, prices);
          return {
            success: true,
            prices: prices
          };
        }
      }
      
      throw new Error('Formato de respuesta inválido o precios no encontrados');

    } catch (error) {
      console.error('❌ [PriceService] Error obteniendo precios:', error);
      
      // Retornar precios por defecto en caso de error
      return {
        success: false,
        error: error.message,
        prices: this.getDefaultPrices()
      };
    }
  }

  /**
   * Calcular precio total para una estadía
   * @param {Object} prices - Precios de la propiedad
   * @param {string} checkIn - Fecha de check-in
   * @param {string} checkOut - Fecha de check-out
   * @returns {Object} Cálculo detallado del precio
   */
  static calculateStayPrice(prices, checkIn, checkOut) {
    try {
      if (!prices || !checkIn || !checkOut) {
        throw new Error('Faltan datos para calcular el precio');
      }

      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (nights <= 0) {
        throw new Error('Las fechas no son válidas');
      }

      // Extraer precios numéricos
      const dailyPrice = this.extractNumericPrice(prices.daily);
      const weeklyPrice = this.extractNumericPrice(prices.weekly);
      const monthlyPrice = this.extractNumericPrice(prices.monthly);

      let totalPrice = 0;
      let breakdown = {};
      let appliedRate = 'daily';

      // Lógica de precios por duración
      if (nights >= 30 && monthlyPrice > 0) {
        // Precio mensual
        const months = Math.floor(nights / 30);
        const remainingDays = nights % 30;
        
        totalPrice = months * monthlyPrice;
        breakdown.months = { count: months, rate: monthlyPrice, subtotal: months * monthlyPrice };
        
        if (remainingDays > 0) {
          if (remainingDays >= 7 && weeklyPrice > 0) {
            const weeks = Math.floor(remainingDays / 7);
            const extraDays = remainingDays % 7;
            
            if (weeks > 0) {
              totalPrice += weeks * weeklyPrice;
              breakdown.weeks = { count: weeks, rate: weeklyPrice, subtotal: weeks * weeklyPrice };
            }
            
            if (extraDays > 0) {
              totalPrice += extraDays * dailyPrice;
              breakdown.days = { count: extraDays, rate: dailyPrice, subtotal: extraDays * dailyPrice };
            }
          } else {
            totalPrice += remainingDays * dailyPrice;
            breakdown.days = { count: remainingDays, rate: dailyPrice, subtotal: remainingDays * dailyPrice };
          }
        }
        
        appliedRate = 'monthly';

      } else if (nights >= 7 && weeklyPrice > 0) {
        // Precio semanal
        const weeks = Math.floor(nights / 7);
        const remainingDays = nights % 7;
        
        totalPrice = weeks * weeklyPrice + remainingDays * dailyPrice;
        breakdown.weeks = { count: weeks, rate: weeklyPrice, subtotal: weeks * weeklyPrice };
        
        if (remainingDays > 0) {
          breakdown.days = { count: remainingDays, rate: dailyPrice, subtotal: remainingDays * dailyPrice };
        }
        
        appliedRate = 'weekly';

      } else {
        // Precio diario
        totalPrice = nights * dailyPrice;
        breakdown.days = { count: nights, rate: dailyPrice, subtotal: totalPrice };
        appliedRate = 'daily';
      }

      return {
        success: true,
        totalPrice: Math.round(totalPrice * 100) / 100,
        nights,
        appliedRate,
        breakdown,
        currency: prices.currency || 'USD',
        pricePerNight: Math.round((totalPrice / nights) * 100) / 100
      };

    } catch (error) {
      console.error('Error calculando precio de estadía:', error);
      return {
        success: false,
        error: error.message,
        totalPrice: 0,
        nights: 0,
        appliedRate: 'daily',
        breakdown: {},
        currency: 'USD'
      };
    }
  }

  /**
   * Extraer precio numérico de string o número
   * @param {string|number} priceValue
   * @returns {number}
   */
  static extractNumericPrice(priceValue) {
    if (typeof priceValue === 'number') {
      return priceValue;
    }
    
    if (typeof priceValue === 'string') {
      const numericValue = priceValue.replace(/[^\d.]/g, '');
      const parsed = parseFloat(numericValue);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  }

  /**
   * Obtener precios por defecto cuando no se pueden cargar
   * @returns {Object}
   */
  static getDefaultPrices() {
    return {
      daily: 70,
      weekly: 320,
      monthly: 1200,
      currency: 'USD'
    };
  }

  /**
   * Formatear precio para mostrar
   * @param {number} price - Precio numérico
   * @param {string} currency - Moneda
   * @returns {string}
   */
  static formatPrice(price, currency = 'USD') {
    return `${currency} ${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
}

export default PriceService;
