import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import { promotionsAPI } from '../../services/api';
import ImageUploader from './ImageUploader';
import './PromotionManager.css';

function PromotionManager() {
  const { getAllProperties } = useAdmin();
  
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState('');
  const [properties, setProperties] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all'); // Filtro por categoría

  const [newPromotion, setNewPromotion] = useState({
    title: '',
    description: '',
    propertyId: '',
    propertyName: '',
    discountType: 'percentage',
    discountValue: 0,
    originalPrice: 0,
    promotionalPrice: 0,
    validFrom: '',
    validTo: '',
    durationType: 'monthly', // monthly, weekly, daily
    durationValue: 1,
    image: '',
    terms: '',
    priority: 0,
    isActive: true,
    isFeatured: false,
    maxRedemptions: null,
    currentRedemptions: 0
  });

  // Mapa de precios base de las propiedades (para sincronización)
  const PROPERTY_PRICES = {
    'moldes-1680': { monthly: 1100, weekly: 350, daily: 65 },
    'santafe-3770': { monthly: 1300, weekly: 420, daily: 75 },
    'santa-fe-3770': { monthly: 1300, weekly: 420, daily: 75 },
    'dorrego-1548': { monthly: 1150, weekly: 380, daily: 70 },
    'convencion-1994': { monthly: 1200, weekly: 400, daily: 70 },
    'ugarteche-2824': { monthly: 1250, weekly: 410, daily: 72 }
  };

  // Función para obtener precio base por duración y propiedad
  const getBasePriceByDuration = (propertyId, durationType) => {
    if (!propertyId || !durationType) return 0;
    
    const basePrices = PROPERTY_PRICES[propertyId];
    if (!basePrices) return 0;
    
    return basePrices[durationType] || 0;
  };

  // Función para determinar la categoría de una promoción basada en su durationType
  const getPromotionCategory = (promotion) => {
    // Usar directamente el campo durationType
    if (promotion.durationType === 'monthly') return 'monthly';
    if (promotion.durationType === 'weekly') return 'weekly';
    if (promotion.durationType === 'daily') return 'daily';
    
    // Fallback al método anterior basado en precio (para promociones sin durationType)
    const price = promotion.originalPrice || promotion.promotionalPrice || 0;
    if (price >= 1000) return 'monthly';
    if (price >= 300) return 'weekly';
    return 'daily';
  };

  // Función para filtrar promociones por categoría
  const getFilteredPromotions = () => {
    if (categoryFilter === 'all') return promotions;
    
    return promotions.filter(promotion => {
      const category = getPromotionCategory(promotion);
      return category === categoryFilter;
    });
  };

  // Función para sincronizar precios automáticamente
  const syncPromotionPrices = async () => {
    if (promotions.length === 0) {
      showMessage('⚠️ No hay promociones para sincronizar', 'error');
      return;
    }

    console.log('🔄 Iniciando sincronización masiva de precios...');
    let updatedCount = 0;
    let errorCount = 0;

    for (const promotion of promotions) {
      try {
        const basePrices = PROPERTY_PRICES[promotion.propertyId];
        
        if (!basePrices) {
          console.log(`⚠️ No se encontraron precios base para: ${promotion.propertyId}`);
          continue;
        }

        // Buscar el precio que mejor coincida
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

        // Si la diferencia es mayor al 5%, actualizar
        const tolerance = 0.05; // 5% de tolerancia
        const isSignificantDifference = smallestDifference > (bestMatch * tolerance);

        if (isSignificantDifference && bestMatch) {
          // Mantener el mismo porcentaje de descuento
          const originalDiscount = promotion.originalPrice - promotion.promotionalPrice;
          const discountPercentage = originalDiscount / promotion.originalPrice;
          const newPromotionalPrice = Math.round(bestMatch * (1 - discountPercentage));

          const updates = {
            originalPrice: bestMatch,
            promotionalPrice: Math.max(newPromotionalPrice, 1), // Mínimo USD 1
          };

          console.log(`🔧 Sincronizando "${promotion.title}":`, {
            from: `USD ${promotion.originalPrice} → USD ${promotion.promotionalPrice}`,
            to: `USD ${updates.originalPrice} → USD ${updates.promotionalPrice}`,
            period: matchedPeriod
          });

          await promotionsAPI.update(promotion._id, updates);
          updatedCount++;
        }

      } catch (error) {
        console.error(`❌ Error al sincronizar "${promotion.title}":`, error);
        errorCount++;
      }
    }

    if (updatedCount > 0) {
      showMessage(`✅ ${updatedCount} promoción(es) sincronizada(s) exitosamente`);
      await loadPromotions(); // Recargar para mostrar los cambios
    } else {
      showMessage('💚 Todas las promociones ya están sincronizadas');
    }

    if (errorCount > 0) {
      showMessage(`⚠️ ${errorCount} error(es) durante la sincronización`, 'error');
    }
  };

  // Función para crear promociones de producción predefinidas
  const createProductionPromotions = async () => {
    console.log('🔄 BOTÓN CREAR PROMOCIONES PRO PRESIONADO');
    
    try {
      const productionPromotions = [
        {
          title: "Descuento por Estadía Prolongada",
          description: "Disfruta de un 15% de descuento en alquileres mensuales. Ideal para ejecutivos, estudiantes de intercambio o familias que necesitan una estadía extendida en Buenos Aires.",
          propertyId: "moldes-1680",
          propertyName: "Belgrano Family Retreat",
          originalPrice: 1100,
          promotionalPrice: 935,
          validFrom: "2025-07-07",
          validTo: "2025-12-31",
          isActive: true,
          isFeatured: true,
          priority: 1,
          terms: "Válido para reservas mensuales. No acumulable con otras ofertas.",
          discountType: "percentage",
          discountValue: 15
        },
        {
          title: "Oferta de Temporada Baja",
          description: "Aprovecha precios especiales durante los meses de invierno. Departamento completamente equipado con calefacción central y todas las comodidades.",
          propertyId: "dorrego-1548",
          propertyName: "Dorrego 1548",
          originalPrice: 1150,
          promotionalPrice: 1012,
          validFrom: "2025-07-07",
          validTo: "2025-09-30",
          isActive: true,
          isFeatured: true,
          priority: 2,
          terms: "Válido para los meses de julio, agosto y septiembre.",
          discountType: "percentage",
          discountValue: 12
        },
        {
          title: "Primera Reserva - Bienvenido a BACONFORT",
          description: "Obtén un descuento especial en tu primera reserva con nosotros. Experimenta la calidad y comodidad que nos caracteriza.",
          propertyId: "convencion-1994",
          propertyName: "Convención 1994",
          originalPrice: 1200,
          promotionalPrice: 1050,
          validFrom: "2025-07-07",
          validTo: "2025-12-31",
          isActive: true,
          isFeatured: true,
          priority: 3,
          terms: "Válido solo para clientes nuevos. Aplica a cualquier tipo de estadía.",
          discountType: "percentage",
          discountValue: 12.5
        }
      ];

      console.log('🏭 Creando promociones de producción...', productionPromotions);
      showMessage('🔄 Creando promociones profesionales...', 'info');
      
      let createdCount = 0;
      let errors = [];

      for (const promotion of productionPromotions) {
        try {
          console.log(`📤 Enviando promoción: "${promotion.title}"`);
          const result = await promotionsAPI.create(promotion);
          createdCount++;
          console.log(`✅ Creada exitosamente: "${promotion.title}"`, result);
        } catch (error) {
          console.error(`❌ Error al crear "${promotion.title}":`, error);
          console.error('📄 Detalles del error:', error.response?.data || error.message);
          errors.push(`${promotion.title}: ${error.message}`);
        }
      }

      if (createdCount > 0) {
        showMessage(`✅ ${createdCount} promociones de producción creadas exitosamente`);
        await loadPromotions();
      }
      
      if (errors.length > 0) {
        console.error('❌ Errores durante la creación:', errors);
        showMessage(`⚠️ ${createdCount} creadas, ${errors.length} errores. Ver consola para detalles.`, 'warning');
      }
      
      if (createdCount === 0) {
        showMessage('❌ No se pudo crear ninguna promoción. Ver consola para detalles.', 'error');
      }
      
    } catch (error) {
      console.error('❌ Error general en createProductionPromotions:', error);
      showMessage('❌ Error al crear promociones: ' + error.message, 'error');
    }
  };

  // Cargar propiedades al inicializar
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const allProperties = getAllProperties();
        const propertiesArray = Object.entries(allProperties).map(([id, property]) => ({
          id,
          ...property
        }));
        setProperties(propertiesArray);
      } catch (error) {
        console.error('❌ Error al cargar propiedades:', error);
      }
    };
    
    loadProperties();
    loadPromotions();
  }, [getAllProperties]);
  
  // Crear un intervalo para recargar promociones periódicamente (cada 30 segundos)
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('🔄 Recargando promociones automáticamente...');
      loadPromotions();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Cargar promociones desde la API
  const loadPromotions = async () => {
    try {
      setLoadingPromotions(true);
      // Añadimos un parámetro timestamp para evitar problemas de caché
      const response = await promotionsAPI.getAll({ 
        active: 'all', 
        _t: new Date().getTime() 
      });
      console.log('🔄 Promociones cargadas:', response.data);
      setPromotions(response.data || []);
    } catch (error) {
      console.error('❌ Error cargando promociones:', error);
      setPromotions([]);
    } finally {
      setLoadingPromotions(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUpdatePromotion = async (id, updates) => {
    try {
      console.log('🔄 Actualizando promoción:', id);
      console.log('📝 Datos a actualizar:', updates);
      
      // Nos aseguramos de que durationType esté incluido en la actualización
      if (!updates.hasOwnProperty('durationType')) {
        console.log('⚠️ durationType no estaba incluido en la actualización');
      }
      
      const response = await promotionsAPI.update(id, updates);
      console.log('✅ Respuesta del servidor:', response);
      
      setEditingPromotion(null);
      showMessage('✅ Promoción actualizada');
      
      // Si se está cambiando el tipo de duración, esto afectará a la categoría
      if (updates.durationType) {
        console.log(`🔄 Cambio de durationType detectado: ${updates.durationType}`);
      }
      
      // Forzamos una recarga completa de las promociones
      await loadPromotions();
      
      // Actualizamos también el estado local para mayor seguridad y para que se actualicen los contadores inmediatamente
      setPromotions(prevPromotions => {
        const updatedPromotions = prevPromotions.map(promo => 
          promo._id === id ? { ...promo, ...updates } : promo
        );
        
        console.log('📊 Conteo actualizado:', {
          total: updatedPromotions.length,
          monthly: updatedPromotions.filter(p => p.durationType === 'monthly').length,
          weekly: updatedPromotions.filter(p => p.durationType === 'weekly').length,
          daily: updatedPromotions.filter(p => p.durationType === 'daily').length
        });
        
        return updatedPromotions;
      });
    } catch (error) {
      console.error('❌ Error al actualizar promoción:', error);
      showMessage('❌ Error al actualizar promoción: ' + error.message, 'error');
    }
  };

  const handleDeletePromotion = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
      try {
        await promotionsAPI.delete(id);
        showMessage('✅ Promoción eliminada');
        await loadPromotions();
      } catch (error) {
        console.error('❌ Error al eliminar promoción:', error);
        showMessage('❌ Error al eliminar promoción: ' + error.message, 'error');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    console.log('🔄 TOGGLE STATUS: Iniciando cambio de estado para ID:', id);
    try {
      const response = await promotionsAPI.toggleStatus(id);
      console.log('✅ TOGGLE STATUS: Respuesta exitosa:', response);
      showMessage('✅ Estado actualizado');
      await loadPromotions();
    } catch (error) {
      console.error('❌ TOGGLE STATUS: Error completo:', error);
      console.error('❌ TOGGLE STATUS: Error message:', error.message);
      console.error('❌ TOGGLE STATUS: Error response:', error.response);
      showMessage('❌ Error al cambiar estado: ' + (error.message || 'Error desconocido'), 'error');
    }
  };

  const handlePriorityChange = async (id, newPriority) => {
    console.log('🔄 PRIORITY CHANGE: Iniciando cambio de prioridad:', { id, newPriority });
    
    // Validar que sea un número válido
    const priority = parseInt(newPriority);
    if (isNaN(priority) || priority < 0 || priority > 10) {
      console.warn('⚠️ PRIORITY CHANGE: Prioridad inválida:', newPriority);
      showMessage('⚠️ La prioridad debe ser un número entre 0 y 10', 'error');
      return;
    }

    try {
      const response = await promotionsAPI.updatePriority(id, priority);
      console.log('✅ PRIORITY CHANGE: Respuesta exitosa:', response);
      showMessage('✅ Prioridad actualizada');
      await loadPromotions();
    } catch (error) {
      console.error('❌ PRIORITY CHANGE: Error completo:', error);
      console.error('❌ PRIORITY CHANGE: Error message:', error.message);
      console.error('❌ PRIORITY CHANGE: Error response:', error.response);
      showMessage('❌ Error al cambiar prioridad: ' + (error.message || 'Error desconocido'), 'error');
    }
  };

  const handleSendToSubscribers = async (promotionId, promotionTitle) => {
    console.log(`📧 SEND TO SUBSCRIBERS: Enviando promoción "${promotionTitle}" a suscriptores...`);
    
    if (!confirm(`¿Enviar la promoción "${promotionTitle}" a todos los suscriptores?`)) {
      return;
    }

    try {
      const response = await promotionsAPI.sendToSubscribers(promotionId);
      console.log('✅ SEND TO SUBSCRIBERS: Éxito:', response);
      showMessage(`✅ Promoción "${promotionTitle}" enviada exitosamente a todos los suscriptores`);
    } catch (error) {
      console.error('❌ SEND TO SUBSCRIBERS: Error completo:', error);
      showMessage(`❌ Error al enviar promoción: ${error.message}`, 'error');
    }
  };

  const handleAddPromotion = async () => {
    console.log('🔧 AGREGANDO PROMOCIÓN:', newPromotion);
    
    try {
      // Validaciones básicas
      if (!newPromotion.title || !newPromotion.description || !newPromotion.propertyId) {
        showMessage('❌ Por favor completa todos los campos obligatorios (título, descripción, propiedad)', 'error');
        return;
      }

      if (!newPromotion.originalPrice || !newPromotion.promotionalPrice) {
        showMessage('❌ Por favor ingresa los precios original y promocional', 'error');
        return;
      }

      if (newPromotion.promotionalPrice >= newPromotion.originalPrice) {
        showMessage('❌ El precio promocional debe ser menor al precio original', 'error');
        return;
      }

      if (!newPromotion.validFrom || !newPromotion.validTo) {
        showMessage('❌ Por favor selecciona las fechas de validez', 'error');
        return;
      }

      // Validar fechas
      const fromDate = new Date(newPromotion.validFrom);
      const toDate = new Date(newPromotion.validTo);
      
      if (toDate <= fromDate) {
        showMessage('❌ La fecha de fin debe ser posterior a la fecha de inicio', 'error');
        return;
      }

      console.log('📝 Creando promoción:', newPromotion);
      
      const result = await promotionsAPI.create(newPromotion);
      console.log('✅ Promoción creada exitosamente:', result);
      
      showMessage('✅ Promoción creada exitosamente');
      
      // Limpiar formulario y cerrar
      setNewPromotion({
        title: '',
        description: '',
        propertyId: '',
        propertyName: '',
        discountType: 'percentage',
        discountValue: 0,
        originalPrice: 0,
        promotionalPrice: 0,
        validFrom: '',
        validTo: '',
        durationType: 'custom',
        durationValue: 1,
        image: '',
        terms: '',
        priority: 0,
        isActive: true,
        isFeatured: false,
        maxRedemptions: null,
        currentRedemptions: 0
      });
      
      setShowAddForm(false);
      await loadPromotions();
      
    } catch (error) {
      console.error('❌ Error al crear promoción:', error);
      showMessage('❌ Error al crear promoción: ' + (error.message || 'Error desconocido'), 'error');
    }
  };

  return (
    <div className="promotion-manager">
      <div className="promotion-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2>🎯 Gestión de Promociones</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={syncPromotionPrices}
            style={{ 
              padding: '12px 20px', 
              fontSize: '14px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#218838';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#28a745';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ⚡ Sincronizar Precios
          </button>
          <button 
            onClick={(e) => {
              console.log('🔄 CLICK EN BOTÓN CREAR PROMOCIONES PRO');
              console.log('📊 Event:', e);
              console.log('🎯 Ejecutando createProductionPromotions...');
              
              e.preventDefault();
              e.stopPropagation();
              
              createProductionPromotions();
            }}
            style={{ 
              padding: '12px 20px', 
              fontSize: '14px', 
              backgroundColor: '#6f42c1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(111, 66, 193, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#5a2d91';
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 4px 8px rgba(111, 66, 193, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#6f42c1';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 2px 4px rgba(111, 66, 193, 0.3)';
            }}
            title="Crear 3 promociones profesionales predefinidas"
          >
            🏭 Crear Promociones Pro
          </button>
          <button 
            className="btn-add" 
            onClick={() => setShowAddForm(true)}
            style={{ padding: '15px 30px', fontSize: '18px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px' }}
          >
            ➕ Agregar Nueva Promoción
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* LISTA DE PROMOCIONES CON BOTONES VISIBLES */}
      <div className="promotions-list" style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '10px' }}>
        <h3 style={{ color: '#333', fontSize: '24px', textAlign: 'center', marginBottom: '20px' }}>
          📋 Promociones Existentes ({getFilteredPromotions().length} de {promotions.length})
        </h3>
        
        {/* FILTROS DE CATEGORÍA */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '15px', 
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setCategoryFilter('all')}
            style={{
              backgroundColor: categoryFilter === 'all' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            🌟 Todas ({promotions.length})
          </button>
          <button
            onClick={() => setCategoryFilter('monthly')}
            style={{
              backgroundColor: categoryFilter === 'monthly' ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            📅 Mensuales ({promotions.filter(p => p.durationType === 'monthly').length})
          </button>
          <button
            onClick={() => setCategoryFilter('weekly')}
            style={{
              backgroundColor: categoryFilter === 'weekly' ? '#ffc107' : '#6c757d',
              color: categoryFilter === 'weekly' ? '#212529' : 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            📆 Semanales ({promotions.filter(p => p.durationType === 'weekly').length})
          </button>
          <button
            onClick={() => setCategoryFilter('daily')}
            style={{
              backgroundColor: categoryFilter === 'daily' ? '#17a2b8' : '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            🌅 Diarias ({promotions.filter(p => p.durationType === 'daily').length})
          </button>
        </div>
        
        {loadingPromotions ? (
          <div className="loading" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
            <p>Cargando promociones...</p>
          </div>
        ) : getFilteredPromotions().length === 0 ? (
          <div className="no-promotions" style={{ textAlign: 'center', padding: '40px' }}>
            {promotions.length === 0 ? (
              <>
                <p>No hay promociones creadas aún.</p>
                <button onClick={() => setShowAddForm(true)}>Crear Primera Promoción</button>
              </>
            ) : (
              <p>No hay promociones en la categoría seleccionada.</p>
            )}
          </div>
        ) : (
          <div>
            {getFilteredPromotions().map(promotion => {
              // Usar directamente durationType en lugar de llamar a getPromotionCategory
              const category = promotion.durationType || 'monthly';
              const categoryInfo = {
                monthly: { label: '📅 Mensual', color: '#28a745' },
                weekly: { label: '📆 Semanal', color: '#ffc107' },
                daily: { label: '🌅 Diaria', color: '#17a2b8' },
                custom: { label: '🎯 Personalizada', color: '#6c757d' }
              };
              
              return (
              <div key={promotion._id} style={{
                backgroundColor: '#ffffff',
                border: '4px solid #dc3545',
                borderRadius: '12px',
                margin: '20px 0',
                padding: '25px',
                boxShadow: '0 6px 12px rgba(220,53,69,0.3)'
              }}>
                
                {/* INFO BÁSICA CON INDICADOR DE TIPO */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '10px',
                  marginBottom: '25px',
                  border: '2px solid #007bff',
                  position: 'relative'
                }}>
                  {/* Etiqueta de categoría */}
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '10px',
                    backgroundColor: categoryInfo[category].color,
                    color: category === 'weekly' ? '#212529' : 'white',
                    padding: '4px 12px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    zIndex: 2
                  }}>
                    {categoryInfo[category].label}
                  </div>
                  
                  {/* Indicador de tipo de promoción */}
                  {(promotion.title.toLowerCase().includes('test') || 
                    promotion.title.toLowerCase().includes('prueba') || 
                    promotion.title.toLowerCase().includes('demo') ||
                    promotion.title.includes('2 Semanas')) && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '10px',
                      backgroundColor: '#ff4757',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      animation: 'pulse 2s infinite'
                    }}>
                      🧪 PRUEBA/TEST
                    </div>
                  )}
                  
                  <h2 style={{ color: '#dc3545', fontSize: '22px', marginBottom: '15px' }}>
                    🎯 {promotion.title}
                  </h2>
                  <p style={{ fontSize: '16px', marginBottom: '12px' }}>
                    🏠 <strong>Propiedad:</strong> {promotion.propertyName}
                  </p>
                  <p style={{ fontSize: '16px', marginBottom: '12px' }}>
                    ⏰ <strong>Duración:</strong> {
                      promotion.durationType === 'monthly' ? '📅 Mensual' :
                      promotion.durationType === 'weekly' ? '📆 Semanal' :
                      promotion.durationType === 'daily' ? '📰 Diario' :
                      '🎯 Personalizada'
                    }
                  </p>
                  <p style={{ fontSize: '16px', marginBottom: '12px' }}>
                    💰 <strong>Precio:</strong> USD {promotion.originalPrice} → USD {promotion.promotionalPrice}
                    {(() => {
                      const discount = promotion.originalPrice - promotion.promotionalPrice;
                      const percentage = ((discount / promotion.originalPrice) * 100).toFixed(1);
                      return (
                        <span style={{ color: '#28a745', fontWeight: 'bold', marginLeft: '10px' }}>
                          ({percentage}% OFF)
                        </span>
                      );
                    })()}
                  </p>
                  <p style={{ fontSize: '16px', marginBottom: '12px' }}>
                    📅 <strong>Válida:</strong> {new Date(promotion.validFrom).toLocaleDateString()} - {new Date(promotion.validTo).toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    🟢 Estado: <span style={{ color: promotion.isActive ? 'green' : 'red' }}>
                      {promotion.isActive ? 'ACTIVA' : 'INACTIVA'}
                    </span>
                    {promotion.isFeatured && (
                      <span style={{ 
                        backgroundColor: '#ffd700',
                        color: '#333',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        marginLeft: '10px'
                      }}>
                        ⭐ DESTACADA
                      </span>
                    )}
                  </p>
                </div>

                {/* BOTONES DE CONTROL */}
                <div style={{
                  backgroundColor: '#fff3cd',
                  border: '3px solid #ffc107',
                  borderRadius: '12px',
                  padding: '25px',
                  textAlign: 'center'
                }}>
                  
                  <h3 style={{
                    color: '#856404',
                    fontSize: '20px',
                    marginBottom: '20px',
                    fontWeight: 'bold'
                  }}>
                    🔧 CONTROLES DE ADMINISTRACIÓN 🔧
                  </h3>

                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    
                    {/* BOTÓN EDITAR */}
                    <button 
                      onClick={() => {
                        console.log('EDITANDO:', promotion.title);
                        setEditingPromotion(promotion);
                      }}
                      style={{
                        backgroundColor: '#28a745',
                        color: '#ffffff',
                        border: '3px solid #155724',
                        borderRadius: '8px',
                        padding: '15px 25px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        minWidth: '120px',
                        minHeight: '60px',
                        boxShadow: '0 4px 8px rgba(40,167,69,0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.backgroundColor = '#218838';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.backgroundColor = '#28a745';
                      }}
                    >
                      ✏️ EDITAR
                    </button>

                    {/* BOTÓN ELIMINAR */}
                    <button 
                      onClick={() => {
                        if (confirm(`¿ELIMINAR "${promotion.title}"?`)) {
                          handleDeletePromotion(promotion._id);
                        }
                      }}
                      style={{
                        backgroundColor: '#dc3545',
                        color: '#ffffff',
                        border: '3px solid #721c24',
                        borderRadius: '8px',
                        padding: '15px 25px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        minWidth: '120px',
                        minHeight: '60px',
                        boxShadow: '0 4px 8px rgba(220,53,69,0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.backgroundColor = '#c82333';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.backgroundColor = '#dc3545';
                      }}
                    >
                      🗑️ ELIMINAR
                    </button>

                    {/* BOTÓN ACTIVAR/PAUSAR */}
                    <button 
                      onClick={(e) => {
                        console.log('🔄 BOTÓN PAUSAR/ACTIVAR PRESIONADO');
                        console.log('📊 Promoción:', promotion.title);
                        console.log('📋 ID:', promotion._id);
                        console.log('🔄 Estado actual:', promotion.isActive ? 'ACTIVA' : 'INACTIVA');
                        console.log('🎯 Nuevo estado será:', promotion.isActive ? 'INACTIVA' : 'ACTIVA');
                        
                        e.preventDefault();
                        e.stopPropagation();
                        
                        handleToggleStatus(promotion._id);
                      }}
                      style={{
                        backgroundColor: promotion.isActive ? '#ffc107' : '#17a2b8',
                        color: promotion.isActive ? '#212529' : '#ffffff',
                        border: `3px solid ${promotion.isActive ? '#d39e00' : '#117a8b'}`,
                        borderRadius: '8px',
                        padding: '15px 25px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        minWidth: '120px',
                        minHeight: '60px',
                        boxShadow: `0 4px 8px ${promotion.isActive ? 'rgba(255,193,7,0.3)' : 'rgba(23,162,184,0.3)'}`,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      {promotion.isActive ? '⏸️ PAUSAR' : '▶️ ACTIVAR'}
                    </button>

                    {/* BOTÓN ENVIAR A SUSCRIPTORES */}
                    <button 
                      onClick={(e) => {
                        console.log('📧 BOTÓN ENVIAR A SUSCRIPTORES PRESIONADO');
                        console.log('📊 Promoción:', promotion.title);
                        console.log('📋 ID:', promotion._id);
                        
                        e.preventDefault();
                        e.stopPropagation();
                        
                        handleSendToSubscribers(promotion._id, promotion.title);
                      }}
                      style={{
                        backgroundColor: '#6f42c1',
                        color: '#ffffff',
                        border: '3px solid #4c2a85',
                        borderRadius: '8px',
                        padding: '15px 25px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        minWidth: '120px',
                        minHeight: '60px',
                        boxShadow: '0 4px 8px rgba(111,66,193,0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.backgroundColor = '#5a2d91';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.backgroundColor = '#6f42c1';
                      }}
                    >
                      📧 ENVIAR A SUSCRIPTORES
                    </button>

                    {/* CONTROL PRIORIDAD */}
                    <div style={{
                      backgroundColor: '#6f42c1',
                      border: '3px solid #4c2a85',
                      borderRadius: '8px',
                      padding: '15px 25px',
                      minWidth: '120px',
                      minHeight: '60px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 8px rgba(111,66,193,0.3)'
                    }}>
                      <label style={{
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginBottom: '8px'
                      }}>
                        ⭐ PRIORIDAD
                      </label>
                      <input
                        type="number"
                        defaultValue={promotion.priority || 0}
                        min="0"
                        max="10"
                        onBlur={(e) => {
                          const newValue = e.target.value;
                          const currentValue = promotion.priority || 0;
                          
                          // Solo actualizar si el valor realmente cambió
                          if (parseInt(newValue) !== currentValue) {
                            console.log('🔄 PRIORIDAD CAMBIÓ:', {
                              promocion: promotion.title,
                              anterior: currentValue,
                              nueva: newValue
                            });
                            handlePriorityChange(promotion._id, newValue);
                          }
                        }}
                        onKeyPress={(e) => {
                          // Permitir Enter para confirmar cambio
                          if (e.key === 'Enter') {
                            e.target.blur();
                          }
                        }}
                        style={{
                          width: '60px',
                          padding: '8px',
                          textAlign: 'center',
                          border: '2px solid #4c2a85',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                        title="Presiona Enter o haz click fuera para guardar"
                      />
                    </div>

                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* FORMULARIO DE EDICIÓN */}
      {editingPromotion && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80%',
            overflow: 'auto'
          }}>
            <h3>✏️ Editando: {editingPromotion.title}</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Título:</label>
              <input
                type="text"
                value={editingPromotion.title}
                onChange={(e) => setEditingPromotion(prev => ({ ...prev, title: e.target.value }))}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Descripción:</label>
              <textarea
                value={editingPromotion.description}
                onChange={(e) => setEditingPromotion(prev => ({ ...prev, description: e.target.value }))}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', height: '100px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tipo de Duración:</label>
              <select
                value={editingPromotion.durationType || 'monthly'}
                onChange={(e) => setEditingPromotion(prev => ({ ...prev, durationType: e.target.value }))}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
              >
                <option value="monthly">📅 Mensual</option>
                <option value="weekly">📆 Semanal</option>
                <option value="daily">📰 Diario</option>
                <option value="custom">🎯 Personalizada</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Precio Original:</label>
              <input
                type="number"
                value={editingPromotion.originalPrice}
                onChange={(e) => setEditingPromotion(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Precio Promocional:</label>
              <input
                type="number"
                value={editingPromotion.promotionalPrice}
                onChange={(e) => setEditingPromotion(prev => ({ ...prev, promotionalPrice: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              <button 
                onClick={() => handleUpdatePromotion(editingPromotion._id, editingPromotion)}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                ✅ Guardar Cambios
              </button>
              <button 
                onClick={() => setEditingPromotion(null)}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMULARIO DE NUEVA PROMOCIÓN */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '80%',
            overflow: 'auto'
          }}>
            <h3 style={{ color: '#007bff', marginBottom: '25px' }}>
              ➕ Nueva Promoción
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Título */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  📝 Título *
                </label>
                <input
                  type="text"
                  value={newPromotion.title}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Descuento por Estadía Prolongada"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>

              {/* Descripción */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  📄 Descripción *
                </label>
                <textarea
                  value={newPromotion.description}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe los beneficios y condiciones de la promoción..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Propiedad */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  🏠 Propiedad *
                </label>
                <select
                  value={newPromotion.propertyId}
                  onChange={(e) => {
                    const selectedProperty = properties.find(p => p.id === e.target.value);
                    const propertyId = e.target.value;
                    setNewPromotion(prev => ({ 
                      ...prev, 
                      propertyId: propertyId,
                      propertyName: selectedProperty ? selectedProperty.title : '',
                      // Auto-asignar precio base según la propiedad y duración actual
                      originalPrice: getBasePriceByDuration(propertyId, prev.durationType)
                    }));
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Seleccionar propiedad</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Duración */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  ⏱️ Tipo de Duración *
                </label>
                <select
                  value={newPromotion.durationType}
                  onChange={(e) => {
                    const durationType = e.target.value;
                    setNewPromotion(prev => ({ 
                      ...prev, 
                      durationType: durationType,
                      // Auto-asignar precios base según la duración y propiedad
                      originalPrice: getBasePriceByDuration(prev.propertyId, durationType)
                    }));
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                >
                  <option value="monthly">📅 Mensual</option>
                  <option value="weekly">📆 Semanal</option>
                  <option value="daily">🗓️ Diaria</option>
                </select>
              </div>

              {/* Prioridad */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  ⭐ Prioridad
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={newPromotion.priority}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>

              {/* Precio Original */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  💰 Precio Original *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPromotion.originalPrice}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>

              {/* Precio Promocional */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  🏷️ Precio Promocional *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPromotion.promotionalPrice}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, promotionalPrice: parseFloat(e.target.value) || 0 }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>

              {/* Fecha de Inicio */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  📅 Fecha de Inicio *
                </label>
                <input
                  type="date"
                  value={newPromotion.validFrom}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, validFrom: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>

              {/* Fecha de Fin */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  📅 Fecha de Fin *
                </label>
                <input
                  type="date"
                  value={newPromotion.validTo}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, validTo: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>

              {/* Términos y Condiciones */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  📋 Términos y Condiciones
                </label>
                <textarea
                  value={newPromotion.terms}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="Condiciones específicas de la promoción..."
                  rows="2"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Opciones */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={newPromotion.isActive}
                    onChange={(e) => setNewPromotion(prev => ({ ...prev, isActive: e.target.checked }))
                    }
                  />
                  ✅ Activar inmediatamente
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={newPromotion.isFeatured}
                    onChange={(e) => setNewPromotion(prev => ({ ...prev, isFeatured: e.target.checked }))
                    }
                  />
                  ⭐ Promoción destacada
                </label>
              </div>

              {/* Calculadora de Descuento */}
              {newPromotion.originalPrice > 0 && newPromotion.promotionalPrice > 0 && (
                <div style={{ gridColumn: '1 / -1', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                  <strong>📊 Descuento: </strong>
                  <span style={{ color: '#28a745', fontSize: '18px', fontWeight: 'bold' }}>
                    {Math.round(((newPromotion.originalPrice - newPromotion.promotionalPrice) / newPromotion.originalPrice) * 100)}%
                  </span>
                  <span style={{ marginLeft: '15px', color: '#666' }}>
                    Ahorro: ${(newPromotion.originalPrice - newPromotion.promotionalPrice).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '30px', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleAddPromotion}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                ✅ Crear Promoción
              </button>
              <button 
                onClick={() => setShowAddForm(false)}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS ADICIONALES PARA PROMOCIONES */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        .test-promotion-badge {
          animation: pulse 2s infinite;
        }
        
        .production-indicator {
          background: linear-gradient(45deg, #28a745, #20c997);
          color: white;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: bold;
        }
        
        @media (max-width: 768px) {
          .promotion-header {
            flex-direction: column;
            align-items: stretch;
          }
          .promotion-header > div {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default PromotionManager;
