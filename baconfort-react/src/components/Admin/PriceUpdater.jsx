import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import './PriceUpdater.css';

function PriceUpdater({ properties, onClose }) {
  console.log('🔥 PRICE UPDATER: Componente renderizado');
  console.log('🔥 PRICE UPDATER: Properties recibidas:', properties);
  console.log('🔥 PRICE UPDATER: onClose function:', onClose);
  
  const { updateProperty, getAllProperties } = useAdmin();
  const [priceData, setPriceData] = useState({});
  const [message, setMessage] = useState('');
  const [updateMode, setUpdateMode] = useState('individual'); // 'individual' or 'bulk'
  const [bulkPercentage, setBulkPercentage] = useState('');
  const [bulkType, setBulkType] = useState('increase'); // 'increase' or 'decrease'

  const propertyList = Object.values(properties || {});
  console.log('🔥 PRICE UPDATER: PropertyList convertida:', propertyList);

  useEffect(() => {
    // Inicializar datos de precios
    console.log('🔄 PRICE UPDATER: useEffect ejecutándose');
    console.log('🔄 PRICE UPDATER: Properties en useEffect:', properties);
    console.log('🔄 PRICE UPDATER: Properties keys:', Object.keys(properties || {}));
    
    const currentPropertyList = Object.values(properties || {});
    console.log('🔄 PRICE UPDATER: currentPropertyList length:', currentPropertyList.length);
    
    const initialPriceData = {};
    currentPropertyList.forEach(property => {
      console.log(`🔄 PRICE UPDATER: Inicializando precios para ${property.id}:`, property.prices);
      initialPriceData[property.id] = {
        monthly: property.prices?.monthly || '',
        weekly: property.prices?.weekly || '',
        daily: property.prices?.daily || ''
      };
    });
    
    console.log('🔄 PRICE UPDATER: PriceData inicializado:', initialPriceData);
    console.log('🔄 PRICE UPDATER: PriceData keys:', Object.keys(initialPriceData));
    setPriceData(initialPriceData);
  }, [properties]);

  const handlePriceChange = (propertyId, priceType, value) => {
    setPriceData(prev => ({
      ...prev,
      [propertyId]: {
        ...prev[propertyId],
        [priceType]: value
      }
    }));
  };

  const extractNumber = (priceString) => {
    return parseInt(priceString.replace(/[^\d]/g, '')) || 0;
  };

  const formatPrice = (number) => {
    return `USD ${number}`;
  };

  const applyBulkUpdate = () => {
    console.log('📊 BULK UPDATE: Función applyBulkUpdate ejecutada!');
    console.log('📊 BULK UPDATE: Aplicando actualización masiva...');
    console.log('📊 BULK UPDATE: Porcentaje:', bulkPercentage);
    console.log('📊 BULK UPDATE: Tipo:', bulkType);
    
    if (!bulkPercentage || bulkPercentage <= 0) {
      setMessage('❌ Ingresa un porcentaje válido');
      console.error('❌ BULK UPDATE: Porcentaje inválido');
      return;
    }

    const percentage = parseFloat(bulkPercentage);
    const factor = bulkType === 'increase' ? (1 + percentage / 100) : (1 - percentage / 100);

    const updatedPriceData = {};
    
    propertyList.forEach(property => {
      const monthlyNum = extractNumber(property.prices.monthly);
      const weeklyNum = extractNumber(property.prices.weekly);
      const dailyNum = extractNumber(property.prices.daily);

      updatedPriceData[property.id] = {
        monthly: formatPrice(Math.round(monthlyNum * factor)),
        weekly: formatPrice(Math.round(weeklyNum * factor)),
        daily: formatPrice(Math.round(dailyNum * factor))
      };
    });

    setPriceData(updatedPriceData);
    setMessage(`✅ Precios ${bulkType === 'increase' ? 'aumentados' : 'reducidos'} en ${percentage}%`);
    setTimeout(() => setMessage(''), 3000);
  };

  const saveAllPrices = async () => {
    console.log('💰 PRICE UPDATE: Función saveAllPrices ejecutada!');
    console.log('💰 PRICE UPDATE: Guardando todos los precios...');
    console.log('💰 PRICE UPDATE: Datos a guardar:', priceData);
    console.log('💰 PRICE UPDATE: PropertyList length:', propertyList.length);
    console.log('💰 PRICE UPDATE: PropertyList:', propertyList.map(p => p.id));
    console.log('💰 PRICE UPDATE: updateProperty function:', updateProperty);
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      // Procesar cada propiedad secuencialmente para mejor control
      for (let index = 0; index < propertyList.length; index++) {
        const property = propertyList[index];
        console.log(`💰 PRICE UPDATE: [${index}] Procesando ${property.id}...`);
        console.log(`💰 PRICE UPDATE: [${index}] Precios actuales:`, property.prices);
        console.log(`💰 PRICE UPDATE: [${index}] Nuevos precios:`, priceData[property.id]);
        
        // Asegurar que todos los campos requeridos estén presentes con valores válidos > 0
        const getValidPrice = (newValue, currentValue, fallback = 100) => {
          const value = parseFloat(newValue) || parseFloat(currentValue) || fallback;
          return value > 0 ? value : fallback;
        };
        
        const completePrice = {
          monthly: getValidPrice(priceData[property.id].monthly, property.prices?.monthly, 1500),
          weekly: getValidPrice(priceData[property.id].weekly, property.prices?.weekly, 500),
          daily: getValidPrice(priceData[property.id].daily, property.prices?.daily, 100),
          currency: property.prices?.currency || 'USD'
        };
        
        console.log(`💰 PRICE UPDATE: [${index}] Precio completo a enviar:`, completePrice);
        console.log(`💰 PRICE UPDATE: [${index}] Validando precios: monthly=${completePrice.monthly} (${typeof completePrice.monthly}), weekly=${completePrice.weekly} (${typeof completePrice.weekly}), daily=${completePrice.daily} (${typeof completePrice.daily})`);
        
        // Validación adicional antes de enviar
        if (completePrice.monthly <= 0 || completePrice.weekly <= 0 || completePrice.daily <= 0) {
          console.error(`❌ PRICE UPDATE: [${index}] Precios inválidos detectados para ${property.id}:`, completePrice);
          errorCount++;
          continue; // Saltar esta propiedad
        }
        
        try {
          console.log(`💰 PRICE UPDATE: [${index}] 🚀 INICIANDO actualización de ${property.id}...`);
          console.log(`💰 PRICE UPDATE: [${index}] 📝 Datos a enviar:`, {
            prices: completePrice
          });
          
          const result = await updateProperty(property.id, {
            prices: completePrice
          });
          
          console.log(`💰 PRICE UPDATE: [${index}] ✅ RESULTADO EXITOSO para ${property.id}:`, result);
          console.log(`💰 PRICE UPDATE: [${index}] 📊 Nuevo estado de precios esperado:`, completePrice);
          successCount++;
          
          // 🔥 EMITIR EVENTO PERSONALIZADO para notificar al frontend
          const priceUpdateEvent = new CustomEvent('baconfort-prices-updated', {
            detail: {
              propertyId: property.id,
              prices: {
                daily: `USD ${completePrice.daily}`,
                weekly: `USD ${completePrice.weekly}`,
                monthly: `USD ${completePrice.monthly}`,
                currency: completePrice.currency
              },
              timestamp: Date.now()
            }
          });
          window.dispatchEvent(priceUpdateEvent);
          console.log(`📡 PRICE UPDATE: [${index}] ✨ EVENTO EMITIDO para ${property.id}:`);
          console.log(`📡 PRICE UPDATE: [${index}] - propertyId: "${priceUpdateEvent.detail.propertyId}"`);
          console.log(`📡 PRICE UPDATE: [${index}] - prices:`, priceUpdateEvent.detail.prices);
          console.log(`📡 PRICE UPDATE: [${index}] - timestamp:`, priceUpdateEvent.detail.timestamp);
          
          // Verificar inmediatamente si el cambio se aplicó
          setTimeout(() => {
            const updatedProperty = getAllProperties()[property.id];
            console.log(`💰 PRICE UPDATE: [${index}] 🔍 Verificación post-actualización:`, {
              propertyId: property.id,
              oldPrices: property.prices,
              sentPrices: completePrice,
              currentPrices: updatedProperty?.prices,
              success: JSON.stringify(updatedProperty?.prices) === JSON.stringify(completePrice)
            });
          }, 500);
          
        } catch (error) {
          console.error(`❌ PRICE UPDATE: [${index}] Error al actualizar ${property.id}:`, error);
          errorCount++;
        }
      }

      if (errorCount === 0) {
        setMessage(`✅ Todos los precios han sido actualizados (${successCount} propiedades) - Frontend notificado`);
        console.log(`✅ PRICE UPDATE: Guardado exitoso - ${successCount} propiedades actualizadas`);
        console.log(`📡 PRICE UPDATE: ${successCount} eventos emitidos para sincronización con frontend`);
      } else {
        setMessage(`⚠️ ${successCount} propiedades actualizadas, ${errorCount} con errores`);
        console.log(`⚠️ PRICE UPDATE: Guardado parcial - ${successCount} exitosas, ${errorCount} errores`);
      }
      
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (error) {
      console.error('❌ PRICE UPDATE: Error general al guardar:', error);
      setMessage('❌ Error al actualizar los precios');
    }
  };

  const resetPrices = () => {
    console.log('🔄 PRICE UPDATE: Función resetPrices ejecutada!');
    console.log('🔄 PRICE UPDATE: Reseteando precios...');
    const originalPriceData = {};
    propertyList.forEach(property => {
      originalPriceData[property.id] = {
        monthly: property.prices.monthly,
        weekly: property.prices.weekly,
        daily: property.prices.daily
      };
    });
    setPriceData(originalPriceData);
    setMessage('🔄 Precios reseteados');
    console.log('✅ PRICE UPDATE: Reset completado');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="price-updater">
      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : message.includes('🔄') ? 'info' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Modo de actualización */}
      <div className="update-mode-selector">
        <h4><i className="fas fa-cog"></i> Modo de Actualización</h4>
        <div className="mode-buttons">
          <button
            className={`mode-btn ${updateMode === 'individual' ? 'active' : ''}`}
            onClick={(e) => {
              console.log('🔥 MODE: Botón "Individual" clickeado!');
              e.preventDefault();
              e.stopPropagation();
              setUpdateMode('individual');
            }}
          >
            <i className="fas fa-edit"></i>
            Individual
          </button>
          <button
            className={`mode-btn ${updateMode === 'bulk' ? 'active' : ''}`}
            onClick={(e) => {
              console.log('🔥 MODE: Botón "Masivo" clickeado!');
              e.preventDefault();
              e.stopPropagation();
              setUpdateMode('bulk');
            }}
          >
            <i className="fas fa-percentage"></i>
            Masivo
          </button>
        </div>
      </div>

      {/* Actualización masiva */}
      {updateMode === 'bulk' && (
        <div className="bulk-update-section">
          <h4><i className="fas fa-percentage"></i> Actualización Masiva</h4>
          <div className="bulk-controls">
            <div className="bulk-input-group">
              <select 
                className="form-control"
                value={bulkType}
                onChange={(e) => setBulkType(e.target.value)}
              >
                <option value="increase">Aumentar</option>
                <option value="decrease">Reducir</option>
              </select>
              
              <input
                type="number"
                className="form-control"
                value={bulkPercentage}
                onChange={(e) => setBulkPercentage(e.target.value)}
                placeholder="Porcentaje"
                min="0"
                max="100"
                step="0.1"
              />
              
              <span className="percentage-label">%</span>
              
              <button
                className="btn btn-warning"
                onClick={(e) => {
                  console.log('🔥 BULK UPDATE: Botón "Aplicar" clickeado!');
                  console.log('🔥 BULK UPDATE: Event:', e);
                  e.preventDefault();
                  e.stopPropagation();
                  applyBulkUpdate();
                }}
                disabled={!bulkPercentage}
              >
                <i className="fas fa-calculator"></i>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de propiedades y precios */}
      <div className="properties-prices">
        <h4><i className="fas fa-dollar-sign"></i> Precios por Propiedad</h4>
        
        <div className="properties-grid">
          {propertyList.map(property => (
            <div key={property.id} className="property-price-card">
              <div className="property-header">
                <h5>{property.title}</h5>
                <small>{property.address}</small>
              </div>
              
              <div className="price-inputs">
                <div className="price-group">
                  <label>
                    <i className="fas fa-calendar"></i>
                    Mensual
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={priceData[property.id]?.monthly || ''}
                    onChange={(e) => handlePriceChange(property.id, 'monthly', e.target.value)}
                    placeholder="USD 1200"
                  />
                </div>

                <div className="price-group">
                  <label>
                    <i className="fas fa-calendar-week"></i>
                    Semanal
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={priceData[property.id]?.weekly || ''}
                    onChange={(e) => handlePriceChange(property.id, 'weekly', e.target.value)}
                    placeholder="USD 400"
                  />
                </div>

                <div className="price-group">
                  <label>
                    <i className="fas fa-calendar-day"></i>
                    Diario
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={priceData[property.id]?.daily || ''}
                    onChange={(e) => handlePriceChange(property.id, 'daily', e.target.value)}
                    placeholder="USD 70"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="action-buttons">
        {/* Botón de diagnóstico temporal */}
        <button 
          className="btn btn-warning btn-sm"
          onClick={(e) => {
            e.preventDefault();
            console.log('🔍 DIAGNÓSTICO: Estado actual del PriceUpdater');
            console.log('🔍 DIAGNÓSTICO: priceData:', priceData);
            console.log('🔍 DIAGNÓSTICO: properties recibidas:', properties);
            console.log('🔍 DIAGNÓSTICO: propertyList procesada:', propertyList);
            
            // Verificar estado actual en AdminContext
            const currentProperties = getAllProperties();
            console.log('🔍 DIAGNÓSTICO: AdminContext - getAllProperties():', currentProperties);
            
            // Verificar localStorage
            const storedData = localStorage.getItem('baconfort_admin_properties');
            console.log('🔍 DIAGNÓSTICO: localStorage data:', storedData ? JSON.parse(storedData) : 'No data');
            
            // Comparar un precio específico
            const testProperty = propertyList[0];
            if (testProperty) {
              console.log('🔍 DIAGNÓSTICO: Comparación propiedad test:', {
                propertyId: testProperty.id,
                originalPrices: testProperty.prices,
                newPrices: priceData[testProperty.id],
                adminContextPrices: currentProperties[testProperty.id]?.prices
              });
            }
          }}
          style={{ fontSize: '12px', marginRight: '10px' }}
        >
          🔍 Debug
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={(e) => {
            console.log('🔥 PRICE UPDATE: Botón "Resetear" clickeado!');
            console.log('🔥 PRICE UPDATE: Event:', e);
            e.preventDefault();
            e.stopPropagation();
            resetPrices();
          }}
        >
          <i className="fas fa-undo"></i>
          Resetear
        </button>
        
        <button 
          className="btn btn-outline-secondary"
          onClick={(e) => {
            console.log('🔥 PRICE UPDATE: Botón "Cancelar" clickeado!');
            console.log('🔥 PRICE UPDATE: Event:', e);
            console.log('🔥 PRICE UPDATE: onClose function:', onClose);
            e.preventDefault();
            e.stopPropagation();
            if (onClose && typeof onClose === 'function') {
              onClose();
            } else {
              console.error('❌ PRICE UPDATE: onClose no es una función válida');
            }
          }}
        >
          <i className="fas fa-times"></i>
          Cancelar
        </button>
        
        <button 
          className="btn btn-primary"
          onClick={(e) => {
            console.log('🔥 PRICE UPDATE: Botón "Guardar Todos los Precios" clickeado!');
            console.log('🔥 PRICE UPDATE: Event:', e);
            console.log('🔥 PRICE UPDATE: Event type:', e.type);
            console.log('🔥 PRICE UPDATE: Button element:', e.target);
            console.log('🔥 PRICE UPDATE: Current priceData:', priceData);
            console.log('🔥 PRICE UPDATE: PropertyList:', propertyList);
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🔥 PRICE UPDATE: A punto de llamar saveAllPrices...');
            saveAllPrices();
            console.log('🔥 PRICE UPDATE: saveAllPrices llamado!');
          }}
        >
          <i className="fas fa-save"></i>
          Guardar Todos los Precios
        </button>
      </div>
    </div>
  );
}

export default PriceUpdater;
