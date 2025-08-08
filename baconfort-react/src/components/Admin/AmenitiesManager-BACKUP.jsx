import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import './AmenitiesManager.css';

function AmenitiesManager() {
  const { data } = useAdmin(); // Solo obtener datos, no usar updateProperty ni loadPropertiesFromBackend
  const [properties, setProperties] = useState({});
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('departamento');
  const [newAmenity, setNewAmenity] = useState({ text: '', icon: 'fas fa-star' });
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    lastUpdate: null,
    lastOperation: null,
    currentCount: 0,
    propertyAmenities: null,
    systemType: 'localStorage-only'
  });

  // Cargar propiedades desde AdminContext al inicio (SIN BACKEND)
  useEffect(() => {
    console.log('🚀 AMENITIES SIMPLE: Cargando propiedades desde AdminContext...');
    setProperties(data.properties);
    console.log('✅ AMENITIES SIMPLE: Propiedades cargadas:', Object.keys(data.properties));
  }, [data.properties]);

  // FUNCIÓN SIMPLE: Solo LocalStorage, sin backend
  const updatePropertyAmenities = async (propertyId, newAmenities) => {
    console.log('🔄 AMENITIES SIMPLE: Actualizando amenities (solo localStorage)...');
    console.log('  Property:', propertyId);
    console.log('  New amenities:', newAmenities);

    try {
      // 1. Actualizar estado local del componente
      const updatedProperties = {
        ...properties,
        [propertyId]: {
          ...properties[propertyId],
          amenities: newAmenities,
          lastAmenitiesUpdate: new Date().toISOString()
        }
      };

      // 2. Guardar en localStorage
      localStorage.setItem('baconfort_admin_properties', JSON.stringify(updatedProperties));
      
      // 3. Actualizar estado del componente INMEDIATAMENTE
      setProperties(updatedProperties);

      console.log('✅ AMENITIES SIMPLE: Amenities actualizadas exitosamente (sin backend)');
      return true;

    } catch (error) {
      console.error('❌ AMENITIES SIMPLE: Error actualizando amenities:', error);
      throw error;
    }
  };

  const propertiesList = Object.values(properties);
  const categories = {
    departamento: 'Departamento',
    servicios: 'Servicios',
    amenitiesEdificio: 'Amenities del Edificio'
  };
  useEffect(() => {
    if (selectedProperty) {
      const property = data.properties[selectedProperty];
      console.log('🔍 AMENITIES: Datos de propiedad seleccionada:', {
        id: selectedProperty,
        amenities: property?.amenities,
        hasAmenities: !!property?.amenities
      });
    }
  }, [selectedProperty, data.properties]);

  // Debug: Verificar qué propiedades tenemos disponibles
  useEffect(() => {
    console.log('🔍 AMENITIES DEBUG: Propiedades disponibles:', {
      total: properties.length,
      ids: properties.map(p => p.id),
      titles: properties.map(p => p.title),
      hasAmenities: properties.map(p => ({ id: p.id, hasAmenities: !!p.amenities }))
    });
  }, [properties]);

  // Debug: Monitorear cambios en amenities de la propiedad seleccionada
  useEffect(() => {
    if (selectedProperty) {
      const property = data.properties[selectedProperty];
      const amenitiesCount = property?.amenities ? 
        Object.values(property.amenities).reduce((total, arr) => total + (arr?.length || 0), 0) : 0;
      
      setDebugInfo({
        lastUpdate: new Date().toISOString(),
        lastOperation: 'property_selected',
        currentCount: amenitiesCount,
        propertyAmenities: property?.amenities
      });

      console.log('🔍 AMENITIES DEBUG: Propiedad seleccionada actualizada:', {
        id: selectedProperty,
        amenitiesCount,
        amenities: property?.amenities,
        timestamp: new Date().toISOString()
      });
    }
  }, [selectedProperty, data.properties]);

    // Debug: verificar qué datos tenemos (SIMPLIFICADO)
  useEffect(() => {
    if (selectedProperty) {
      const property = properties[selectedProperty];
      console.log('🔍 AMENITIES SIMPLE: Datos de propiedad seleccionada:', {
        id: selectedProperty,
        amenities: property?.amenities,
        hasAmenities: !!property?.amenities
      });
    }
  }, [selectedProperty, properties]);

  // Debug: Verificar qué propiedades tenemos disponibles (SIMPLIFICADO)
  useEffect(() => {
    console.log('🔍 AMENITIES SIMPLE DEBUG: Propiedades disponibles:', {
      total: propertiesList.length,
      ids: propertiesList.map(p => p.id),
      titles: propertiesList.map(p => p.title),
      hasAmenities: propertiesList.map(p => ({ id: p.id, hasAmenities: !!p.amenities }))
    });
  }, [propertiesList]);

  // Debug: Monitorear cambios en amenities de la propiedad seleccionada (SIMPLIFICADO)
  useEffect(() => {
    if (selectedProperty) {
      const property = properties[selectedProperty];
      const amenitiesCount = property?.amenities ? 
        Object.values(property.amenities).reduce((total, arr) => total + (arr?.length || 0), 0) : 0;
      
      setDebugInfo({
        lastUpdate: new Date().toISOString(),
        lastOperation: 'property_selected',
        currentCount: amenitiesCount,
        propertyAmenities: property?.amenities,
        systemType: 'localStorage-only'
      });

      console.log('🔍 AMENITIES SIMPLE DEBUG: Propiedad seleccionada actualizada:', {
        id: selectedProperty,
        amenitiesCount,
        amenities: property?.amenities,
        timestamp: new Date().toISOString(),
        system: 'localStorage-only'
      });
    }
  }, [selectedProperty, properties]);
  const initializeAmenitiesStructure = async (propertyId) => {
    const property = data.properties[propertyId];
    if (!property.amenities) {
      console.log(`🔧 AMENITIES: Inicializando estructura de amenities para ${propertyId}`);
      await updateProperty(propertyId, { amenities: defaultAmenitiesStructure });
      console.log(`✅ AMENITIES: Estructura inicializada para ${propertyId}`);
    }
  };

  // Función para aplicar amenities completas a todas las propiedades
  const applyDefaultAmenitiesToAllProperties = async () => {
    setLoading(true);
    console.log('🚀 AMENITIES: Aplicando amenities por defecto a todas las propiedades...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const property of properties) {
      try {
        console.log(`📦 AMENITIES: Procesando ${property.title} (${property.id})...`);
        console.log(`🔍 AMENITIES: Estado actual de amenities:`, property.amenities);
        
        // Forzar la actualización pasando solo las amenities
        await updateProperty(property.id, { 
          amenities: defaultAmenitiesStructure,
          lastAmenitiesUpdate: new Date().toISOString()
        });
        
        successCount++;
        console.log(`✅ AMENITIES: ${property.title} actualizada exitosamente`);
      } catch (error) {
        console.error(`❌ AMENITIES: Error actualizando ${property.title}:`, error);
        errorCount++;
      }
    }
    
    console.log(`🎉 AMENITIES: Proceso completado. Éxitos: ${successCount}, Errores: ${errorCount}`);
    setLoading(false);
    
    // Recargar propiedades después de la actualización
    console.log('🔄 AMENITIES: Recargando propiedades desde backend...');
    await loadPropertiesFromBackend();
    
    // Mostrar notificación de resultado
    if (successCount > 0) {
      alert(`✅ ¡Amenities aplicadas exitosamente!\n\n${successCount} propiedades actualizadas\n${errorCount} errores\n\nLas propiedades se han recargado desde el backend.`);
    }
  };

  // Verificar y inicializar amenities cuando se selecciona una propiedad
  useEffect(() => {
    if (selectedProperty) {
      const property = data.properties[selectedProperty];
      if (!property?.amenities) {
        initializeAmenitiesStructure(selectedProperty);
      }
    }
  }, [selectedProperty]);

  // Amenities completas por defecto para todos los departamentos
  const defaultAmenitiesStructure = {
    departamento: [
      { icon: 'fas fa-tv', text: 'Smart TV 55"' },
      { icon: 'fas fa-wifi', text: 'WiFi Gratis de Alta Velocidad' },
      { icon: 'fas fa-snowflake', text: 'Aire Acondicionado Frío/Calor' },
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
      { icon: 'fas fa-shield-alt', text: 'Seguridad Privada' },
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
  };

  const iconOptions = [
    { icon: 'fas fa-tv', name: 'Televisión / Smart TV' },
    { icon: 'fas fa-wifi', name: 'WiFi / Internet' },
    { icon: 'fas fa-snowflake', name: 'Aire Acondicionado' },
    { icon: 'fas fa-door-closed', name: 'Balcón / Puerta' },
    { icon: 'fas fa-utensils', name: 'Cocina / Utensilios' },
    { icon: 'fas fa-bed', name: 'Cama / Dormitorio' },
    { icon: 'fas fa-bath', name: 'Baño / Ducha' },
    { icon: 'fas fa-shield-alt', name: 'Seguridad' },
    { icon: 'fas fa-tshirt', name: 'Lavarropas / Lavandería' },
    { icon: 'fas fa-concierge-bell', name: 'Recepción / Portería' },
    { icon: 'fas fa-car', name: 'Estacionamiento / Cochera' },
    { icon: 'fas fa-elevator', name: 'Ascensor' },
    { icon: 'fas fa-dumbbell', name: 'Gimnasio / Ejercicio' },
    { icon: 'fas fa-swimming-pool', text: 'Piscina' },
    { icon: 'fas fa-hot-tub', name: 'Jacuzzi / Spa' },
    { icon: 'fas fa-sun', name: 'Solarium / Terraza' },
    { icon: 'fas fa-users', name: 'SUM / Salón' },
    { icon: 'fas fa-building', name: 'Edificio' },
    { icon: 'fas fa-lock', name: 'Seguridad / Cerradura' },
    { icon: 'fas fa-broom', name: 'Limpieza' },
    { icon: 'fas fa-couch', name: 'Living / Sofá' },
    { icon: 'fas fa-warehouse', name: 'Espacio Amplio / Depósito' },
    { icon: 'fas fa-coffee', name: 'Cafetera / Cocina' },
    { icon: 'fas fa-blender', name: 'Microondas / Electrodomésticos' },
    { icon: 'fas fa-wine-glass', name: 'Cristalería / Bar' },
    { icon: 'fas fa-bicycle', name: 'Bicicletas / Ciclismo' },
    { icon: 'fas fa-laptop', name: 'Zona de Trabajo / Oficina' },
    { icon: 'fas fa-tree', name: 'Jardín / Naturaleza' },
    { icon: 'fas fa-spa', name: 'Spa / Relajación' },
    { icon: 'fas fa-gamepad', name: 'Entretenimiento / Juegos' },
    { icon: 'fas fa-star', name: 'Destacado' },
    { icon: 'fas fa-suitcase', name: 'Equipaje / Maletas' },
    { icon: 'fas fa-info-circle', name: 'Información' },
    { icon: 'fas fa-phone', name: 'Teléfono / Comunicación' }
  ];

  // Filtrar amenidades por búsqueda
  const filterAmenities = (amenities) => {
    if (!searchTerm) return amenities;
    return amenities.filter(amenity => 
      amenity.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Estadísticas
  const getStats = () => {
    if (!selectedProperty) return { total: 0, byCategory: {} };
    
    const property = data.properties[selectedProperty];
    const stats = { total: 0, byCategory: {} };
    
    Object.entries(categories).forEach(([key, label]) => {
      const count = property.amenities?.[key]?.length || 0;
      stats.byCategory[key] = count;
      stats.total += count;
    });
    
    return stats;
  };

  const stats = getStats();

  const handleAddAmenity = async () => {
    if (!selectedProperty || !newAmenity.text.trim()) return;

    console.log('➕ AMENITIES: Agregando nueva comodidad:', {
      property: selectedProperty,
      category: selectedCategory,
      amenity: newAmenity
    });

    const property = data.properties[selectedProperty];
    console.log('🔍 AMENITIES: Propiedad actual:', property);
    
    // Asegurar que la estructura de amenities existe
    const currentAmenities = property.amenities || {
      departamento: [],
      servicios: [],
      amenitiesEdificio: []
    };
    
    console.log('🔍 AMENITIES: Amenities actuales:', currentAmenities);
    
    const updatedAmenities = {
      ...currentAmenities,
      [selectedCategory]: [
        ...(currentAmenities[selectedCategory] || []),
        { 
          icon: newAmenity.icon,
          text: newAmenity.text.trim()
        }
      ]
    };

    console.log('🔍 AMENITIES: Amenities actualizadas:', updatedAmenities);

    try {
      await updateProperty(selectedProperty, { 
        amenities: updatedAmenities,
        lastAmenitiesUpdate: new Date().toISOString()
      });
      setNewAmenity({ text: '', icon: 'fas fa-star' });
      
      console.log('✅ AMENITIES: Comodidad agregada exitosamente');
      
      // Forzar recarga después de agregar
      console.log('🔄 AMENITIES: Recargando datos tras agregar amenity...');
      await loadPropertiesFromBackend();
      
      // Actualizar debug info
      setDebugInfo(prev => ({
        ...prev,
        lastUpdate: new Date().toISOString(),
        lastOperation: 'amenity_added',
        currentCount: prev.currentCount + 1
      }));
      
    } catch (error) {
      console.error('❌ AMENITIES: Error agregando comodidad:', error);
      alert('Error agregando comodidad: ' + error.message);
    }
  };

  const handleEditAmenity = (categoryKey, index, amenity) => {
    console.log('✏️ AMENITIES: Editando comodidad:', { categoryKey, index, amenity });
    setEditingAmenity({ categoryKey, index, ...amenity });
    // Cambiar a la categoría correspondiente si es necesario
    if (categoryKey !== selectedCategory) {
      setSelectedCategory(categoryKey);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedProperty || !editingAmenity || !editingAmenity.text.trim()) return;

    console.log('💾 AMENITIES: Guardando edición:', editingAmenity);

    const property = data.properties[selectedProperty];
    
    // Asegurar que la estructura de amenities existe
    const currentAmenities = property.amenities || {
      departamento: [],
      servicios: [],
      amenitiesEdificio: []
    };
    
    const updatedAmenities = { ...currentAmenities };
    if (!updatedAmenities[editingAmenity.categoryKey]) {
      updatedAmenities[editingAmenity.categoryKey] = [];
    }
    
    updatedAmenities[editingAmenity.categoryKey][editingAmenity.index] = {
      icon: editingAmenity.icon,
      text: editingAmenity.text.trim()
    };

    try {
      await updateProperty(selectedProperty, { 
        amenities: updatedAmenities,
        lastAmenitiesUpdate: new Date().toISOString()
      });
      setEditingAmenity(null);
      
      console.log('✅ AMENITIES: Edición guardada exitosamente');
      
      // Forzar recarga después de editar
      await loadPropertiesFromBackend();
      
      // Actualizar debug info
      setDebugInfo(prev => ({
        ...prev,
        lastUpdate: new Date().toISOString(),
        lastOperation: 'amenity_edited'
      }));
      
    } catch (error) {
      console.error('❌ AMENITIES: Error guardando edición:', error);
      alert('Error guardando edición: ' + error.message);
    }
  };

  const handleDeleteAmenity = (categoryKey, index) => {
    setShowDeleteConfirm({ categoryKey, index });
  };

  const confirmDeleteAmenity = async () => {
    if (!selectedProperty || !showDeleteConfirm) return;

    console.log('🗑️ AMENITIES: Eliminando comodidad:', showDeleteConfirm);

    const property = data.properties[selectedProperty];
    
    // Asegurar que la estructura de amenities existe
    const currentAmenities = property.amenities || {
      departamento: [],
      servicios: [],
      amenitiesEdificio: []
    };
    
    const updatedAmenities = { ...currentAmenities };
    if (updatedAmenities[showDeleteConfirm.categoryKey]) {
      updatedAmenities[showDeleteConfirm.categoryKey] = updatedAmenities[showDeleteConfirm.categoryKey].filter((_, i) => i !== showDeleteConfirm.index);
    }

    try {
      await updateProperty(selectedProperty, { 
        amenities: updatedAmenities,
        lastAmenitiesUpdate: new Date().toISOString()
      });
      setShowDeleteConfirm(null);
      
      console.log('✅ AMENITIES: Comodidad eliminada exitosamente');
      
      // Forzar recarga después de eliminar
      await loadPropertiesFromBackend();
      
      // Actualizar debug info
      setDebugInfo(prev => ({
        ...prev,
        lastUpdate: new Date().toISOString(),
        lastOperation: 'amenity_deleted',
        currentCount: prev.currentCount - 1
      }));
      
    } catch (error) {
      console.error('❌ AMENITIES: Error eliminando comodidad:', error);
      alert('Error eliminando comodidad: ' + error.message);
    }
  };

  const selectedPropertyData = selectedProperty ? data.properties[selectedProperty] : null;

  return (
    <div className="amenities-manager">
      <div className="amenities-manager-header">
        <h2 className="section-title">
          <i className="fas fa-star"></i>
          Gestión de Comodidades
          {loading && <span className="loading-indicator">Cargando...</span>}
        </h2>
        
        <div className="header-actions">
          <button 
            onClick={applyDefaultAmenitiesToAllProperties}
            className="btn-apply-all"
            disabled={loading || properties.length === 0}
            title="Aplica amenities completas a todos los departamentos"
          >
            <i className="fas fa-magic"></i>
            Aplicar Amenities Completas a Todas las Propiedades
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-section">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Cargando comodidades desde el backend...</p>
        </div>
      )}

      {/* Sección de Debug */}
      {selectedProperty && (
        <div className="debug-section" style={{
          background: '#f0f8ff',
          border: '1px solid #d1ecf1',
          borderRadius: '8px',
          padding: '1rem',
          margin: '1rem 0',
          fontSize: '0.9rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0c5460' }}>
            🐛 Debug Info - {selectedPropertyData?.title || selectedProperty}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
            <div><strong>Última actualización:</strong> {debugInfo.lastUpdate || 'N/A'}</div>
            <div><strong>Última operación:</strong> {debugInfo.lastOperation || 'N/A'}</div>
            <div><strong>Total amenities:</strong> {debugInfo.currentCount}</div>
            <div><strong>Tiene amenities:</strong> {!!selectedPropertyData?.amenities ? 'Sí' : 'No'}</div>
          </div>
          {debugInfo.propertyAmenities && (
            <details style={{ marginTop: '0.5rem' }}>
              <summary>Ver estructura de amenities</summary>
              <pre style={{ fontSize: '0.8rem', overflow: 'auto', maxHeight: '200px' }}>
                {JSON.stringify(debugInfo.propertyAmenities, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Estadísticas */}
      {selectedProperty && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">
                <i className="fas fa-star"></i>
              </div>
              <div className="stat-content">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total de Comodidades</span>
              </div>
            </div>
            
            <div className="stat-card department">
              <div className="stat-icon">
                <i className="fas fa-home"></i>
              </div>
              <div className="stat-content">
                <span className="stat-number">{stats.byCategory.departamento || 0}</span>
                <span className="stat-label">Departamento</span>
              </div>
            </div>
            
            <div className="stat-card services">
              <div className="stat-icon">
                <i className="fas fa-concierge-bell"></i>
              </div>
              <div className="stat-content">
                <span className="stat-number">{stats.byCategory.servicios || 0}</span>
                <span className="stat-label">Servicios</span>
              </div>
            </div>
            
            <div className="stat-card building">
              <div className="stat-icon">
                <i className="fas fa-building"></i>
              </div>
              <div className="stat-content">
                <span className="stat-number">{stats.byCategory.amenitiesEdificio || 0}</span>
                <span className="stat-label">Amenities del Edificio</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="controls-section">
        <div className="selectors-container">
          <div className="selector-group">
            <label htmlFor="property-select" className="selector-label">
              <i className="fas fa-building"></i>
              Propiedad:
            </label>
            <select 
              id="property-select"
              value={selectedProperty} 
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="selector-input"
            >
              <option value="">Seleccionar propiedad...</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.title}
                </option>
              ))}
            </select>
          </div>

          {selectedProperty && (
            <div className="selector-group">
              <label htmlFor="category-select" className="selector-label">
                <i className="fas fa-layer-group"></i>
                Categoría:
              </label>
              <select 
                id="category-select"
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="selector-input"
              >
                {Object.entries(categories).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedProperty && (
          <div className="search-container">
            <div className="search-input-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar comodidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="amenity-search"
                name="amenity-search"
              />
            </div>
          </div>
        )}
      </div>

      {selectedProperty && (
        <>
          {/* Agregar Nueva Comodidad */}
          <div className="add-amenity-section">
            <div className="add-amenity-header">
              <h3>
                <i className="fas fa-plus-circle"></i>
                Agregar Nueva Comodidad
              </h3>
              <div className="category-badge">
                <i className="fas fa-tag"></i>
                {categories[selectedCategory]}
              </div>
            </div>
            
            <div className="form-container">
              <div className="form-group text-group">
                <label htmlFor="amenity-text" className="form-label">
                  <i className="fas fa-edit"></i>
                  Descripción:
                </label>
                <input 
                  id="amenity-text"
                  type="text" 
                  value={newAmenity.text}
                  onChange={(e) => setNewAmenity(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Ej: Smart TV 55&quot;, WiFi 300MB, Piscina climatizada..."
                  className="form-input"
                />
              </div>
            </div>
              
              {newAmenity.text && (
                <div className="preview-container">
                  <div className="preview-label">Vista Previa:</div>
                  <div className="amenity-preview">
                    <i className={newAmenity.icon}></i>
                    <span>{newAmenity.text}</span>
                  </div>
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  onClick={handleAddAmenity}
                  className="btn-add"
                  disabled={!newAmenity.text.trim()}
                >
                  <i className="fas fa-plus"></i>
                  Agregar Comodidad
                </button>
              </div>
          </div>

          {/* Lista de Comodidades */}
          <div className="amenities-list-section">
            <div className="section-header">
              <h3>
                <i className="fas fa-list"></i>
                Comodidades de {categories[selectedCategory]}
              </h3>
              <div className="amenities-count">
                {selectedPropertyData?.amenities?.[selectedCategory]?.length || 0} comodidades
              </div>
            </div>
            
            {selectedPropertyData?.amenities?.[selectedCategory]?.length > 0 ? (
              <div className="amenities-grid">
                {filterAmenities(selectedPropertyData.amenities[selectedCategory]).map((amenity, index) => (
                  <div key={index} className="amenity-card">
                    {editingAmenity && 
                     editingAmenity.categoryKey === selectedCategory && 
                     editingAmenity.index === index ? (
                      <div className="amenity-edit">
                        <div className="edit-form">
                          <div className="edit-row">
                            <select 
                              value={editingAmenity.icon}
                              onChange={(e) => setEditingAmenity(prev => ({ ...prev, icon: e.target.value }))}
                              className="edit-input icon-select"
                            >
                              {iconOptions.map(option => (
                                <option key={option.icon} value={option.icon}>
                                  {option.name}
                                </option>
                              ))}
                            </select>
                            
                            {/* Vista previa del icono en edición */}
                            <div className="icon-preview-edit">
                              <div className="icon-preview-display">
                                <i className={editingAmenity.icon}></i>
                              </div>
                              <div className="icon-preview-info">
                                <span className="icon-preview-name">
                                  {iconOptions.find(opt => opt.icon === editingAmenity.icon)?.name || 'Icono'}
                                </span>
                              </div>
                            </div>
                            <input 
                              type="text"
                              value={editingAmenity.text}
                              onChange={(e) => setEditingAmenity(prev => ({ ...prev, text: e.target.value }))}
                              className="edit-input"
                              placeholder="Descripción de la comodidad"
                            />
                          </div>
                          <div className="edit-actions">
                            <button onClick={handleSaveEdit} className="btn-save">
                              <i className="fas fa-check"></i>
                              Guardar
                            </button>
                            <button onClick={() => setEditingAmenity(null)} className="btn-cancel">
                              <i className="fas fa-times"></i>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="amenity-content">
                        <div className="amenity-info">
                          <span className="amenity-text">{amenity.text}</span>
                        </div>
                        <div className="amenity-actions">
                          <button 
                            onClick={() => handleEditAmenity(selectedCategory, index, amenity)}
                            className="action-btn edit-btn"
                            title="Editar comodidad"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            onClick={() => handleDeleteAmenity(selectedCategory, index)}
                            className="action-btn delete-btn"
                            title="Eliminar comodidad"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fas fa-star"></i>
                </div>
                <h4>No hay comodidades en esta categoría</h4>
                <p>Agrega la primera comodidad para comenzar</p>
              </div>
            )}
          </div>

          {/* Vista Previa General */}
          <div className="preview-section">
            <div className="section-header">
              <h3>
                <i className="fas fa-eye"></i>
                Vista Previa de Todas las Comodidades
              </h3>
            </div>
            
            <div className="preview-grid">
              {Object.entries(categories).map(([key, label]) => (
                <div key={key} className="preview-category">
                  <div className="category-header">
                    <h4>
                      <i className="fas fa-star"></i>
                      {label}
                    </h4>
                    <span className="category-count">
                      {selectedPropertyData?.amenities?.[key]?.length || 0}
                    </span>
                  </div>
                  <div className="category-amenities">
                    {selectedPropertyData?.amenities?.[key]?.length > 0 ? (
                      selectedPropertyData.amenities[key].map((amenity, index) => (
                        <div key={index} className="preview-amenity">
                          <div className="amenity-content">
                            <span className="amenity-text">{amenity.text}</span>
                          </div>
                          <div className="amenity-actions">
                            <button 
                              onClick={() => handleEditAmenity(key, index, amenity)}
                              className="action-btn edit-btn"
                              title="Editar comodidad"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              onClick={() => handleDeleteAmenity(key, index)}
                              className="action-btn delete-btn"
                              title="Eliminar comodidad"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-amenities">
                        <i className="fas fa-info-circle"></i>
                        Sin comodidades
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!selectedProperty && (
        <div className="no-property-selected">
          <div className="no-property-icon">
            <i className="fas fa-building"></i>
          </div>
          <h3>Selecciona una propiedad</h3>
          <p>Elige una propiedad para gestionar sus comodidades</p>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <i className="fas fa-exclamation-triangle"></i>
                Confirmar Eliminación
              </h3>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de que quieres eliminar esta comodidad?</p>
              <div className="amenity-to-delete">
                <i className="fas fa-star"></i>
                <span>Esta acción no se puede deshacer</span>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                onClick={confirmDeleteAmenity} 
                className="btn-delete"
              >
                <i className="fas fa-trash"></i> Eliminar
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(null)} 
                className="btn-cancel"
              >
                <i className="fas fa-times"></i> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AmenitiesManager;
