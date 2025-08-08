import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import './AmenitiesManager.css';

function AmenitiesManagerSimple() {
  const { data } = useAdmin(); // Solo obtener datos, no usar updateProperty
  const [properties, setProperties] = useState({});
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('departamento');
  const [newAmenity, setNewAmenity] = useState({ text: '', icon: 'fas fa-star' });
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar propiedades desde AdminContext al inicio
  useEffect(() => {
    console.log('🚀 AMENITIES SIMPLE: Cargando propiedades desde AdminContext...');
    setProperties(data.properties);
    console.log('✅ AMENITIES SIMPLE: Propiedades cargadas:', Object.keys(data.properties));
  }, [data.properties]);

  const categories = {
    departamento: 'Departamento',
    servicios: 'Servicios', 
    amenitiesEdificio: 'Amenities del Edificio'
  };

  // FUNCIÓN SIMPLE: Solo LocalStorage, sin backend
  const updatePropertyAmenities = async (propertyId, newAmenities) => {
    console.log('🔄 AMENITIES SIMPLE: Actualizando amenities (solo localStorage)...');
    console.log('  Property:', propertyId);
    console.log('  New amenities:', newAmenities);

    try {
      // 1. Actualizar estado local
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
      
      // 3. Actualizar estado del componente
      setProperties(updatedProperties);

      console.log('✅ AMENITIES SIMPLE: Amenities actualizadas exitosamente');
      return true;

    } catch (error) {
      console.error('❌ AMENITIES SIMPLE: Error actualizando amenities:', error);
      throw error;
    }
  };

  // Amenities completas por defecto
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

  // Aplicar amenities completas a todas las propiedades
  const applyDefaultAmenitiesToAllProperties = async () => {
    setLoading(true);
    console.log('🚀 AMENITIES SIMPLE: Aplicando amenities por defecto a todas las propiedades...');
    
    let successCount = 0;
    let errorCount = 0;
    
    const propertyList = Object.values(properties);
    
    for (const property of propertyList) {
      try {
        console.log(`📦 AMENITIES SIMPLE: Procesando ${property.title} (${property.id})...`);
        
        await updatePropertyAmenities(property.id, defaultAmenitiesStructure);
        
        successCount++;
        console.log(`✅ AMENITIES SIMPLE: ${property.title} actualizada exitosamente`);
      } catch (error) {
        console.error(`❌ AMENITIES SIMPLE: Error actualizando ${property.title}:`, error);
        errorCount++;
      }
    }
    
    console.log(`🎉 AMENITIES SIMPLE: Proceso completado. Éxitos: ${successCount}, Errores: ${errorCount}`);
    setLoading(false);
    
    if (successCount > 0) {
      alert(`✅ ¡Amenities aplicadas exitosamente!\n\n${successCount} propiedades actualizadas\n${errorCount} errores\n\nSistema simplificado (solo localStorage) funcionando perfectamente.`);
    }
  };

  // Agregar nueva amenity
  const handleAddAmenity = async () => {
    if (!selectedProperty || !newAmenity.text.trim()) return;

    console.log('➕ AMENITIES SIMPLE: Agregando nueva comodidad...');

    const property = properties[selectedProperty];
    const currentAmenities = property.amenities || {
      departamento: [],
      servicios: [],
      amenitiesEdificio: []
    };
    
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

    try {
      await updatePropertyAmenities(selectedProperty, updatedAmenities);
      setNewAmenity({ text: '', icon: 'fas fa-star' });
      console.log('✅ AMENITIES SIMPLE: Comodidad agregada exitosamente');
    } catch (error) {
      console.error('❌ AMENITIES SIMPLE: Error agregando comodidad:', error);
      alert('Error agregando comodidad: ' + error.message);
    }
  };

  // Editar amenity
  const handleSaveEdit = async () => {
    if (!selectedProperty || !editingAmenity || !editingAmenity.text.trim()) return;

    console.log('💾 AMENITIES SIMPLE: Guardando edición...');

    const property = properties[selectedProperty];
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
      await updatePropertyAmenities(selectedProperty, updatedAmenities);
      setEditingAmenity(null);
      console.log('✅ AMENITIES SIMPLE: Edición guardada exitosamente');
    } catch (error) {
      console.error('❌ AMENITIES SIMPLE: Error guardando edición:', error);
      alert('Error guardando edición: ' + error.message);
    }
  };

  // Eliminar amenity
  const confirmDeleteAmenity = async () => {
    if (!selectedProperty || !showDeleteConfirm) return;

    console.log('🗑️ AMENITIES SIMPLE: Eliminando comodidad...');

    const property = properties[selectedProperty];
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
      await updatePropertyAmenities(selectedProperty, updatedAmenities);
      setShowDeleteConfirm(null);
      console.log('✅ AMENITIES SIMPLE: Comodidad eliminada exitosamente');
    } catch (error) {
      console.error('❌ AMENITIES SIMPLE: Error eliminando comodidad:', error);
      alert('Error eliminando comodidad: ' + error.message);
    }
  };

  // El resto del componente sería idéntico al original...
  // (selectors, lista de amenities, preview, etc.)

  const selectedPropertyData = selectedProperty ? properties[selectedProperty] : null;

  return (
    <div className="amenities-manager">
      <div className="amenities-manager-header">
        <h2 className="section-title">
          <i className="fas fa-star"></i>
          Gestión de Comodidades (Versión Simplificada)
          {loading && <span className="loading-indicator">Cargando...</span>}
        </h2>
        
        <div className="header-actions">
          <button 
            onClick={applyDefaultAmenitiesToAllProperties}
            className="btn-apply-all"
            disabled={loading || Object.keys(properties).length === 0}
            title="Aplica amenities completas a todos los departamentos (solo localStorage)"
          >
            <i className="fas fa-magic"></i>
            Aplicar Amenities Completas (Solo LocalStorage)
          </button>
        </div>
      </div>

      {/* Info sobre la versión simplificada */}
      <div className="info-section" style={{
        background: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '8px',
        padding: '1rem',
        margin: '1rem 0'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#155724' }}>
          ⚡ Versión Simplificada Activa
        </h4>
        <p style={{ margin: 0, color: '#155724' }}>
          Esta versión NO usa backend, solo localStorage. Las actualizaciones son instantáneas y sin problemas de sincronización.
        </p>
      </div>

      {/* Selector de propiedad */}
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
              {Object.values(properties).map(property => (
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
      </div>

      {/* Debug Info Simplificado */}
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
            🔍 Estado Actual - {selectedPropertyData?.title || selectedProperty}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
            <div><strong>Última actualización:</strong> {selectedPropertyData?.lastAmenitiesUpdate || 'N/A'}</div>
            <div><strong>Sistema:</strong> Solo LocalStorage (Sin Backend)</div>
            <div><strong>Total amenities:</strong> {
              selectedPropertyData?.amenities ? 
                Object.values(selectedPropertyData.amenities).reduce((total, arr) => total + (arr?.length || 0), 0) 
                : 0
            }</div>
            <div><strong>Tiene amenities:</strong> {!!selectedPropertyData?.amenities ? 'Sí' : 'No'}</div>
          </div>
        </div>
      )}

      {/* El resto del UI - Interfaz completa */}
      
      {/* Formulario para agregar nueva amenity */}
      {selectedProperty && (
        <div className="add-amenity-section">
          <h3 className="h6 mb-3">
            <i className="fas fa-plus"></i> Agregar Nueva Comodidad - {categories[selectedCategory]}
          </h3>
          <div className="add-amenity-form">
            <div className="form-row">
              <div className="form-group">
                <label>Icono:</label>
                <input
                  type="text"
                  value={newAmenity.icon}
                  onChange={(e) => setNewAmenity({ ...newAmenity, icon: e.target.value })}
                  placeholder="fas fa-star"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Texto:</label>
                <input
                  type="text"
                  value={newAmenity.text}
                  onChange={(e) => setNewAmenity({ ...newAmenity, text: e.target.value })}
                  placeholder="Descripción de la comodidad"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <button 
                  onClick={handleAddAmenity}
                  className="btn btn-primary"
                  disabled={!newAmenity.text.trim()}
                >
                  <i className="fas fa-plus"></i> Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de amenities actuales */}
      {selectedProperty && selectedPropertyData?.amenities && (
        <div className="current-amenities-section">
          <h3 className="h6 mb-3">
            <i className="fas fa-list"></i> Comodidades Actuales - {categories[selectedCategory]}
          </h3>
          
          <div className="amenities-list-container">
            {selectedPropertyData.amenities[selectedCategory]?.map((amenity, index) => (
              <div key={`${selectedCategory}-${index}`} className="amenity-item">
                {editingAmenity && editingAmenity.categoryKey === selectedCategory && editingAmenity.index === index ? (
                  // Modo edición
                  <div className="amenity-edit-mode">
                    <input
                      type="text"
                      value={editingAmenity.icon}
                      onChange={(e) => setEditingAmenity({ ...editingAmenity, icon: e.target.value })}
                      className="form-control icon-input"
                    />
                    <input
                      type="text"
                      value={editingAmenity.text}
                      onChange={(e) => setEditingAmenity({ ...editingAmenity, text: e.target.value })}
                      className="form-control text-input"
                    />
                    <div className="edit-actions">
                      <button onClick={handleSaveEdit} className="btn btn-success btn-sm">
                        <i className="fas fa-save"></i>
                      </button>
                      <button onClick={() => setEditingAmenity(null)} className="btn btn-secondary btn-sm">
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Modo visualización
                  <div className="amenity-display-mode">
                    <span className="amenity-icon">
                      <i className={amenity.icon}></i>
                    </span>
                    <span className="amenity-text">{amenity.text}</span>
                    <div className="amenity-actions">
                      <button 
                        onClick={() => setEditingAmenity({
                          categoryKey: selectedCategory,
                          index: index,
                          icon: amenity.icon,
                          text: amenity.text
                        })}
                        className="btn btn-outline-primary btn-sm"
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm({
                          categoryKey: selectedCategory,
                          index: index,
                          text: amenity.text
                        })}
                        className="btn btn-outline-danger btn-sm"
                        title="Eliminar"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )) || <p className="text-muted">No hay comodidades en esta categoría</p>}
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Confirmar Eliminación</h4>
            <p>¿Está seguro de que desea eliminar esta comodidad?</p>
            <p><strong>"{showDeleteConfirm.text}"</strong></p>
            <div className="modal-actions">
              <button onClick={confirmDeleteAmenity} className="btn btn-danger">
                <i className="fas fa-trash"></i> Eliminar
              </button>
              <button onClick={() => setShowDeleteConfirm(null)} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview de todas las amenities */}
      {selectedProperty && selectedPropertyData?.amenities && (
        <div className="amenities-preview-section">
          <h3 className="h6 mb-3">
            <i className="fas fa-eye"></i> Vista Previa - Como se ve en la página
          </h3>
          
          <div className="preview-container">
            <div className="row">
              {/* Departamento */}
              {selectedPropertyData.amenities.departamento && selectedPropertyData.amenities.departamento.length > 0 && (
                <div className="col-md-4">
                  <h4 className="h6 mb-3"><i className="fas fa-home"></i> Departamento</h4>
                  <ul className="list-unstyled">
                    {selectedPropertyData.amenities.departamento.map((amenity, index) => (
                      <li key={`prev-dept-${index}`}>
                        <i className={amenity.icon}></i> {amenity.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Servicios */}
              {selectedPropertyData.amenities.servicios && selectedPropertyData.amenities.servicios.length > 0 && (
                <div className="col-md-4">
                  <h4 className="h6 mb-3"><i className="fas fa-concierge-bell"></i> Servicios</h4>
                  <ul className="list-unstyled">
                    {selectedPropertyData.amenities.servicios.map((amenity, index) => (
                      <li key={`prev-serv-${index}`}>
                        <i className={amenity.icon}></i> {amenity.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Amenities del Edificio */}
              {selectedPropertyData.amenities.amenitiesEdificio && selectedPropertyData.amenities.amenitiesEdificio.length > 0 && (
                <div className="col-md-4">
                  <h4 className="h6 mb-3"><i className="fas fa-building"></i> Amenities del Edificio</h4>
                  <ul className="list-unstyled">
                    {selectedPropertyData.amenities.amenitiesEdificio.map((amenity, index) => (
                      <li key={`prev-amenities-${index}`}>
                        <i className={amenity.icon}></i> {amenity.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default AmenitiesManagerSimple;
