import { useState, useEffect, useCallback } from 'react';
import { propertyAPI } from '../services/api';

// Importar el contexto de Admin directamente  
import { useAdmin } from '../context/AdminContext-STATEFUL';

// Datos fallback para cuando el backend no esté disponible (IDs corregidos)
const fallbackData = {
  'moldes-1680': {
    id: 'moldes-1680',
    title: 'Moldes 1680',
    prices: {
      daily: 'USD 65',
      weekly: 'USD 350', 
      monthly: 'USD 1000',
      currency: 'USD'
    },
    description: {
      es: 'Exclusivo departamento de dos ambientes en edificio boutique con amenities premium en Belgrano.',
      en: 'Exclusive two-room apartment in a boutique building with premium amenities in Belgrano.',
      pt: 'Apartamento exclusivo de dois ambientes em edifício boutique com amenidades premium em Belgrano.'
    },
    amenities: {
      departamento: [
        { icon: 'fas fa-tv', text: 'Smart TV 55"' },
        { icon: 'fas fa-wifi', text: 'WiFi 500MB Fibra Óptica' },
        { icon: 'fas fa-snowflake', text: 'Aire Acondicionado F/C' },
        { icon: 'fas fa-utensils', text: 'Cocina Completamente Equipada' },
        { icon: 'fas fa-bed', text: 'Ropa de Cama Premium' },
        { icon: 'fas fa-bath', text: 'Baño Privado con Ducha' },
        { icon: 'fas fa-tshirt', text: 'Lavarropas' },
        { icon: 'fas fa-coffee', text: 'Cafetera y Menaje Completo' },
        { icon: 'fas fa-blender', text: 'Microondas y Electrodomésticos' },
        { icon: 'fas fa-couch', text: 'Living Amueblado' },
        { icon: 'fas fa-door-closed', text: 'Balcón Privado' },
        { icon: 'fas fa-lock', text: 'Caja Fuerte' },
        { icon: 'fas fa-broom', text: 'Kit de Limpieza' },
        { icon: 'fas fa-laptop', text: 'Zona de Trabajo/Escritorio' }
      ],
      servicios: [
        { icon: 'fas fa-concierge-bell', text: 'Recepción 24hs' },
        { icon: 'fas fa-shield-alt', text: 'Seguridad 24hs' },
        { icon: 'fas fa-broom', text: 'Servicio de Limpieza' },
        { icon: 'fas fa-car', text: 'Servicio de Traslados' },
        { icon: 'fas fa-suitcase', text: 'Guardaequipaje' },
        { icon: 'fas fa-info-circle', text: 'Información Turística' },
        { icon: 'fas fa-phone', text: 'Asistencia 24/7' }
      ],
      amenitiesEdificio: [
        { icon: 'fas fa-elevator', text: 'Ascensor' },
        { icon: 'fas fa-car', text: 'Cochera/Estacionamiento' },
        { icon: 'fas fa-dumbbell', text: 'Gimnasio' },
        { icon: 'fas fa-swimming-pool', text: 'Piscina' },
        { icon: 'fas fa-sun', text: 'Solarium/Terraza' },
        { icon: 'fas fa-users', text: 'SUM/Salón de Usos Múltiples' },
        { icon: 'fas fa-spa', text: 'Spa/Jacuzzi' },
        { icon: 'fas fa-tree', text: 'Jardín/Espacios Verdes' },
        { icon: 'fas fa-building', text: 'Edificio Moderno' },
        { icon: 'fas fa-shield-alt', text: 'Portería/Seguridad 24hs' }
      ]
    }
  },
  'santa-fe-3770': {
    id: 'santa-fe-3770',
    title: 'Santa Fe 3770',
    prices: {
      daily: 'USD 75',
      weekly: 'USD 420',
      monthly: 'USD 1000',
      currency: 'USD'
    },
    description: {
      es: 'Departamento moderno de un ambiente en el corazón de Palermo con todas las comodidades necesarias.',
      en: 'Modern one-bedroom apartment in the heart of Palermo with all necessary amenities.',
      pt: 'Apartamento moderno de um ambiente no coração de Palermo com todas as comodidades necessárias.'
    },
    amenities: {
      departamento: [
        { icon: 'fas fa-tv', text: 'Smart TV 49"' },
        { icon: 'fas fa-wifi', text: 'WiFi 300MB Fibra Óptica' },
        { icon: 'fas fa-snowflake', text: 'Aire Acondicionado Split' }
      ],
      servicios: [
        { icon: 'fas fa-shield-alt', text: 'Seguridad 24hs' },
        { icon: 'fas fa-tshirt', text: 'Laundry' }
      ],
      amenitiesEdificio: [
        { icon: 'fas fa-swimming-pool', text: 'Piscina Olímpica' },
        { icon: 'fas fa-dumbbell', text: 'Gimnasio Equipado' }
      ]
    }
  },
  ugarteche2824: {
    id: 'ugarteche2824',
    title: 'Ugarteche 2824',
    prices: {
      daily: 'USD 95',
      weekly: 'USD 400',
      monthly: 'USD 750',
      currency: 'USD'
    },
    description: {
      es: 'Departamento de lujo en Palermo Botánico con vistas espectaculares.',
      en: 'Luxury apartment in Palermo Botánico with spectacular views.',
      pt: 'Apartamento de luxo em Palermo Botânico com vistas espetaculares.'
    },
    amenities: {
      departamento: [
        { icon: 'fas fa-tv', text: 'Smart TV 55"' },
        { icon: 'fas fa-wifi', text: 'WiFi 300MB Fibra Óptica' }
      ],
      servicios: [
        { icon: 'fas fa-shield-alt', text: 'Seguridad 24hs' }
      ],
      amenitiesEdificio: []
    }
  },
  'ugarteche-2824': {
    id: 'ugarteche-2824',
    title: 'Ugarteche 2824',
    prices: {
      daily: 'USD 95',
      weekly: 'USD 400',
      monthly: 'USD 750',
      currency: 'USD'
    },
    description: {
      es: 'Departamento de lujo en Palermo Botánico con vistas espectaculares.',
      en: 'Luxury apartment in Palermo Botánico with spectacular views.',
      pt: 'Apartamento de luxo em Palermo Botânico com vistas espetaculares.'
    },
    amenities: {
      departamento: [
        { icon: 'fas fa-tv', text: 'Smart TV 55"' },
        { icon: 'fas fa-wifi', text: 'WiFi 300MB Fibra Óptica' }
      ],
      servicios: [
        { icon: 'fas fa-shield-alt', text: 'Seguridad 24hs' }
      ],
      amenitiesEdificio: []
    }
  },
  dorrego1548: {
    id: 'dorrego1548',
    title: 'Dorrego 1548',
    prices: {
      daily: 'USD 70',
      weekly: 'USD 320',
      monthly: 'USD 1200',
      currency: 'USD'
    },
    description: {
      es: 'Departamento completo en Villa Crespo con excelente ubicación y conectividad.',
      en: 'Complete apartment in Villa Crespo with excellent location and connectivity.',
      pt: 'Apartamento completo em Villa Crespo com excelente localização e conectividade.'
    },
    amenities: {
      departamento: [
        { icon: 'fas fa-tv', text: 'Smart TV' },
        { icon: 'fas fa-wifi', text: 'WiFi' },
        { icon: 'fas fa-snowflake', text: 'Aire Acondicionado' }
      ],
      servicios: [
        { icon: 'fas fa-shield-alt', text: 'Seguridad' },
        { icon: 'fas fa-broom', text: 'Limpieza' }
      ],
      amenitiesEdificio: [
        { icon: 'fas fa-tree', text: 'Jardín' }
      ]
    }
  },
  'dorrego-1548': {
    id: 'dorrego-1548',
    title: 'Dorrego 1548',
    prices: {
      daily: 'USD 70',
      weekly: 'USD 320',
      monthly: 'USD 1200',
      currency: 'USD'
    },
    description: {
      es: 'Departamento completo en Villa Crespo con excelente ubicación y conectividad.',
      en: 'Complete apartment in Villa Crespo with excellent location and connectivity.',
      pt: 'Apartamento completo em Villa Crespo com excelente localização e conectividade.'
    },
    amenities: {
      departamento: [
        { icon: 'fas fa-tv', text: 'Smart TV' },
        { icon: 'fas fa-wifi', text: 'WiFi' },
        { icon: 'fas fa-snowflake', text: 'Aire Acondicionado' }
      ],
      servicios: [
        { icon: 'fas fa-shield-alt', text: 'Seguridad' },
        { icon: 'fas fa-broom', text: 'Limpieza' }
      ],
      amenitiesEdificio: [
        { icon: 'fas fa-tree', text: 'Jardín' }
      ]
    }
  },
  convencion1994: {
    id: 'convencion1994',
    title: 'Convención 1994',
    prices: {
      daily: 'USD 90',
      weekly: 'USD 380',
      monthly: 'USD 1200',
      currency: 'USD'
    },
    description: {
      es: 'Estudio exclusivo para dos personas en edificio boutique con amenidades premium en Palermo Hollywood.',
      en: 'Exclusive studio for two in a boutique building with premium amenities in Palermo Hollywood.',
      pt: 'Estúdio exclusivo para duas pessoas em edifício boutique com amenidades premium em Palermo Hollywood.'
    },
    amenities: {
      departamento: [
        { icon: 'fas fa-tv', text: 'Smart TV 32"' },
        { icon: 'fas fa-wifi', text: 'WiFi 300MB Fibra Óptica' },
        { icon: 'fas fa-snowflake', text: 'Aire Acondicionado F/C' }
      ],
      servicios: [
        { icon: 'fas fa-shield-alt', text: 'Seguridad 24hs' },
        { icon: 'fas fa-concierge-bell', text: 'Conserjería' }
      ],
      amenitiesEdificio: [
        { icon: 'fas fa-elevator', text: 'Ascensor' },
        { icon: 'fas fa-building', text: 'Edificio Boutique' }
      ]
    }
  },
  'convencion-1994': {
    id: 'convencion-1994',
    title: 'Convención 1994',
    prices: {
      daily: 'USD 90',
      weekly: 'USD 380',
      monthly: 'USD 1200',
      currency: 'USD'
    },
    description: {
      es: 'Estudio exclusivo para dos personas en edificio boutique con amenidades premium en Palermo Hollywood.',
      en: 'Exclusive studio for two in a boutique building with premium amenities in Palermo Hollywood.',
      pt: 'Estúdio exclusivo para duas pessoas em edifício boutique com amenidades premium em Palermo Hollywood.'
    },
    amenities: {
      departamento: [
        { icon: 'fas fa-tv', text: 'Smart TV 32"' },
        { icon: 'fas fa-wifi', text: 'WiFi 300MB Fibra Óptica' },
        { icon: 'fas fa-snowflake', text: 'Aire Acondicionado F/C' }
      ],
      servicios: [
        { icon: 'fas fa-shield-alt', text: 'Seguridad 24hs' },
        { icon: 'fas fa-concierge-bell', text: 'Conserjería' }
      ],
      amenitiesEdificio: [
        { icon: 'fas fa-elevator', text: 'Ascensor' },
        { icon: 'fas fa-building', text: 'Edificio Boutique' }
      ]
    }
  }
};

// Hook para cargar información completa de la propiedad desde el backend
export const useProperty = (propertyId) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [lastLoadedId, setLastLoadedId] = useState(null);

  // Usar el contexto admin con manejo de errores
  let adminContext = null;
  try {
    adminContext = useAdmin();
  } catch (error) {
    console.log('🔄 PROPERTY HOOK: Error accediendo a AdminContext:', error.message);
  }

  // Mapeo de IDs de página a IDs de base de datos (corregido con IDs reales)
  const propertyIdMap = {
    'moldes-1680': 'moldes-1680',      // ← Usar ID real del backend
    'moldes1680': 'moldes-1680',       // ← Compatibilidad
    'santa-fe-3770': 'santa-fe-3770', // ← Usar ID real del backend
    'santafe3770': 'santa-fe-3770',   // ← Compatibilidad
    'dorrego-1548': 'dorrego-1548',   // ← Corregido: usar ID con guiones
    'dorrego1548': 'dorrego-1548',    // ← Compatibilidad
    'convencion-1994': 'convencion-1994', // ← Corregido: usar ID con guiones
    'convencion1994': 'convencion-1994', // ← Compatibilidad
    'ugarteche-2824': 'ugarteche-2824', // ← Corregido: usar ID con guiones
    'ugarteche2824': 'ugarteche-2824'  // ← Compatibilidad
  };

  // Función de carga sin useCallback para evitar bucles infinitos
  const loadProperty = async () => {
    if (!propertyId || propertyId === lastLoadedId) {
      console.log(`🔄 PROPERTY HOOK: Skipping load - ya cargado: ${propertyId}`);
      setLoading(false);
      return;
    }

    try {
      console.log(`🏠 PROPERTY HOOK: Cargando NUEVA propiedad: ${propertyId} (anterior: ${lastLoadedId})`);
      setLoading(true);
      setError(null);
      setIsUsingFallback(false);
      setLastLoadedId(propertyId);

      // Usar el ID correcto para la base de datos
      const dbPropertyId = propertyIdMap[propertyId] || propertyId;
      
      // Primero intentar obtener datos del AdminContext
      if (adminContext && adminContext.getProperty) {
        console.log(`🎯 PROPERTY HOOK: AdminContext disponible para ${propertyId}`);
        console.log(`🎯 PROPERTY HOOK: isInitialized =`, adminContext.isInitialized);
        console.log(`🎯 PROPERTY HOOK: Llamando getProperty con dbPropertyId =`, dbPropertyId);
        
        const contextProperty = adminContext.getProperty(dbPropertyId);
        
        console.log(`🎯 PROPERTY HOOK: Resultado de getProperty:`, contextProperty);
        
        if (contextProperty) {
          console.log(`✅ PROPERTY HOOK: Datos obtenidos desde AdminContext para ${propertyId}:`, {
            id: contextProperty.id,
            title: contextProperty.title,
            hasPrices: !!contextProperty.prices,
            pricesStructure: contextProperty.prices,
            pricesType: typeof contextProperty.prices,
            pricesKeys: contextProperty.prices ? Object.keys(contextProperty.prices) : [],
            dailyPrice: contextProperty.prices?.daily,
            weeklyPrice: contextProperty.prices?.weekly,
            monthlyPrice: contextProperty.prices?.monthly,
            amenitiesCount: {
              departamento: contextProperty.amenities?.departamento?.length || 0,
              servicios: contextProperty.amenities?.servicios?.length || 0,
              amenitiesEdificio: contextProperty.amenities?.amenitiesEdificio?.length || 0
            }
          });
          
          // Formatear precios si es necesario
          const formattedProperty = {
            ...contextProperty,
            prices: (contextProperty.prices?.daily?.includes?.('USD')) ? 
              contextProperty.prices : 
              {
                daily: `USD ${contextProperty.prices?.daily || '0'}`,
                weekly: `USD ${contextProperty.prices?.weekly || '0'}`, 
                monthly: `USD ${contextProperty.prices?.monthly || '0'}`,
                currency: contextProperty.prices?.currency || 'USD'
              }
          };
          
          console.log(`🎯 PROPERTY HOOK: Formateando propiedad para ${propertyId}:`, {
            originalPrices: contextProperty.prices,
            formattedPrices: formattedProperty.prices
          });
          
          setProperty(formattedProperty);
          console.log(`✅ PROPERTY HOOK: Property seteada para ${propertyId}`);
          setLoading(false);
          return;
        } else {
          console.log(`⚠️ PROPERTY HOOK: Property ${dbPropertyId} no encontrada en AdminContext`);
          
          // Si el AdminContext no está inicializado, esperar un poco y reintentar
          if (!adminContext.isInitialized) {
            console.log(`🔄 PROPERTY HOOK: AdminContext no inicializado, esperando 1 segundo y reintentando...`);
            setTimeout(() => {
              console.log(`🔄 PROPERTY HOOK: Reintentando carga para ${propertyId}`);
              loadProperty();
            }, 1000);
            return;
          }
        }
      } else {
        console.log(`⚠️ PROPERTY HOOK: AdminContext no disponible, no inicializado o sin método getProperty. Estado:`, {
          hasContext: !!adminContext,
          hasGetProperty: !!(adminContext?.getProperty),
          isInitialized: adminContext?.isInitialized
        });
      }
      
      console.log(`🏠 PROPERTY HOOK: Intentando cargar desde backend: ${propertyId} → ${dbPropertyId}`);
      
      // Intentar cargar desde el backend con timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Backend timeout')), 5000)
      );
      
      const apiPromise = propertyAPI.getProperty(dbPropertyId, { 
        cacheBust: Date.now() 
      });
      
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      if (response.success && response.data) {
        const backendData = response.data;
        
        console.log(`✅ PROPERTY HOOK: Datos cargados desde backend para ${propertyId}:`, {
          id: backendData.id,
          updatedAt: backendData.updatedAt,
          hasPrices: !!backendData.prices,
          pricesStructure: backendData.prices,
          amenitiesCount: {
            departamento: backendData.amenities?.departamento?.length || 0,
            servicios: backendData.amenities?.servicios?.length || 0,
            amenitiesEdificio: backendData.amenities?.amenitiesEdificio?.length || 0
          },
          amenitiesPreview: {
            departamento: backendData.amenities?.departamento?.slice(0, 2).map(a => a.text) || [],
            servicios: backendData.amenities?.servicios?.slice(0, 2).map(a => a.text) || [],
            amenitiesEdificio: backendData.amenities?.amenitiesEdificio?.slice(0, 2).map(a => a.text) || []
          }
        });
        
        // Verificar que tenemos la estructura mínima necesaria
        // Manejar tanto la estructura nueva (prices) como la de fallback (price)
        let prices;
        if (backendData.prices && typeof backendData.prices === 'object') {
          // Estructura nueva correcta
          prices = {
            daily: `USD ${backendData.prices.daily || 0}`,
            weekly: `USD ${backendData.prices.weekly || 0}`, 
            monthly: `USD ${backendData.prices.monthly || 0}`,
            currency: backendData.prices.currency || 'USD'
          };
        } else if (backendData.price && typeof backendData.price === 'number') {
          // Estructura de fallback del backend (datos demo)
          console.warn(`⚠️ PROPERTY HOOK: Usando estructura de fallback para ${propertyId}. Price: ${backendData.price}`);
          prices = {
            daily: `USD ${Math.round(backendData.price / 30)}`,
            weekly: `USD ${Math.round(backendData.price / 4)}`,
            monthly: `USD ${backendData.price}`,
            currency: 'USD'
          };
        } else {
          console.warn(`⚠️ PROPERTY HOOK: Estructura de precios inválida para ${propertyId}:`, backendData);
          throw new Error('Invalid prices structure');
        }
        
        const propertyData = {
          ...backendData,
          prices: prices
        };
        
        setProperty(propertyData);
      } else {
        throw new Error('Backend response invalid');
      }
    } catch (err) {
      console.warn(`⚠️ PROPERTY HOOK: Error cargando desde backend para ${propertyId}:`, {
        error: err.message,
        stack: err.stack,
        propertyId: propertyId,
        dbPropertyId: propertyIdMap[propertyId] || propertyId
      });
      
      // Usar datos fallback
      const fallback = fallbackData[propertyIdMap[propertyId] || propertyId];
      if (fallback) {
        console.log(`🔄 PROPERTY HOOK: Usando datos fallback para ${propertyId}:`, {
          id: fallback.id,
          amenitiesCount: {
            departamento: fallback.amenities?.departamento?.length || 0,
            servicios: fallback.amenities?.servicios?.length || 0,
            amenitiesEdificio: fallback.amenities?.amenitiesEdificio?.length || 0
          }
        });
        setProperty(fallback);
        setIsUsingFallback(true);
      } else {
        console.error(`❌ PROPERTY HOOK: No hay datos fallback para ${propertyId}`);
        setError(`No hay datos disponibles para la propiedad: ${propertyId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // useEffect con dependencias específicas para evitar bucles infinitos
  useEffect(() => {
    loadProperty();
  }, [propertyId]); // Solo depender del propertyId, no de la función

  // Añadir otro useEffect para detectar cambios en AdminContext
  useEffect(() => {
    if (adminContext && adminContext.lastUpdate) {
      console.log('🔄 PROPERTY HOOK: Detectado cambio en AdminContext, recargando...', adminContext.lastUpdate);
      // Usar setTimeout para asegurar que el estado se haya actualizado
      setTimeout(() => {
        loadProperty();
      }, 100);
    }
  }, [adminContext?.lastUpdate]);

  // También escuchar cambios en las propiedades del AdminContext
  useEffect(() => {
    if (adminContext && adminContext.properties && propertyId) {
      const dbPropertyId = propertyIdMap[propertyId] || propertyId;
      const contextProperty = adminContext.properties[dbPropertyId];
      
      if (contextProperty && contextProperty.updatedAt) {
        console.log('🔄 PROPERTY HOOK: Detectado cambio en propiedad específica, actualizando...', {
          id: dbPropertyId,
          updatedAt: contextProperty.updatedAt
        });
        loadProperty();
      }
    }
  }, [adminContext?.properties, propertyId]);

  // Escuchar eventos personalizados para actualizaciones forzadas
  useEffect(() => {
    const handlePropertyUpdate = (event) => {
      const { propertyId: updatedPropertyId } = event.detail;
      const dbPropertyId = propertyIdMap[propertyId] || propertyId;
      
      if (updatedPropertyId === propertyId || updatedPropertyId === dbPropertyId) {
        console.log('🔄 PROPERTY HOOK: Detectado evento personalizado de actualización, recargando...', {
          eventPropertyId: updatedPropertyId,
          currentPropertyId: propertyId,
          dbPropertyId: dbPropertyId
        });
        setTimeout(() => {
          loadProperty();
        }, 50);
      }
    };

    const handlePriceUpdate = (event) => {
      const { propertyId: updatedPropertyId, prices } = event.detail;
      const dbPropertyId = propertyIdMap[propertyId] || propertyId;
      
      if (updatedPropertyId === propertyId || updatedPropertyId === dbPropertyId) {
        console.log('💰 PROPERTY HOOK: Detectado evento de actualización de precios, actualizando...', {
          eventPropertyId: updatedPropertyId,
          currentPropertyId: propertyId,
          dbPropertyId: dbPropertyId,
          newPrices: prices
        });
        
        // Actualizar inmediatamente los precios sin recargar todo
        setProperty(prev => prev ? {
          ...prev,
          prices: prices
        } : null);
        
        // También recargar completamente después de un momento
        setTimeout(() => {
          loadProperty();
        }, 100);
      }
    };

    window.addEventListener('baconfort-property-updated', handlePropertyUpdate);
    window.addEventListener('baconfort-prices-updated', handlePriceUpdate);
    
    return () => {
      window.removeEventListener('baconfort-property-updated', handlePropertyUpdate);
      window.removeEventListener('baconfort-prices-updated', handlePriceUpdate);
    };
  }, [propertyId, loadProperty]);

  // Función para refrescar los datos manualmente
  const refreshProperty = useCallback(() => {
    loadProperty();
  }, [propertyId]); // Solo depender del propertyId

  return {
    property,
    loading,
    error,
    refreshProperty,
    isUsingFallback
  };
};

export default useProperty;
