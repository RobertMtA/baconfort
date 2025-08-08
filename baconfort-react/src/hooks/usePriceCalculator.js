// hooks/usePriceCalculator.js
import { useMemo } from 'react';

/**
 * Hook para calcular precios dinámicos basados en duración de estadía
 * @param {Object} prices - Objeto con precios { daily, weekly, monthly, currency }
 * @param {string} checkIn - Fecha de check-in en formato YYYY-MM-DD
 * @param {string} checkOut - Fecha de check-out en formato YYYY-MM-DD
 * @returns {Object} Objeto con información del precio calculado
 */
export const usePriceCalculator = (prices, checkIn, checkOut) => {
  return useMemo(() => {
    // Validar datos de entrada
    if (!prices || !checkIn || !checkOut) {
      return {
        totalPrice: 0,
        pricePerDay: 0,
        nights: 0,
        period: 'daily',
        currency: 'USD',
        breakdown: null,
        error: 'Faltan datos para calcular el precio'
      };
    }

    try {
      // Calcular número de noches
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (nights <= 0) {
        return {
          totalPrice: 0,
          pricePerDay: 0,
          nights: 0,
          period: 'daily',
          currency: prices.currency || 'USD',
          breakdown: null,
          error: 'Las fechas no son válidas'
        };
      }

      // Extraer precios numéricos (manejar tanto strings como números)
      const dailyPrice = extractPrice(prices.daily);
      const weeklyPrice = extractPrice(prices.weekly);
      const monthlyPrice = extractPrice(prices.monthly);
      const currency = prices.currency || 'USD';

      console.log(`💰 [usePriceCalculator] Precios extraídos:`, {
        daily: dailyPrice,
        weekly: weeklyPrice,
        monthly: monthlyPrice,
        nights: nights
      });

      // Determinar el mejor precio basado en la duración
      let totalPrice = 0;
      let pricePerDay = 0;
      let period = 'daily';
      let breakdown = {};

      if (nights >= 30 && monthlyPrice > 0) {
        // Precio mensual (30+ días)
        const months = Math.floor(nights / 30);
        const remainingDays = nights % 30;
        
        totalPrice = (months * monthlyPrice);
        
        // Si quedan días, aplicar precio semanal o diario
        if (remainingDays > 0) {
          if (remainingDays >= 7 && weeklyPrice > 0) {
            const weeks = Math.floor(remainingDays / 7);
            const extraDays = remainingDays % 7;
            totalPrice += (weeks * weeklyPrice) + (extraDays * dailyPrice);
            breakdown = {
              months: { count: months, price: monthlyPrice, total: months * monthlyPrice },
              weeks: weeks > 0 ? { count: weeks, price: weeklyPrice, total: weeks * weeklyPrice } : null,
              days: extraDays > 0 ? { count: extraDays, price: dailyPrice, total: extraDays * dailyPrice } : null
            };
          } else {
            totalPrice += remainingDays * dailyPrice;
            breakdown = {
              months: { count: months, price: monthlyPrice, total: months * monthlyPrice },
              days: { count: remainingDays, price: dailyPrice, total: remainingDays * dailyPrice }
            };
          }
        } else {
          breakdown = {
            months: { count: months, price: monthlyPrice, total: months * monthlyPrice }
          };
        }
        
        period = 'monthly';
        pricePerDay = totalPrice / nights;

      } else if (nights >= 7 && weeklyPrice > 0) {
        // Precio semanal (7-29 días)
        const weeks = Math.floor(nights / 7);
        const remainingDays = nights % 7;
        
        totalPrice = (weeks * weeklyPrice) + (remainingDays * dailyPrice);
        breakdown = {
          weeks: { count: weeks, price: weeklyPrice, total: weeks * weeklyPrice },
          days: remainingDays > 0 ? { count: remainingDays, price: dailyPrice, total: remainingDays * dailyPrice } : null
        };
        
        period = 'weekly';
        pricePerDay = totalPrice / nights;

      } else {
        // Precio diario (1-6 días)
        totalPrice = nights * dailyPrice;
        breakdown = {
          days: { count: nights, price: dailyPrice, total: totalPrice }
        };
        
        period = 'daily';
        pricePerDay = dailyPrice;
      }

      console.log(`💰 [usePriceCalculator] Resultado:`, {
        totalPrice,
        pricePerDay,
        nights,
        period,
        breakdown
      });

      return {
        totalPrice: Math.round(totalPrice * 100) / 100, // Redondear a 2 decimales
        pricePerDay: Math.round(pricePerDay * 100) / 100,
        nights,
        period,
        currency,
        breakdown,
        error: null
      };

    } catch (error) {
      console.error('Error calculando precio:', error);
      return {
        totalPrice: 0,
        pricePerDay: 0,
        nights: 0,
        period: 'daily',
        currency: prices.currency || 'USD',
        breakdown: null,
        error: 'Error al calcular el precio'
      };
    }
  }, [prices, checkIn, checkOut]);
};

/**
 * Función auxiliar para extraer precio numérico de string o número
 * @param {string|number} priceValue - Valor del precio (ej: "USD 65", 65, "65")
 * @returns {number} Precio numérico
 */
const extractPrice = (priceValue) => {
  if (typeof priceValue === 'number') {
    return priceValue;
  }
  
  if (typeof priceValue === 'string') {
    // Eliminar todo excepto números y punto decimal
    const numericValue = priceValue.replace(/[^\d.]/g, '');
    const parsed = parseFloat(numericValue);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
};

export default usePriceCalculator;
