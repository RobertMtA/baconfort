import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import { promotionsAPI } from '../../services/api';
import ImageUploader from './ImageUploader';
import './PromotionManager.css';

function PromotionManager() {
  console.log('🔧 DEBUG: PromotionManager cargando...');
  const { getAllProperties } = useAdmin();
  
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState('');
  const [properties, setProperties] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);

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

  // Mapa de precios base de las propiedades (para sincronización)
  const PROPERTY_PRICES = {
    'moldes-1680': { monthly: 1100, weekly: 350, daily: 65 },
    'santafe-3770': { monthly: 1300, weekly: 420, daily: 75 },
    'santa-fe-3770': { monthly: 1300, weekly: 420, daily: 75 },
    'dorrego-1548': { monthly: 1150, weekly: 380, daily: 70 },
    'convencion-1994': { monthly: 1200, weekly: 400, daily: 70 },
    'ugarteche-2824': { monthly: 1250, weekly: 410, daily: 72 }
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
    const productionPromotions = [
      {
        title: "Descuento por Estadía Prolongada",
        description: "Disfruta de un 15% de descuento en alquileres mensuales. Ideal para ejecutivos, estudiantes de intercambio o familias que necesitan una estadía extendida en Buenos Aires.",
        propertyId: "moldes-1680",
        propertyName: "Belgrano Family Retreat",
        originalPrice: 1100,
        promotionalPrice: 935,
        validFrom: "2025-07-06",
        validTo: "2025-12-31",
        isActive: true,
        isFeatured: true,
        priority: 1
      },
      {
        title: "Oferta de Temporada Baja",
        description: "Aprovecha precios especiales durante los meses de invierno. Departamento completamente equipado con calefacción central y todas las comodidades.",
        propertyId: "dorrego-1548",
        propertyName: "Dorrego 1548",
        originalPrice: 1150,
        promotionalPrice: 1012,
        validFrom: "2025-07-06",
        validTo: "2025-09-30",
        isActive: true,
        isFeatured: true,
        priority: 2
      },
      {
        title: "Primera Reserva - Bienvenido a BACONFORT",
        description: "Obtén un descuento especial en tu primera reserva con nosotros. Experimenta la calidad y comodidad que nos caracteriza.",
        propertyId: "convencion-1994",
        propertyName: "Convención 1994",
        originalPrice: 1200,
        promotionalPrice: 1050,
        validFrom: "2025-07-06",
        validTo: "2025-12-31",
        isActive: true,
        isFeatured: true,
        priority: 3
      }
    ];

    console.log('🏭 Creando promociones de producción...');
    let createdCount = 0;

    for (const promotion of productionPromotions) {
      try {
        await promotionsAPI.create(promotion);
        createdCount++;
        console.log(`✅ Creada: "${promotion.title}"`);
      } catch (error) {
        console.error(`❌ Error al crear "${promotion.title}":`, error);
      }
    }

    if (createdCount > 0) {
      showMessage(`✅ ${createdCount} promociones de producción creadas`);
      await loadPromotions();
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

  // Cargar promociones desde la API
  const loadPromotions = async () => {
    try {
      setLoadingPromotions(true);
      const response = await promotionsAPI.getAll({ active: 'all' });
      console.log('🔍 DEBUG: Promociones cargadas:', response.data);
      setPromotions(response.data || []);
    } catch (error) {
      console.error('❌ Error al cargar promociones:', error);
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
      await promotionsAPI.update(id, updates);
      setEditingPromotion(null);
      showMessage('✅ Promoción actualizada');
      await loadPromotions();
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

  const handleAddPromotion = async () => {
    console.log('🔧 AGREGANDO PROMOCIÓN:', newPromotion);
    // Lógica para agregar promoción...
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
            onClick={createProductionPromotions}
            style={{ 
              padding: '12px 20px', 
              fontSize: '14px', 
              backgroundColor: '#6f42c1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#5a2d91';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#6f42c1';
              e.target.style.transform = 'scale(1)';
            }}
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
        <h3 style={{ color: '#333', fontSize: '24px', textAlign: 'center', marginBottom: '30px' }}>
          📋 Promociones Existentes ({promotions.length})
        </h3>
        
        {loadingPromotions ? (
          <div className="loading" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
            <p>Cargando promociones...</p>
          </div>
        ) : promotions.length === 0 ? (
          <div className="no-promotions" style={{ textAlign: 'center', padding: '40px' }}>
            <p>No hay promociones creadas aún.</p>
            <button onClick={() => setShowAddForm(true)}>Crear Primera Promoción</button>
          </div>
        ) : (
          <div>
            {promotions.map(promotion => (
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
            ))}
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
