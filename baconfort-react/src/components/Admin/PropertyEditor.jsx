import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import ImageUploaderOptimized from './ImageUploader-OPTIMIZED';
import ImageUploader from './ImageUploader';
import VideoUploader from './VideoUploader';
import './PropertyEditor.css';

function PropertyEditor({ propertyId, onBack }) {
  const { getProperty, updateProperty, loadPropertiesFromBackend } = useAdmin();
  const property = getProperty(propertyId);
  
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    prices: {
      monthly: '',
      weekly: '',
      daily: ''
    },
    description: {
      es: '',
      en: '',
      pt: ''
    },
    coverImage: '',
    heroVideo: '',
    galleryImages: []
  });
  
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (property) {
      // Asegurar que las descripciones estén presentes
      const updatedFormData = {
        ...property,
        description: {
          es: property.description?.es || 'Descripción en español',
          en: property.description?.en || 'Description in English',
          pt: property.description?.pt || 'Descrição em português'
        }
      };
      setFormData(updatedFormData);
      console.log('🔄 PropertyEditor: Propiedad actualizada desde contexto:', updatedFormData);
    }
  }, [property]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleGalleryImagesChange = (newImages) => {
    console.log('🖼️ GALLERY: Cambiando imágenes:', newImages);
    setFormData(prev => {
      const newData = {
        ...prev,
        galleryImages: newImages
      };
      console.log('🖼️ GALLERY: Estado actualizado:', newData.galleryImages);
      return newData;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    console.log('💾 GUARDANDO:', propertyId, formData);
    
    // Validar campos obligatorios para nueva propiedad
    if (!formData.title || !formData.address) {
      setSaveMessage('✗ Error: Título y dirección son obligatorios');
      setTimeout(() => setSaveMessage(''), 5000);
      setIsSaving(false);
      return;
    }
    
    if (!formData.prices.daily || !formData.prices.weekly || !formData.prices.monthly) {
      setSaveMessage('✗ Error: Todos los precios son obligatorios');
      setTimeout(() => setSaveMessage(''), 5000);
      setIsSaving(false);
      return;
    }
    
    if (!formData.description.es || !formData.description.en || !formData.description.pt) {
      setSaveMessage('✗ Error: Descripciones en todos los idiomas son obligatorias');
      setTimeout(() => setSaveMessage(''), 5000);
      setIsSaving(false);
      return;
    }
    
    // Mapear ID frontend a backend (todos con guiones)
    const idMap = {
      'moldes-1680': 'moldes-1680',
      'santa-fe-3770': 'santa-fe-3770', 
      'dorrego-1548': 'dorrego-1548',
      'convencion-1994': 'convencion-1994',
      'ugarteche-2824': 'ugarteche-2824'
    };
    
    const backendId = idMap[propertyId] || propertyId;
    console.log('🔄 Mapeando ID:', propertyId, '→', backendId);
    
    // Preparar datos para el backend - convertir precios a números
    const backendData = { ...formData };
    
    // Asegurar que las descripciones estén presentes
    if (!backendData.description || !backendData.description.es || !backendData.description.en || !backendData.description.pt) {
      console.log('🔄 PropertyEditor: Completando descripciones faltantes...');
      backendData.description = {
        es: backendData.description?.es || formData.description?.es || property?.description?.es || 'Descripción en español',
        en: backendData.description?.en || formData.description?.en || property?.description?.en || 'Description in English',
        pt: backendData.description?.pt || formData.description?.pt || property?.description?.pt || 'Descrição em português'
      };
    }
    
    // Asegurar que el estado de bloqueo esté presente
    console.log(`🔒 Estado de bloqueo: ${backendData.isBlocked ? 'BLOQUEADO' : 'DISPONIBLE'}`);
    if (backendData.blockReason) {
      console.log(`🔒 Razón de bloqueo: ${backendData.blockReason}`);
    }
    
    // Convertir precios de strings a números
    if (backendData.prices) {
      const convertPrice = (price) => {
        if (typeof price === 'string') {
          // Extraer solo números del string (ej: "USD 60" -> 60)
          const numMatch = price.match(/\d+/);
          return numMatch ? parseInt(numMatch[0]) : 0;
        }
        return typeof price === 'number' ? price : 0;
      };
      
      backendData.prices = {
        ...backendData.prices,
        daily: convertPrice(backendData.prices.daily),
        weekly: convertPrice(backendData.prices.weekly),
        monthly: convertPrice(backendData.prices.monthly)
      };
    }
    
    // Agregar las imágenes al payload del backend
    if (formData.galleryImages && formData.galleryImages.length > 0) {
      backendData.galleryImages = formData.galleryImages.map(img => img.url || img);
      backendData.coverImage = backendData.coverImage || formData.galleryImages[0].url || formData.galleryImages[0];
      console.log('🖼️ BACKEND: Imágenes agregadas al payload:', backendData.galleryImages);
    }

    // Asegurar que las coordenadas estén presentes (requeridas por el backend)
    if (!backendData.location) {
      backendData.location = {};
    }
    if (!backendData.location.coordinates) {
      backendData.location.coordinates = {};
    }
    
    // Agregar coordenadas por defecto si no existen (Buenos Aires)
    if (!backendData.location.coordinates.lat || !backendData.location.coordinates.lng) {
      backendData.location.coordinates.lat = -34.6037;  // Buenos Aires
      backendData.location.coordinates.lng = -58.3816;  // Buenos Aires
      console.log('📍 COORDS: Agregando coordenadas por defecto (Buenos Aires)');
    }
    
    // Asegurar otros campos de location
    backendData.location.address = backendData.address || backendData.location.address || 'Dirección no especificada';
    backendData.location.neighborhood = backendData.location.neighborhood || 'Sin especificar';
    backendData.location.city = backendData.location.city || 'Buenos Aires';
    backendData.location.country = backendData.location.country || 'Argentina';

    console.log('🔄 Datos transformados para backend:', backendData);
    
    try {
      // Obtener token de sesión actual
      const savedSession = localStorage.getItem('baconfort_admin_session');
      const sessionData = savedSession ? JSON.parse(savedSession) : null;
      const authToken = sessionData?.token || 'BACONFORT_ADMIN_2025_7D3F9K2L';
      
      console.log('🔑 Usando token para guardar:', authToken);
      
      // 1. Guardar directamente en el backend
      const response = await fetch(`http://localhost:5004/api/properties/${backendId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(backendData)
      });
      
      if (response.ok) {
        // 2. Actualizar localStorage
        await updateProperty(propertyId, formData);
        
        // 3. Forzar recarga de datos del backend
        console.log('🔄 Forzando recarga desde backend...');
        await loadPropertiesFromBackend();
        
        // 4. Refrescar datos del formulario y notificar cambios de precios
        const hasNewPrices = formData.prices;
        setSaveMessage(hasNewPrices ? 
          '✓ Guardado exitoso - Precios actualizados y sincronizados con el frontend' : 
          '✓ Guardado exitoso - Datos sincronizados');
        
        // 5. Disparar evento personalizado para actualizar componentes en tiempo real
        console.log('🔄 Disparando evento de actualización de precios...');
        console.log('🔍 PropertyId:', propertyId);
        console.log('🔍 FormData prices:', formData.prices);
        console.log('🔍 Backend data prices:', backendData.prices);
        
        const updateEvent = new CustomEvent('baconfort-prices-updated', {
          detail: { 
            propertyId: propertyId, 
            prices: formData.prices || backendData.prices,
            backendId: backendId,
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(updateEvent);
        
        // 6. Notificar cambios a otras pestañas/ventanas
        if (window.localStorage) {
          localStorage.setItem('baconfort-last-price-update', JSON.stringify({
            propertyId: propertyId,
            backendId: backendId,
            prices: formData.prices || backendData.prices,
            timestamp: Date.now()
          }));
        }
        
        // 7. Recarga completa después de un momento para asegurar sincronización
        setTimeout(() => {
          console.log('🔄 Recargando para sincronización completa...');
          window.location.reload();
        }, 3000);
        
      } else {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
    } catch (error) {
      console.error('❌ Error completo:', error);
      setSaveMessage(`✗ Error: ${error.message}`);
      setTimeout(() => setSaveMessage(''), 5000);
    }
    
    setIsSaving(false);
  };

  if (!property) {
    return (
      <div className="property-editor">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i>
          Propiedad no encontrada
        </div>
      </div>
    );
  }

  return (
    <div className="property-editor">
      {/* Header */}
      <div className="editor-header">
        <div className="editor-title">
          <button className="btn-back" onClick={onBack}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h2>
              <i className="fas fa-edit"></i>
              Editar Propiedad
            </h2>
            <p>{formData.title}</p>
          </div>
        </div>
        
        <div className="editor-actions">
          {saveMessage && (
            <div className="save-message-container">
              <span className={`save-message ${saveMessage.includes('✓') ? 'success' : 'error'}`}>
                {saveMessage}
              </span>
              {saveMessage.includes('Recarga la página') && (
                <button 
                  className="btn btn-info btn-sm ms-2"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-refresh"></i>
                  Recargar Página
                </button>
              )}
            </div>
          )}
          
          {/* Botón para crear nueva propiedad */}
          {!property && (
            <button 
              className="btn btn-success me-2"
              onClick={() => {
                const newPropertyData = {
                  title: 'Nueva Propiedad',
                  address: '',
                  prices: { daily: '', weekly: '', monthly: '' },
                  description: { es: '', en: '', pt: '' },
                  coverImage: '',
                  heroVideo: '',
                  galleryImages: []
                };
                setFormData(newPropertyData);
                setSaveMessage('✓ Formulario preparado para nueva propiedad. Completa todos los campos obligatorios.');
              }}
            >
              <i className="fas fa-plus"></i>
              Nueva Propiedad
            </button>
          )}
          
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Guardando...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Guardar Cambios
              </>
            )}
          </button>
          <button 
            className="btn btn-success ms-2"
            onClick={async () => {
              await handleSave();
              setTimeout(() => {
                window.location.reload();
              }, 1000); // Recargar después de guardar
            }}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Guardando...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                <i className="fas fa-refresh ms-1"></i>
                Guardar y Recargar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="editor-tabs">
        <button 
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <i className="fas fa-info-circle"></i>
          Información General
        </button>
        <button 
          className={`tab ${activeTab === 'prices' ? 'active' : ''}`}
          onClick={() => setActiveTab('prices')}
        >
          <i className="fas fa-dollar-sign"></i>
          Precios
        </button>
        <button 
          className={`tab ${activeTab === 'descriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('descriptions')}
        >
          <i className="fas fa-language"></i>
          Descripciones
        </button>
        <button 
          className={`tab ${activeTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveTab('video')}
        >
          <i className="fas fa-video"></i>
          Video
        </button>
        <button 
          className={`tab ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          <i className="fas fa-images"></i>
          Imágenes
        </button>
      </div>

      {/* Content */}
      <div className="editor-content">
        {activeTab === 'general' && (
          <div className="editor-section">
            <h3>
              <i className="fas fa-info-circle me-2"></i>
              Información General
            </h3>
            
            <div className="property-creation-help">
              <div className="alert alert-info">
                <i className="fas fa-lightbulb me-2"></i>
                <strong>Creando una nueva propiedad:</strong> Completa toda la información básica, precios y descripciones. 
                Asegúrate de agregar imágenes de calidad y un video atractivo.
              </div>
            </div>
            
            <div className="form-group">
              <label>
                <i className="fas fa-building"></i>
                Título de la Propiedad *
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ej: Moldes 1680 - Departamento Moderno en Palermo"
                required
              />
              <small className="text-muted">
                Usa un título descriptivo que incluya la dirección y características principales
              </small>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-map-marker-alt"></i>
                Dirección Completa *
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Ej: Moldes 1680, Palermo, Buenos Aires, Argentina"
                required
              />
              <small className="text-muted">
                Incluye calle, número, barrio y ciudad para mejor ubicación
              </small>
            </div>

            <div className="property-id-section">
              <div className="form-group">
                <label>
                  <i className="fas fa-tag"></i>
                  ID de la Propiedad (Auto-generado)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={propertyId || 'Se genera automáticamente al guardar'}
                  disabled
                  style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                />
                <small className="text-muted">
                  El ID se genera automáticamente basado en la dirección
                </small>
              </div>
            </div>

            <div className="property-block-section mt-4">
              <div className="form-group">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label d-flex align-items-center mb-0">
                    <i className={`fas fa-${formData.isBlocked ? 'lock text-danger' : 'unlock text-success'} me-2`}></i>
                    <span>Estado de la Propiedad:</span>
                  </label>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="blockToggle"
                      checked={!formData.isBlocked}
                      onChange={() => handleInputChange('isBlocked', !formData.isBlocked)}
                      style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                    />
                    <label className="form-check-label" htmlFor="blockToggle" style={{ cursor: 'pointer' }}>
                      <span className={formData.isBlocked ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                        {formData.isBlocked ? 'BLOQUEADO' : 'DISPONIBLE'}
                      </span>
                    </label>
                  </div>
                </div>
                <div className={`alert ${formData.isBlocked ? 'alert-danger' : 'alert-success'} mt-2 py-2`}>
                  {formData.isBlocked ? (
                    <>
                      <i className="fas fa-exclamation-circle me-2"></i>
                      Esta propiedad está <strong>BLOQUEADA</strong> y no aparecerá en el sitio web.
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle me-2"></i>
                      Esta propiedad está <strong>DISPONIBLE</strong> y aparecerá en el sitio web.
                    </>
                  )}
                </div>
                {formData.isBlocked && (
                  <div className="form-group mt-2">
                    <label>Razón del bloqueo (opcional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.blockReason || ''}
                      onChange={(e) => handleInputChange('blockReason', e.target.value)}
                      placeholder="Ej: Renovación en curso, No disponible temporalmente..."
                    />
                  </div>
                )}
              </div>
            </div>

            <ImageUploader
              value={formData.coverImage}
              onChange={(value) => handleInputChange('coverImage', value)}
              label="Imagen de Portada Principal *"
              required={true}
            />
            
            <div className="image-requirements mt-2">
              <h6><i className="fas fa-camera text-primary me-2"></i>Requerimientos de imagen:</h6>
              <ul className="list-unstyled small">
                <li><i className="fas fa-check text-success me-2"></i>Formato: JPG, PNG o WebP</li>
                <li><i className="fas fa-check text-success me-2"></i>Tamaño recomendado: 1920x1080 o 16:9</li>
                <li><i className="fas fa-check text-success me-2"></i>Máximo 5MB de tamaño</li>
                <li><i className="fas fa-check text-success me-2"></i>Imagen que represente mejor el departamento</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'prices' && (
          <div className="editor-section">
            <h3>
              <i className="fas fa-dollar-sign me-2"></i>
              Gestión de Precios
            </h3>
            <div className="alert alert-info">
              <i className="fas fa-info-circle"></i>
              <strong>Configuración de precios:</strong> Define los precios para diferentes períodos de estadía. 
              Los precios se mostrarán automáticamente según la duración de la reserva.
            </div>
            
            <div className="pricing-strategy mb-3">
              <h5>
                <i className="fas fa-chart-line text-success me-2"></i>
                Estrategia de Precios Recomendada
              </h5>
              <div className="pricing-tips">
                <div className="tip-item">
                  <i className="fas fa-calendar-day text-primary me-2"></i>
                  <span><strong>Precio Diario:</strong> Para estadías de 1-6 días (precio más alto por día)</span>
                </div>
                <div className="tip-item">
                  <i className="fas fa-calendar-week text-info me-2"></i>
                  <span><strong>Precio Semanal:</strong> Para estadías de 7-29 días (descuento por volumen)</span>
                </div>
                <div className="tip-item">
                  <i className="fas fa-calendar text-success me-2"></i>
                  <span><strong>Precio Mensual:</strong> Para estadías de 30+ días (máximo descuento)</span>
                </div>
              </div>
            </div>
            
            <div className="prices-grid">
              <div className="form-group">
                <label>
                  <i className="fas fa-calendar"></i>
                  Precio Mensual (30+ días) *
                </label>
                <div className="input-group">
                  <span className="input-group-text">USD</span>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.prices.monthly ? String(formData.prices.monthly).replace(/[^\d]/g, '') : ''}
                    onChange={(e) => handleNestedInputChange('prices', 'monthly', `USD ${e.target.value}`)}
                    placeholder="1200"
                    required
                  />
                </div>
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Precio competitivo para estadías largas. Recomendado: 20-30% menos que precio diario × 30
                </small>
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-calendar-week"></i>
                  Precio Semanal (7-29 días) *
                </label>
                <div className="input-group">
                  <span className="input-group-text">USD</span>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.prices.weekly ? String(formData.prices.weekly).replace(/[^\d]/g, '') : ''}
                    onChange={(e) => handleNestedInputChange('prices', 'weekly', `USD ${e.target.value}`)}
                    placeholder="350"
                    required
                  />
                </div>
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Precio por semana completa. Recomendado: 10-15% menos que precio diario × 7
                </small>
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-calendar-day"></i>
                  Precio Diario (1-6 días) *
                </label>
                <div className="input-group">
                  <span className="input-group-text">USD</span>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.prices.daily ? String(formData.prices.daily).replace(/[^\d]/g, '') : ''}
                    onChange={(e) => handleNestedInputChange('prices', 'daily', `USD ${e.target.value}`)}
                    placeholder="90"
                    required
                  />
                </div>
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Precio base por día. Este será el precio más alto por día
                </small>
              </div>
            </div>
            
            <div className="price-calculator mt-4">
              <h5>
                <i className="fas fa-calculator text-warning me-2"></i>
                Calculadora de Rentabilidad
              </h5>
              <div className="calculator-grid">
                <div className="calc-item">
                  <span className="calc-label">Precio diario:</span>
                  <span className="calc-value">{formData.prices.daily || 'N/A'}</span>
                </div>
                <div className="calc-item">
                  <span className="calc-label">Ingresos por semana:</span>
                  <span className="calc-value">
                    {formData.prices.weekly || (formData.prices.daily ? `USD ${parseInt(formData.prices.daily.replace(/[^\d]/g, '')) * 7}` : 'N/A')}
                  </span>
                </div>
                <div className="calc-item">
                  <span className="calc-label">Ingresos por mes:</span>
                  <span className="calc-value">
                    {formData.prices.monthly || (formData.prices.daily ? `USD ${parseInt(formData.prices.daily.replace(/[^\d]/g, '')) * 30}` : 'N/A')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="price-preview mt-3">
              <h5>
                <i className="fas fa-eye text-info me-2"></i>
                Vista previa (como se muestra a los clientes):
              </h5>
              <div className="price-tags">
                <span className="badge bg-primary">Mensual: {formData.prices.monthly || 'No definido'}</span>
                <span className="badge bg-success">Semanal: {formData.prices.weekly || 'No definido'}</span>
                <span className="badge bg-info">Diario: {formData.prices.daily || 'No definido'}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'descriptions' && (
          <div className="editor-section">
            <h3>
              <i className="fas fa-language me-2"></i>
              Descripciones Multiidioma
            </h3>
            
            <div className="description-guidelines mb-4">
              <div className="alert alert-info">
                <i className="fas fa-writing me-2"></i>
                <strong>Guía para descripciones efectivas:</strong>
                <ul className="mt-2 mb-0">
                  <li>Destaca las características únicas del departamento</li>
                  <li>Menciona servicios cercanos (transporte, restaurantes, atracciones)</li>
                  <li>Incluye información sobre amenities y comodidades</li>
                  <li>Especifica reglas importantes (mascotas, fumadores, etc.)</li>
                </ul>
              </div>
            </div>
            
            <div className="form-group">
              <label>
                <i className="fas fa-flag me-2"></i>
                <img src="https://flagcdn.com/w20/ar.png" alt="Español" className="flag-icon me-2" />
                Descripción en Español *
              </label>
              <textarea
                className="form-control"
                rows="6"
                value={formData.description.es}
                onChange={(e) => handleNestedInputChange('description', 'es', e.target.value)}
                placeholder="Describe el departamento en español. Ejemplo: 
                
Hermoso departamento de 2 ambientes ubicado en el corazón de Palermo. Cuenta con todas las comodidades necesarias para una estadía perfecta: WiFi de alta velocidad, aire acondicionado, cocina completamente equipada y balcón con vista a la ciudad. 

A solo 2 cuadras del Subte línea D y rodeado de los mejores restaurantes y bares de la zona. Ideal para parejas o viajeros de negocios que buscan confort y ubicación estratégica.

• 2 ambientes con capacidad para 4 personas
• WiFi de alta velocidad 
• Aire acondicionado/calefacción
• Cocina equipada con microondas, heladera y utensilios
• TV Smart con Netflix
• Ropa de cama y toallas incluidas"
                required
              />
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Caracteres recomendados: 300-800. Actual: {formData.description.es.length}
              </small>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-flag me-2"></i>
                <img src="https://flagcdn.com/w20/us.png" alt="English" className="flag-icon me-2" />
                Descripción en Inglés *
              </label>
              <textarea
                className="form-control"
                rows="6"
                value={formData.description.en}
                onChange={(e) => handleNestedInputChange('description', 'en', e.target.value)}
                placeholder="Describe the apartment in English. Example:

Beautiful 2-room apartment located in the heart of Palermo. Features all necessary amenities for a perfect stay: high-speed WiFi, air conditioning, fully equipped kitchen, and balcony with city views.

Just 2 blocks from Subway line D and surrounded by the best restaurants and bars in the area. Perfect for couples or business travelers seeking comfort and strategic location.

• 2 rooms with capacity for 4 people
• High-speed WiFi
• Air conditioning/heating  
• Equipped kitchen with microwave, fridge and utensils
• Smart TV with Netflix
• Bed linens and towels included"
                required
              />
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Recommended characters: 300-800. Current: {formData.description.en.length}
              </small>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-flag me-2"></i>
                <img src="https://flagcdn.com/w20/br.png" alt="Português" className="flag-icon me-2" />
                Descripción en Português *
              </label>
              <textarea
                className="form-control"
                rows="6"
                value={formData.description.pt}
                onChange={(e) => handleNestedInputChange('description', 'pt', e.target.value)}
                placeholder="Descreva o apartamento em português. Exemplo:

Lindo apartamento de 2 ambientes localizado no coração de Palermo. Possui todas as comodidades necessárias para uma estadia perfeita: WiFi de alta velocidade, ar condicionado, cozinha totalmente equipada e varanda com vista para a cidade.

A apenas 2 quarteirões do Metrô linha D e cercado pelos melhores restaurantes e bares da região. Ideal para casais ou viajantes de negócios que buscam conforto e localização estratégica.

• 2 ambientes com capacidade para 4 pessoas
• WiFi de alta velocidade
• Ar condicionado/aquecimento
• Cozinha equipada com microondas, geladeira e utensílios
• TV Smart com Netflix  
• Roupas de cama e toalhas incluídas"
                required
              />
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Caracteres recomendados: 300-800. Atual: {formData.description.pt.length}
              </small>
            </div>
            
            <div className="description-tips mt-4">
              <h5>
                <i className="fas fa-lightbulb text-warning me-2"></i>
                Consejos para descripciones exitosas:
              </h5>
              <div className="tips-grid">
                <div className="tip-card">
                  <i className="fas fa-home text-primary"></i>
                  <strong>Amenities</strong>
                  <p>WiFi, AC, TV, Cocina, Balcón</p>
                </div>
                <div className="tip-card">
                  <i className="fas fa-map-marker-alt text-success"></i>
                  <strong>Ubicación</strong>
                  <p>Transporte, Restaurantes, Atracciones</p>
                </div>
                <div className="tip-card">
                  <i className="fas fa-users text-info"></i>
                  <strong>Capacidad</strong>
                  <p>Número de huéspedes, Camas, Baños</p>
                </div>
                <div className="tip-card">
                  <i className="fas fa-rules text-warning"></i>
                  <strong>Reglas</strong>
                  <p>Check-in/out, Mascotas, Fumadores</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="editor-section">
            <h3>Video Hero de la Propiedad</h3>
            <p className="text-muted mb-3">
              <i className="fas fa-info-circle me-1"></i>
              Este video se mostrará en la sección hero de la página de la propiedad
            </p>
            
            <VideoUploader
              value={formData.heroVideo}
              onChange={(value) => handleInputChange('heroVideo', value)}
              label="Video Principal"
              required={false}
            />
            
            <div className="video-recommendations mt-3">
              <h5><i className="fas fa-lightbulb text-warning me-2"></i>Recomendaciones:</h5>
              <ul className="list-unstyled">
                <li><i className="fas fa-check text-success me-2"></i>Formato: MP4 preferible</li>
                <li><i className="fas fa-check text-success me-2"></i>Duración: 10-60 segundos ideal</li>
                <li><i className="fas fa-check text-success me-2"></i>Tamaño: Máximo 50MB</li>
                <li><i className="fas fa-check text-success me-2"></i>Resolución: 1920x1080 (Full HD) recomendado</li>
                <li><i className="fas fa-check text-success me-2"></i>Contenido: Mostrar las mejores características del departamento</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="editor-section">
            <h3>Gestión de Imágenes</h3>
            <p className="text-muted mb-4">
              <i className="fas fa-info-circle me-1"></i>
              Arrastra imágenes aquí o haz clic para seleccionar. Máximo 20 imágenes. 
              Desde dispositivos móviles también puedes tomar fotos directamente.
            </p>
            
            {/* Debug del propertyId */}
            {!propertyId && (
              <div className="alert alert-warning mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Advertencia:</strong> ID de propiedad no disponible. Guarda la propiedad primero antes de subir imágenes.
              </div>
            )}
            
            <ImageUploaderOptimized
              propertyId={propertyId}
              onImagesChange={handleGalleryImagesChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyEditor;
