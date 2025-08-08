import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import ImageUploader from './ImageUploader';
import VideoUploader from './VideoUploader';
import MultipleImageUploader from './MultipleImageUploader';
import './AddPropertyForm.css';

function AddPropertyForm({ onClose }) {
  const { updateProperty, getAllProperties } = useAdmin();
  const [formData, setFormData] = useState({
    id: '',
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

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
    console.log('🖼️ ADD FORM GALLERY: Cambiando imágenes:', newImages);
    setFormData(prev => ({
      ...prev,
      galleryImages: newImages
    }));
  };

  const generateId = (title) => {
    return title.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const propertyId = formData.id || generateId(formData.title);
      const properties = getAllProperties();

      if (properties[propertyId]) {
        setMessage('❌ Ya existe una propiedad con ese ID');
        setIsSubmitting(false);
        return;
      }

      const newProperty = {
        ...formData,
        id: propertyId,
        galleryImages: formData.galleryImages.filter(img => img && (typeof img === 'string' ? img.trim() !== '' : true))
      };

      updateProperty(propertyId, newProperty);
      setMessage('✅ Propiedad agregada exitosamente');
      
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      setMessage('❌ Error al agregar la propiedad');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="add-property-form">
      <form onSubmit={handleSubmit}>
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Información básica */}
        <div className="form-section">
          <h4><i className="fas fa-info-circle"></i> Información Básica</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Título de la Propiedad *</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => {
                  handleInputChange('title', e.target.value);
                  handleInputChange('id', generateId(e.target.value));
                }}
                placeholder="Ej: Santa Fe 4000"
                required
              />
            </div>

            <div className="form-group">
              <label>ID de la Propiedad</label>
              <input
                type="text"
                className="form-control"
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                placeholder="Se genera automáticamente"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Dirección Completa *</label>
            <input
              type="text"
              className="form-control"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Ej: Santa Fe 4000, Buenos Aires"
              required
            />
          </div>

          <ImageUploader
            value={formData.coverImage}
            onChange={(value) => handleInputChange('coverImage', value)}
            label="Imagen de Portada"
            required={true}
          />

          <VideoUploader
            value={formData.heroVideo}
            onChange={(value) => handleInputChange('heroVideo', value)}
            label="Video Principal (Hero)"
            required={false}
          />
        </div>

        {/* Precios */}
        <div className="form-section">
          <h4><i className="fas fa-dollar-sign"></i> Precios</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Precio Mensual *</label>
              <input
                type="text"
                className="form-control"
                value={formData.prices.monthly}
                onChange={(e) => handleNestedInputChange('prices', 'monthly', e.target.value)}
                placeholder="USD 1200"
                required
              />
            </div>

            <div className="form-group">
              <label>Precio Semanal *</label>
              <input
                type="text"
                className="form-control"
                value={formData.prices.weekly}
                onChange={(e) => handleNestedInputChange('prices', 'weekly', e.target.value)}
                placeholder="USD 400"
                required
              />
            </div>

            <div className="form-group">
              <label>Precio Diario *</label>
              <input
                type="text"
                className="form-control"
                value={formData.prices.daily}
                onChange={(e) => handleNestedInputChange('prices', 'daily', e.target.value)}
                placeholder="USD 70"
                required
              />
            </div>
          </div>
        </div>

        {/* Descripciones */}
        <div className="form-section">
          <h4><i className="fas fa-language"></i> Descripciones</h4>
          
          <div className="form-group">
            <label>Descripción en Español *</label>
            <textarea
              className="form-control"
              rows="3"
              value={formData.description.es}
              onChange={(e) => handleNestedInputChange('description', 'es', e.target.value)}
              placeholder="Descripción detallada en español..."
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción en Inglés</label>
            <textarea
              className="form-control"
              rows="3"
              value={formData.description.en}
              onChange={(e) => handleNestedInputChange('description', 'en', e.target.value)}
              placeholder="Detailed description in English..."
            />
          </div>

          <div className="form-group">
            <label>Descripción en Português</label>
            <textarea
              className="form-control"
              rows="3"
              value={formData.description.pt}
              onChange={(e) => handleNestedInputChange('description', 'pt', e.target.value)}
              placeholder="Descrição detalhada em português..."
            />
          </div>
        </div>

        {/* Galería */}
        <div className="form-section">
          <h4><i className="fas fa-images"></i> Galería de Imágenes</h4>
          <p className="text-muted mb-3">
            <i className="fas fa-info-circle me-1"></i>
            Sube múltiples imágenes para la galería del departamento
          </p>
          
          <MultipleImageUploader
            currentImages={formData.galleryImages}
            onImagesChange={handleGalleryImagesChange}
            title="Galería del Departamento"
          />
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            <i className="fas fa-times"></i>
            Cancelar
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Agregando...
              </>
            ) : (
              <>
                <i className="fas fa-plus"></i>
                Agregar Propiedad
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddPropertyForm;
