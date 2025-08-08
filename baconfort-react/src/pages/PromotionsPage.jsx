import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { promotionsAPI } from '../services/api';
import './PromotionsPage.css';

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Mapa de precios base de las propiedades (memo para evitar recreación)
  const PROPERTY_PRICES = useMemo(() => ({
    'moldes-1680': { monthly: 1200, weekly: 400, daily: 70 }, // Precios reales del archivo
    'santafe-3770': { monthly: 1300, weekly: 420, daily: 75 },
    'santa-fe-3770': { monthly: 1300, weekly: 420, daily: 75 }, // Variante del ID
    'dorrego-1548': { monthly: 1150, weekly: 380, daily: 70 },
    'convencion-1994': { monthly: 1200, weekly: 400, daily: 70 },
    'ugarteche-2824': { monthly: 1250, weekly: 410, daily: 72 }
  }), []);

  // Función para sincronizar precio con datos reales de la propiedad (useCallback)
  const syncPromotionPrice = useCallback((promotion) => {
    console.log('🔄 Sincronizando precio para promoción:', promotion.title);
    
    const basePrices = PROPERTY_PRICES[promotion.propertyId];
    
    if (!basePrices) {
      console.log('⚠️ No se encontraron precios base para:', promotion.propertyId);
      return promotion;
    }

    let bestMatch = null;
    let smallestDifference = Infinity;
    let matchedPeriod = null;

    Object.entries(basePrices).forEach(([period, price]) => {
      const difference = Math.abs(promotion.originalPrice - price);
      if (difference < smallestDifference) {
        smallestDifference = difference;
        bestMatch = price;
        matchedPeriod = period;
      }
    });

    const tolerance = 0.1;
    const isSignificantDifference = smallestDifference > (bestMatch * tolerance);

    if (isSignificantDifference && bestMatch) {
      console.log(`🔧 Ajustando precio original de USD ${promotion.originalPrice} a USD ${bestMatch} (${matchedPeriod})`);
      
      const originalDiscount = promotion.originalPrice - promotion.promotionalPrice;
      const discountPercentage = originalDiscount / promotion.originalPrice;
      
      const newPromotionalPrice = Math.round(bestMatch * (1 - discountPercentage));
      
      return {
        ...promotion,
        originalPrice: bestMatch,
        promotionalPrice: Math.max(newPromotionalPrice, 1),
        _syncedPrice: true,
        _matchedPeriod: matchedPeriod
      };
    }

    console.log(`✅ Precio ya sincronizado para ${promotion.title}`);
    return promotion;
  }, [PROPERTY_PRICES]);

  // SEO - Actualizar título de la página
  useEffect(() => {
    document.title = 'Promociones Especiales | BACONFORT - Alquileres Temporales Buenos Aires';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Descubre nuestras promociones especiales en departamentos premium de Buenos Aires. Descuentos exclusivos en Palermo, Belgrano y Recoleta.');
    }

    return () => {
      document.title = 'BACONFORT - Alquileres Temporales Buenos Aires';
    };
  }, []);

  // Cargar promociones activas desde la API
  useEffect(() => {
    const loadPromotions = async () => {
      try {
        console.log('🎯 Cargando promociones desde la API...');
        setLoading(true);
        
        // Crear promociones de ejemplo para cada categoría y departamento
        const mockPromotions = [
          // PROMOCIONES MENSUALES
          {
            id: 'monthly-moldes-1680',
            title: 'Promoción Mensual - Moldes 1680',
            description: 'Descuento especial para estadías de 30 días en nuestro departamento premium de Palermo.',
            category: 'Mensuales',
            propertyId: 'moldes-1680',
            originalPrice: 1200, // Precio real mensual correcto
            promotionalPrice: 960, // 20% descuento
            isActive: true,
            validFrom: new Date('2025-01-01').toISOString(),
            validTo: new Date('2025-12-31').toISOString(),
            terms: 'Válido para estadías mínimas de 30 días. No acumulable con otras promociones.',
            image: '/img/img-portada-moldes-1680.jpg'
          },
          {
            id: 'monthly-santa-fe-3770',
            title: 'Oferta Mensual - Santa Fe 3770',
            description: 'Precio especial por mes completo en Belgrano junto al Jardín Botánico.',
            category: 'Mensuales',
            propertyId: 'santa-fe-3770',
            originalPrice: 1300, // Precio real mensual
            promotionalPrice: 1040, // 20% descuento
            isActive: true,
            validFrom: new Date('2025-01-01').toISOString(),
            validTo: new Date('2025-12-31').toISOString(),
            terms: 'Aplicable solo para contratos mensuales. Pago anticipado requerido.',
            image: '/img/img-portada-santa-fe-3770.jpg'
          },
          
          // PROMOCIONES SEMANALES
          {
            id: 'weekly-moldes-1680',
            title: 'Semana Premium - Moldes 1680',
            description: 'Oferta especial semanal en nuestro departamento estrella de Palermo.',
            category: 'Semanales',
            propertyId: 'moldes-1680',
            originalPrice: 400, // Precio real semanal
            promotionalPrice: 320, // 20% descuento
            isActive: true,
            validFrom: new Date('2025-01-01').toISOString(),
            validTo: new Date('2025-08-31').toISOString(),
            terms: 'Válido para estadías de 7 días exactos. Check-in domingos.',
            image: '/img/img-portada-moldes-1680.jpg'
          },
          {
            id: 'weekly-convencion-1994',
            title: 'Semana Ejecutiva - Convención 1994',
            description: 'Oferta imperdible para una semana en Villa Crespo.',
            category: 'Semanales',
            propertyId: 'convencion-1994',
            originalPrice: 400, // Precio real semanal
            promotionalPrice: 320, // 20% descuento
            isActive: true,
            validFrom: new Date('2025-01-01').toISOString(),
            validTo: new Date('2025-08-31').toISOString(),
            terms: 'Válido para estadías de 7 días exactos. Check-in domingos.',
            image: '/img/img-portada-convencion-1994.jpg'
          },
          {
            id: 'weekly-santa-fe-3770',
            title: 'Escapada Semanal - Santa Fe 3770',
            description: 'Una semana perfecta en Belgrano con todos los servicios incluidos.',
            category: 'Semanales',
            propertyId: 'santa-fe-3770',
            originalPrice: 420, // Precio real semanal
            promotionalPrice: 336, // 20% descuento
            isActive: true,
            validFrom: new Date('2025-01-01').toISOString(),
            validTo: new Date('2025-09-30').toISOString(),
            terms: 'Mínimo 7 días, máximo 14 días. Incluye limpieza semanal.',
            image: '/img/img-portada-santa-fe-3770.jpg'
          },
          
          // PROMOCIONES DIARIAS
          {
            id: 'daily-moldes-1680',
            title: 'Oferta Flash - Moldes 1680',
            description: 'Tarifa especial por día en nuestro departamento estrella de Palermo.',
            category: 'Diarias',
            propertyId: 'moldes-1680',
            originalPrice: 70, // Precio real diario correcto
            promotionalPrice: 56, // 20% descuento
            isActive: true,
            validFrom: new Date('2025-01-01').toISOString(),
            validTo: new Date('2025-06-30').toISOString(),
            terms: 'Disponible según disponibilidad. No válido en fines de semana.',
            image: '/img/img-portada-moldes-1680.jpg'
          },
          {
            id: 'daily-ugarteche-2824',
            title: 'Oferta Flash - Ugarteche 2824',
            description: 'Tarifa especial por día en Palermo Chico.',
            category: 'Diarias',
            propertyId: 'ugarteche-2824',
            originalPrice: 72, // Precio real diario
            promotionalPrice: 58, // 19% descuento
            isActive: true,
            validFrom: new Date('2025-01-01').toISOString(),
            validTo: new Date('2025-07-31').toISOString(),
            terms: 'Válido de lunes a jueves. Estadía mínima 2 noches.',
            image: '/img/img-portada-ugarteche-2824.jpg'
          },
          {
            id: 'daily-santa-fe-3770',
            title: 'Tarifa Nocturna - Santa Fe 3770',
            description: 'Precio especial por noche en nuestro departamento junto al Jardín Botánico.',
            category: 'Diarias',
            propertyId: 'santa-fe-3770',
            originalPrice: 75, // Precio real diario
            promotionalPrice: 60, // 20% descuento
            isActive: true,
            validFrom: new Date('2025-01-01').toISOString(),
            validTo: new Date('2025-06-30').toISOString(),
            terms: 'Disponible según disponibilidad. No válido en fines de semana.',
            image: '/img/img-portada-santa-fe-3770.jpg'
          },
          {
            id: 'daily-dorrego-1548',
            title: 'Descuento Madrugador - Dorrego 1548',
            description: 'Excelente opción para estadías cortas en Recoleta.',
            category: 'Diarias',
            propertyId: 'dorrego-1548',
            originalPrice: 70, // Precio real diario
            promotionalPrice: 56, // 20% descuento
            isActive: true,
            validFrom: new Date('2025-01-01').toISOString(),
            validTo: new Date('2025-08-15').toISOString(),
            terms: 'Tarifa por noche. Estadía mínima 3 noches.',
            image: '/img/img-portada-dorrego-1548.jpg'
          }
        ];

        // Intentar cargar desde la API primero
        let promotionsData = [];
        
        try {
          const response = await promotionsAPI.getAll({ active: 'true' });
          console.log('📡 Respuesta de la API:', response);
          if (response.data && response.data.length > 0) {
            promotionsData = response.data;
            console.log('✅ Usando promociones de la API:', promotionsData.length);
          } else {
            console.log('ℹ️ No hay promociones activas disponibles');
            promotionsData = []; // No usar mock cuando no hay promociones activas
          }
        } catch (apiError) {
          console.log('⚠️ API no disponible, usando promociones de ejemplo:', apiError.message);
          promotionsData = mockPromotions; // Solo usar mock si hay error de conexión
        }
        
        console.log('📊 Promociones recibidas:', promotionsData.length);
        
        // Filtrar promociones activas y válidas
        const activePromotions = promotionsData.filter(promo => {
          const now = new Date();
          const validFrom = new Date(promo.validFrom);
          const validTo = new Date(promo.validTo);
          return now >= validFrom && now <= validTo && promo.isActive;
        });
        
        console.log('✅ Promociones válidas para mostrar:', activePromotions.length);
        
        // 🔄 SINCRONIZAR PRECIOS CON DATOS REALES DE LAS PROPIEDADES
        const syncedPromotions = activePromotions.map(promotion => {
          const syncedPromotion = syncPromotionPrice(promotion);
          
          // Asignar categoría si no existe basándose en el precio
          if (!syncedPromotion.category) {
            const price = syncedPromotion.originalPrice || syncedPromotion.promotionalPrice;
            if (price >= 1000) {
              syncedPromotion.category = 'Mensuales';
              syncedPromotion._matchedPeriod = 'monthly';
            } else if (price >= 300) {
              syncedPromotion.category = 'Semanales';
              syncedPromotion._matchedPeriod = 'weekly';
            } else {
              syncedPromotion.category = 'Diarias';
              syncedPromotion._matchedPeriod = 'daily';
            }
            console.log(`🏷️ Categoría asignada para "${promotion.title}": ${syncedPromotion.category} (precio: ${price})`);
          }
          
          // Asignar período basado en el precio si no está sincronizado
          if (!syncedPromotion._matchedPeriod) {
            const price = promotion.originalPrice;
            if (price >= 1000) {
              syncedPromotion._matchedPeriod = 'monthly';
            } else if (price >= 300) {
              syncedPromotion._matchedPeriod = 'weekly';
            } else {
              syncedPromotion._matchedPeriod = 'daily';
            }
          }
          
          if (syncedPromotion._syncedPrice) {
            console.log(`🔄 Precio sincronizado para "${promotion.title}":`, {
              original: `USD ${promotion.originalPrice} → USD ${syncedPromotion.originalPrice}`,
              promotional: `USD ${promotion.promotionalPrice} → USD ${syncedPromotion.promotionalPrice}`,
              period: syncedPromotion._matchedPeriod,
              category: syncedPromotion.category
            });
          }
          
          return syncedPromotion;
        });
        
        setPromotions(syncedPromotions);
        console.log('🎯 Promociones finales cargadas:', syncedPromotions);
        setLoading(false);
        
      } catch (err) {
        console.error('❌ Error al cargar promociones:', err);
        setError('Error cargando promociones desde el servidor');
        setLoading(false);
      }
    };

    loadPromotions();
  }, [syncPromotionPrice]);

  const filteredPromotions = useMemo(() => {
    console.log('🔍 Filtrando promociones:', { filter, totalPromotions: promotions.length });
    
    if (filter === 'all') {
      console.log('✅ Mostrando todas las promociones');
      return promotions;
    }
    
    const filtered = promotions.filter(promo => {
      const category = promo.category || '';
      console.log(`🏷️ Promoción "${promo.title}" - Categoría: "${category}"`);
      
      return (
        (filter === 'monthly' && category === 'Mensuales') ||
        (filter === 'weekly' && category === 'Semanales') ||
        (filter === 'daily' && category === 'Diarias')
      );
    });
    
    console.log(`✅ Promociones filtradas (${filter}):`, filtered.length);
    return filtered;
  }, [promotions, filter]);

  // Función para obtener el nombre del departamento basado en el ID
  const getPropertyName = useCallback((propertyId) => {
    const propertyNames = {
      'moldes-1680': 'Moldes 1680 - Palermo',
      'santa-fe-3770': 'Santa Fe 3770 - Belgrano',
      'dorrego-1548': 'Dorrego 1548 - Recoleta',
      'convencion-1994': 'Convención 1994 - Villa Crespo',
      'ugarteche-2824': 'Ugarteche 2824 - Palermo Chico'
    };
    return propertyNames[propertyId] || 'Departamento BACONFORT';
  }, []);

  const generateWhatsAppURL = (promotion) => {
    const propertyName = getPropertyName(promotion.propertyId);
    const message = `Hola! Me interesa la promoción "${promotion.title}" para ${propertyName}. ¿Podrían darme más información?`;
    return `https://wa.me/541130021074?text=${encodeURIComponent(message)}`;
  };

  const calculateDiscount = (originalPrice, promotionalPrice) => {
    const actualDiscount = originalPrice - promotionalPrice;
    const actualPercentage = Math.round((actualDiscount / originalPrice) * 100);
    return `${actualPercentage}%`;
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  if (loading) {
    return (
      <div className="promotions-loading">
        <div className="loading-spinner"></div>
        <h3>🎁 Cargando promociones increíbles...</h3>
        <p>✨ Estamos buscando las mejores ofertas para ti ✨</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="promotions-error">
        <h3>😔 Oops! Algo salió mal</h3>
        <p>💔 {error} - ¡Pero no te preocupes, lo solucionaremos!</p>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          🔄 Intentar nuevamente
        </button>
      </div>
    );
  }

  return (
    <div className="promotions-page">
      <div className="promotions-header">
        <div className="container">
          <h1>
            <i className="fas fa-tags"></i> 🎉 Promociones Especiales 🎊
          </h1>
          <p className="lead">
            ✨🌟 Descubre nuestras ofertas exclusivas y ahorra en tu próxima estadía 🌟✨
          </p>
        </div>
      </div>

      <div className="container py-5">
        {promotions.length > 0 && (
          <div className="promotions-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              🌟 Todas las promociones
            </button>
            <button 
              className={`filter-btn ${filter === 'monthly' ? 'active' : ''}`}
              onClick={() => setFilter('monthly')}
            >
              📅 Mensuales
            </button>
            <button 
              className={`filter-btn ${filter === 'weekly' ? 'active' : ''}`}
              onClick={() => setFilter('weekly')}
            >
              📆 Semanales
            </button>
            <button 
              className={`filter-btn ${filter === 'daily' ? 'active' : ''}`}
              onClick={() => setFilter('daily')}
            >
              🌅 Diarias
            </button>
          </div>
        )}

        {filteredPromotions.length === 0 ? (
          <div className="no-promotions">
            <h3>🎭 {filter === 'all' ? '¡Estamos preparando algo especial!' : `No hay promociones ${
              filter === 'monthly' ? 'mensuales' : 
              filter === 'weekly' ? 'semanales' : 
              filter === 'daily' ? 'diarias' : ''
            } disponibles`}</h3>
            <p>🌟 Prueba con otra categoría o mantente atento a nuestras redes sociales para futuras ofertas 🌟</p>
            <Link to="/" className="btn btn-primary">
              Ver todos los departamentos
            </Link>
          </div>
        ) : (
          <div className="promotions-grid">
            {filteredPromotions.map((promotion) => (
              <div key={promotion.id} className="promotion-card">
                <div className="discount-badge">
                  🔥 -{calculateDiscount(promotion.originalPrice, promotion.promotionalPrice)} OFF 🎯
                </div>

                <div className="promotion-image-container">
                  <img 
                    src={promotion.image || `/img/img-portada-${promotion.propertyId}.jpg`} 
                    alt={`Departamento ${getPropertyName(promotion.propertyId)}`}
                    className="promotion-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f1f5f9"/%3E%3Ctext x="200" y="150" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="60"%3E🏠%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>

                <div className="card-content">
                  <div className="property-info">
                    <i className="fas fa-map-marker-alt"></i>
                    <span className="property-name">🏠 {getPropertyName(promotion.propertyId)}</span>
                  </div>
                  <h3 className="promotion-title">🎊 {promotion.title}</h3>
                  <p className="promotion-description">✨ {promotion.description}</p>

                  <div className="price-highlight">
                    <div className="price-row">
                      <span className="price-label">💸 Precio regular:</span>
                      <span className="original-price">USD {promotion.originalPrice}</span>
                    </div>
                    <div className="price-row main-price">
                      <span className="price-label">💰 Precio promocional:</span>
                      <span className="promotional-price">USD {promotion.promotionalPrice}</span>
                    </div>
                  </div>

                  {promotion._syncedPrice && (
                    <div className="sync-badge">
                      ⚡ Precio actualizado - {promotion._matchedPeriod === 'monthly' ? '📅 Mensual' : 
                                            promotion._matchedPeriod === 'weekly' ? '📆 Semanal' :
                                            promotion._matchedPeriod === 'daily' ? '🌅 Diario' : '✅ Actualizado'}
                    </div>
                  )}

                  <div className="validity-badge">
                    📅 Válido hasta: {formatDate(promotion.validTo)}
                  </div>

                  {promotion.terms && (
                    <div className="terms-text">
                      📋 {promotion.terms}
                    </div>
                  )}

                  <div className="action-buttons">
                    <Link 
                      to={`/departamentos/${promotion.propertyId}`}
                      className="btn-info"
                    >
                      👁️
                    </Link>
                    <a 
                      href={generateWhatsAppURL(promotion)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp"
                    >
                      📱
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="promotions-cta">
          <div className="cta-content">
            <h3>🔍 ¿No encontraste lo que buscas?</h3>
            <p>🏠 Explora todos nuestros departamentos premium</p>
            <Link to="/" className="btn btn-primary">
              Ver todos los departamentos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionsPage;