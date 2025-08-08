import { useState, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import './ImageManager.css';

function ImageManager({ properties, onClose }) {
  const { updateProperty } = useAdmin();
  const [selectedProperty, setSelectedProperty] = useState('');
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const propertyList = Object.values(properties);

  const handlePropertySelect = (propertyId) => {
    setSelectedProperty(propertyId);
    const property = properties[propertyId];
    if (property) {
      setImages([property.coverImage, ...property.galleryImages]);
    }
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  // Función para abrir el selector de archivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Función para manejar la selección de archivos
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    setUploading(true);
    setMessage('📤 Subiendo imágenes...');

    try {
      for (const file of files) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          setMessage(`❌ ${file.name} no es una imagen válida`);
          continue;
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setMessage(`❌ ${file.name} es muy grande (máximo 5MB)`);
          continue;
        }

        // Convertir a base64 para mostrar preview
        const base64 = await fileToBase64(file);
        
        // Crear nombre único para el archivo
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const fileName = `uploaded-${timestamp}-${Math.random().toString(36).substr(2, 9)}.${extension}`;
        const imagePath = `/img/${fileName}`;

        // Agregar a la lista de imágenes
        setImages(prev => [...prev, imagePath]);
        
        // Simular guardado del archivo (en una implementación real, aquí subirías a un servidor)
        console.log('Archivo seleccionado:', {
          originalName: file.name,
          newPath: imagePath,
          size: file.size,
          type: file.type,
          base64Preview: base64.substring(0, 50) + '...'
        });
      }

      setMessage('✅ Imágenes agregadas correctamente');
      
      // Limpiar el input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Error al procesar archivos:', error);
      setMessage('❌ Error al procesar las imágenes');
    } finally {
      setUploading(false);
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  // Función para convertir archivo a base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index, newUrl) => {
    setImages(prev => prev.map((img, i) => i === index ? newUrl : img));
  };

  const saveChanges = () => {
    if (!selectedProperty || images.length === 0) {
      setMessage('❌ Selecciona una propiedad y asegúrate de tener al menos una imagen');
      return;
    }

    const [coverImage, ...galleryImages] = images;
    
    updateProperty(selectedProperty, {
      coverImage,
      galleryImages: galleryImages.filter(img => img.trim() !== '')
    });

    setMessage('✅ Imágenes actualizadas correctamente');
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  return (
    <div className="image-manager">
      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Selector de propiedad */}
      <div className="property-selector">
        <h4><i className="fas fa-building"></i> Seleccionar Propiedad</h4>
        <select 
          className="form-control"
          value={selectedProperty}
          onChange={(e) => handlePropertySelect(e.target.value)}
        >
          <option value="">-- Selecciona una propiedad --</option>
          {propertyList.map(property => (
            <option key={property.id} value={property.id}>
              {property.title}
            </option>
          ))}
        </select>
      </div>

      {selectedProperty && (
        <>
          {/* Agregar nueva imagen */}
          <div className="add-image-section">
            <h4><i className="fas fa-plus"></i> Agregar Nueva Imagen</h4>
            
            {/* Input file oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            
            {/* Botones de carga */}
            <div className="upload-options">
              <div className="upload-buttons">
                <button 
                  className="btn btn-primary upload-btn"
                  onClick={openFileSelector}
                  disabled={uploading}
                >
                  <i className="fas fa-upload"></i>
                  {uploading ? 'Subiendo...' : 'Subir desde Dispositivo'}
                </button>
                
                <span className="upload-separator">O</span>
                
                <div className="url-input-section">
                  <div className="add-image-form">
                    <input
                      type="text"
                      className="form-control"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="URL de imagen (ej: /img/nueva-imagen.jpg)"
                      onKeyPress={(e) => e.key === 'Enter' && addImage()}
                      disabled={uploading}
                    />
                    <button 
                      className="btn btn-success"
                      onClick={addImage}
                      disabled={!newImageUrl.trim() || uploading}
                    >
                      <i className="fas fa-link"></i>
                      Agregar URL
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="upload-info">
                <small className="text-muted">
                  <i className="fas fa-info-circle"></i>
                  Formatos soportados: JPG, PNG, GIF, WebP | Tamaño máximo: 5MB por imagen
                </small>
                <div className="upload-help">
                  <details>
                    <summary>
                      <i className="fas fa-question-circle"></i>
                      ¿Cómo funciona la carga de imágenes?
                    </summary>
                    <div className="help-content">
                      <p><strong>📱 Desde celular:</strong> Toca "Subir desde Dispositivo" → Selecciona de galería o toma foto</p>
                      <p><strong>💻 Desde computadora:</strong> Haz clic en "Subir desde Dispositivo" → Selecciona archivos</p>
                      <p><strong>🔗 URL manual:</strong> Pega la dirección web de una imagen existente</p>
                      <p><strong>⭐ Orden:</strong> La primera imagen será la imagen principal de la propiedad</p>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de imágenes */}
          <div className="images-list">
            <h4><i className="fas fa-images"></i> Imágenes Actuales</h4>
            
            {images.length === 0 ? (
              <div className="no-images">
                <i className="fas fa-image fa-3x"></i>
                <p>No hay imágenes para esta propiedad</p>
                <small>Usa el botón "Subir desde Dispositivo" para agregar imágenes desde tu celular o computadora</small>
              </div>
            ) : (
              <>
                <div className="images-summary">
                  <span className="images-count">
                    <i className="fas fa-images"></i>
                    Total: {images.length} imagen{images.length !== 1 ? 'es' : ''}
                  </span>
                  <small className="text-muted">
                    La primera imagen será la imagen principal de la propiedad
                  </small>
                </div>
                
                <div className="images-grid">{images.map((imageUrl, index) => (
                  <div key={index} className="image-item">
                    <div className="image-header">
                      <span className="image-label">
                        {index === 0 ? (
                          <>
                            <i className="fas fa-star"></i>
                            Imagen Principal
                          </>
                        ) : (
                          <>
                            <i className="fas fa-image"></i>
                            Galería {index}
                          </>
                        )}
                      </span>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeImage(index)}
                        title="Eliminar imagen"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    
                    <div className="image-preview">
                      <img 
                        src={imageUrl} 
                        alt={`Imagen ${index + 1}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="image-error" style={{ display: 'none' }}>
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>Error al cargar imagen</span>
                      </div>
                    </div>
                    
                    <div className="image-input">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={imageUrl}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        placeholder="Ruta de la imagen"
                      />
                    </div>
                  </div>
                ))}
                </div>
              </>
            )}
          </div>

          {/* Botones de acción */}
          <div className="action-buttons">
            <button 
              className="btn btn-secondary"
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
              Cancelar
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={saveChanges}
              disabled={images.length === 0}
            >
              <i className="fas fa-save"></i>
              Guardar Cambios
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ImageManager;
