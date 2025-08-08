import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext-STATEFUL';

const PropertyEditor = ({ propertyId }) => {
  const { updateProperty, getProperty, addProperty, deleteProperty } = useAdmin();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    id: '',
    price: '',
    maxGuests: 4,
    rooms: 1,
    bathrooms: 1,
    area: '',
    description: {
      es: '',
      en: '',
      pt: ''
    },
    coverImage: null
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (propertyId === 'new') {
      setIsCreating(true);
      setProperty(null);
    } else if (propertyId) {
      const prop = getProperty(propertyId);
      if (prop) {
        setProperty(prop);
        setFormData({
          title: prop.title || '',
          address: prop.address || '',
          id: prop.id || '',
          price: prop.price || '',
          maxGuests: prop.maxGuests || 4,
          rooms: prop.rooms || 1,
          bathrooms: prop.bathrooms || 1,
          area: prop.area || '',
          description: prop.description || {
            es: '',
            en: '',
            pt: ''
          },
          coverImage: prop.coverImage || null,
          ...prop
        });
      }
    }
  }, [propertyId, getProperty]);

  const sanitizeId = (str) => {
    return str?.toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDescriptionChange = (lang, value) => {
    setFormData(prev => ({
      ...prev,
      description: {
        ...prev.description,
        [lang]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage('');

      // Validación simple
      if (!formData.title?.trim()) {
        setMessage('❌ El título es requerido');
        return;
      }

      if (!formData.address?.trim()) {
        setMessage('❌ La dirección es requerida');
        return;
      }

      if (isCreating) {
        // Crear nueva propiedad
        let finalId = formData.id?.trim() || sanitizeId(formData.title);
        if (!finalId) {
          finalId = `property-${Date.now()}`;
        }

        const propertyData = { ...formData, id: finalId };
        
        setMessage('Creando propiedad...');
        await addProperty(propertyData);
        setMessage('✅ Propiedad creada exitosamente');
        
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } else {
        // Actualizar propiedad existente
        setMessage('Guardando cambios...');
        await updateProperty(property.id, formData);
        setMessage('✅ Cambios guardados exitosamente');
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error al guardar:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!property?.id) return;

    const confirmDelete = window.confirm(`¿Eliminar "${property.title}" PERMANENTEMENTE?`);
    if (!confirmDelete) return;

    try {
      setIsSaving(true);
      setMessage('🗑️ Eliminando propiedad...');
      
      await deleteProperty(property.id);
      setMessage('✅ Propiedad eliminada exitosamente');
      
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>
              <i className="fas fa-building me-2"></i>
              {isCreating ? 'Crear Nueva Propiedad' : `Editar ${property?.title || 'Propiedad'}`}
            </h3>
            <div className="d-flex gap-2">
              {!isCreating && (
                <>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => navigate(`/departamentos/${property.id}`)}
                  >
                    <i className="fas fa-eye me-2"></i>
                    Ver Página
                  </button>
                  <button 
                    className="btn btn-outline-danger"
                    onClick={handleDelete}
                    disabled={isSaving}
                  >
                    <i className="fas fa-trash-alt me-2"></i>
                    Eliminar
                  </button>
                </>
              )}
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/admin')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Volver
              </button>
            </div>
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div className={`alert ${message.includes('❌') || message.includes('Error') ? 'alert-danger' : 
                                   message.includes('⚠️') ? 'alert-warning' : 'alert-success'} mb-3`}>
              <i className={`fas ${message.includes('❌') || message.includes('Error') ? 'fa-exclamation-circle' : 
                                   message.includes('⚠️') ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2`}></i>
              {message}
            </div>
          )}

          {/* Formulario simplificado */}
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <i className="fas fa-tag me-2"></i>
                    Título *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ej: Departamento en Palermo"
                    required
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Dirección *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ej: Av. Santa Fe 1234"
                    required
                  />
                </div>

                {isCreating && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-key me-2"></i>
                      ID (opcional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="id"
                      value={formData.id}
                      onChange={handleInputChange}
                      placeholder="Se generará automáticamente si se deja vacío"
                    />
                  </div>
                )}

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <i className="fas fa-dollar-sign me-2"></i>
                    Precio por noche
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Ej: 5000"
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">
                    <i className="fas fa-users me-2"></i>
                    Huéspedes
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="maxGuests"
                    value={formData.maxGuests}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">
                    <i className="fas fa-bed me-2"></i>
                    Habitaciones
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="rooms"
                    value={formData.rooms}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">
                    <i className="fas fa-bath me-2"></i>
                    Baños
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    min="1"
                    max="5"
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">
                    <i className="fas fa-expand me-2"></i>
                    Área (m²)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="Ej: 45"
                  />
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">
                    <i className="fas fa-align-left me-2"></i>
                    Descripción
                  </label>
                  <div className="row">
                    <div className="col-md-4">
                      <label className="form-label text-muted">Español</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description.es}
                        onChange={(e) => handleDescriptionChange('es', e.target.value)}
                        placeholder="Descripción en español..."
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted">English</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description.en}
                        onChange={(e) => handleDescriptionChange('en', e.target.value)}
                        placeholder="Description in English..."
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted">Português</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description.pt}
                        onChange={(e) => handleDescriptionChange('pt', e.target.value)}
                        placeholder="Descrição em português..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/admin')}
              disabled={isSaving}
            >
              <i className="fas fa-times me-2"></i>
              Cancelar
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  {isCreating ? 'Crear Propiedad' : 'Guardar Cambios'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyEditor;
