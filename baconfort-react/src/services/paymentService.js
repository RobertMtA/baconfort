import { API_URL } from './api';

/**
 * Servicio para manejar pagos con diferentes proveedores
 */
class PaymentService {
  
  /**
   * Crear preferencia de pago en Mercado Pago
   * @param {Object} reservationData - Datos de la reserva
   * @returns {Promise<Object>} - Respuesta con la preferencia creada
   */
  static async createMercadoPagoPreference(reservationData) {
    try {
      // Obtener token de administrador para crear pagos
      const adminSession = localStorage.getItem('baconfort_admin_session');
      const adminData = adminSession ? JSON.parse(adminSession) : null;
      const adminToken = adminData?.token || 'BACONFORT_ADMIN_2025_7D3F9K2L';
      
      console.log('💳 PaymentService: Usando token admin para pagos:', adminToken);
      console.log('💳 PaymentService: Datos de reserva recibidos:', reservationData);
      
      const response = await fetch(`${API_URL}/payments/mercadopago/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(reservationData)
      });

      console.log('💳 PaymentService: Response status:', response.status);
      console.log('💳 PaymentService: Response ok:', response.ok);
      console.log('💳 PaymentService: URL usada:', `${API_URL}/payments/mercadopago/create-preference`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('💳 PaymentService: Error response text:', errorText);
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('💳 PaymentService: Preferencia creada exitosamente:', result);
      return result;
    } catch (error) {
      console.error('❌ Error al crear preferencia de Mercado Pago:', error);
      throw error;
    }
  }

  /**
   * Verificar estado de pago
   * @param {string} paymentId - ID del pago
   * @param {string} provider - Proveedor del pago ('mercadopago')
   * @returns {Promise<Object>} - Estado del pago
   */
  static async checkPaymentStatus(paymentId, provider) {
    try {
      // Obtener token de administrador para verificar pagos
      const adminSession = localStorage.getItem('baconfort_admin_session');
      const adminData = adminSession ? JSON.parse(adminSession) : null;
      const adminToken = adminData?.token || 'BACONFORT_ADMIN_2025_7D3F9K2L';
      
      const response = await fetch(`${API_URL}/payments/${provider}/status/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error verificando estado de pago:', error);
      throw error;
    }
  }

  /**
   * Obtener métodos de pago disponibles según la ubicación del usuario
   * @param {string} country - Código de país (ISO 2 letras)
   * @returns {Array} - Lista de métodos de pago disponibles
   */
  static getAvailablePaymentMethods(country) {
    const paymentMethods = [];

    // SOLO EFECTIVO - MÉTODOS DIGITALES DESHABILITADOS
    
    // Mercado Pago COMENTADO - Solo efectivo por ahora
    /*
    const mercadoPagoCountries = ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'];
    if (mercadoPagoCountries.includes(country?.toUpperCase())) {
      paymentMethods.push({
        id: 'mercadopago',
        name: 'Mercado Pago',
        description: 'Tarjeta, transferencia o efectivo',
        icon: '/icons/mercadopago.svg',
        currencies: ['USD', 'ARS'],
        currencyLabels: ['Dólares Americanos', 'Pesos Argentinos'],
        features: ['Pago inmediato', 'Múltiples opciones', 'Seguridad garantizada']
      });
    }
    */

    // MÉTODO ACTIVO: SOLO EFECTIVO
    paymentMethods.push({
      id: 'cash',
      name: 'Efectivo',
      description: 'Paga al momento del servicio',
      icon: null, // Usar emoji fallback en lugar de SVG inexistente
      currencies: ['ARS'],
      currencyLabels: ['Pesos Argentinos'],
      features: ['Sin comisiones', 'Pago al llegar', 'Dinero exacto recomendado']
    });

    return paymentMethods;
  }

  /**
   * Detectar país del usuario (básico, se puede mejorar con geolocalización)
   * @returns {string} - Código de país detectado
   */
  static detectUserCountry() {
    // Detectar por idioma del navegador (básico)
    const language = navigator.language || navigator.userLanguage;
    
    const countryMap = {
      'es-AR': 'AR',
      'es-CL': 'CL',
      'es-CO': 'CO',
      'es-MX': 'MX',
      'es-PE': 'PE',
      'es-UY': 'UY',
      'pt-BR': 'BR',
      'en-US': 'US',
      'en-GB': 'GB'
    };

    return countryMap[language] || 'US'; // Default a US si no se detecta
  }
}

export default PaymentService;
