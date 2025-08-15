// force-correct-prices.js
// Script para forzar precios correctos en toda la aplicación

const fs = require('fs');
const path = require('path');

console.log('🔧 FORZANDO PRECIOS CORRECTOS EN TODO EL FRONTEND');
console.log('================================================');
console.log('');

// Precios correctos según el backend
const CORRECT_PRICES = {
  'ugarteche-2824': {
    daily: 45,
    weekly: 400,
    monthly: 991,
    currency: 'USD'
  }
};

console.log('✅ Precios correctos definidos:');
console.log('   Ugarteche 2824:');
console.log('   - Diario: USD', CORRECT_PRICES['ugarteche-2824'].daily);
console.log('   - Semanal: USD', CORRECT_PRICES['ugarteche-2824'].weekly);
console.log('   - Mensual: USD', CORRECT_PRICES['ugarteche-2824'].monthly);
console.log('');

// 1. Actualizar propertyPrices.js
const propertyPricesPath = path.join(__dirname, 'baconfort-react', 'src', 'utils', 'propertyPrices.js');

if (fs.existsSync(propertyPricesPath)) {
  console.log('📝 Actualizando propertyPrices.js...');
  
  let content = fs.readFileSync(propertyPricesPath, 'utf8');
  
  // Asegurar que los precios de Ugarteche sean correctos
  content = content.replace(
    /('ugarteche2824':\s*{[^}]+})/gs,
    `'ugarteche2824': {
      daily: 45,
      weekly: 400,
      monthly: 991,
      currency: 'USD'
    }`
  );
  
  fs.writeFileSync(propertyPricesPath, content, 'utf8');
  console.log('   ✅ propertyPrices.js actualizado');
}

// 2. Crear service de precios centralizados
const centralPriceServicePath = path.join(__dirname, 'baconfort-react', 'src', 'services', 'centralPriceService.js');

const centralPriceServiceContent = `// Central Price Service - ÚNICA FUENTE DE PRECIOS
// Este service SIEMPRE debe usarse para obtener precios

const BACKEND_API = import.meta.env.VITE_API_URL || 'https://baconfort-production-084d.up.railway.app/api';

// Precios hardcodeados como fallback (DEBEN coincidir con el backend)
const FALLBACK_PRICES = {
  'ugarteche-2824': { daily: 45, weekly: 400, monthly: 991, currency: 'USD' },
  'ugarteche2824': { daily: 45, weekly: 400, monthly: 991, currency: 'USD' },
  'moldes-1680': { daily: 70, weekly: 400, monthly: 1200, currency: 'USD' },
  'moldes1680': { daily: 70, weekly: 400, monthly: 1200, currency: 'USD' }
};

/**
 * SERVICIO CENTRALIZADO DE PRECIOS
 * USO OBLIGATORIO en toda la aplicación
 */
class CentralPriceService {
  
  /**
   * Obtener precios correctos SIEMPRE
   */
  static async getCorrectPrices(propertyId) {
    try {
      console.log('💰 [CentralPrice] Obteniendo precios para:', propertyId);
      
      // Normalizar ID
      const normalizedId = propertyId?.toString().toLowerCase().replace(/[\\s-]/g, '');
      
      // Intentar backend primero
      try {
        const response = await fetch(\`\${BACKEND_API}/calculate-price\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId: propertyId,
            checkIn: '2025-08-17', // Fecha dummy para obtener estructura
            checkOut: '2025-08-24'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.propertyPrices) {
            console.log('✅ [CentralPrice] Precios obtenidos del backend:', data.propertyPrices);
            return data.propertyPrices;
          }
        }
      } catch (error) {
        console.warn('⚠️ [CentralPrice] Backend no disponible, usando fallback');
      }
      
      // Usar fallback
      const fallbackPrice = FALLBACK_PRICES[normalizedId];
      if (fallbackPrice) {
        console.log('✅ [CentralPrice] Usando precios fallback:', fallbackPrice);
        return fallbackPrice;
      }
      
      throw new Error('No se encontraron precios para la propiedad');
      
    } catch (error) {
      console.error('❌ [CentralPrice] Error:', error);
      throw error;
    }
  }
  
  /**
   * Calcular precio total CORRECTO
   */
  static async calculateCorrectTotal(propertyId, checkIn, checkOut) {
    try {
      console.log('🧮 [CentralPrice] Calculando total para:', { propertyId, checkIn, checkOut });
      
      // Usar API del backend para cálculo
      const response = await fetch(\`\${BACKEND_API}/calculate-price\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, checkIn, checkOut })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ [CentralPrice] Total calculado:', data);
          return data;
        }
      }
      
      throw new Error('Error calculando precio');
      
    } catch (error) {
      console.error('❌ [CentralPrice] Error calculando total:', error);
      
      // Fallback manual
      const prices = await this.getCorrectPrices(propertyId);
      const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
      
      let total = 0;
      if (nights >= 7) {
        const weeks = Math.floor(nights / 7);
        const remainingDays = nights % 7;
        total = (weeks * prices.weekly) + (remainingDays * prices.daily);
      } else {
        total = nights * prices.daily;
      }
      
      return {
        success: true,
        totalAmount: total,
        currency: prices.currency,
        nights: nights,
        propertyPrices: prices
      };
    }
  }
}

export default CentralPriceService;
`;

fs.writeFileSync(centralPriceServicePath, centralPriceServiceContent, 'utf8');
console.log('📝 Creado CentralPriceService.js');

console.log('');
console.log('🎯 PRÓXIMOS PASOS:');
console.log('1. Actualizar todos los componentes para usar CentralPriceService');
console.log('2. Reemplazar todas las llamadas a precios locales');
console.log('3. Rebuild y redeploy del frontend');
console.log('');
console.log('✅ ARCHIVOS ACTUALIZADOS');
