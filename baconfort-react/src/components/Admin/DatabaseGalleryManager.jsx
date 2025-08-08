import { useState, useEffect } from 'react';
import { galleryAPI } from '../../services/api';
import galleryEventManager from '../../utils/GalleryEventManager';
import './DatabaseGalleryManager.css';

function DatabaseGalleryManager({ propertyId, onImagesChange }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState('');

  // Mapeo de IDs de página a IDs de base de datos
  const propertyIdMap = {
    'moldes1680': 'moldes-1680',
    'santafe3770': 'santa-fe-3770',
    'dorrego1548': 'dorrego-1548',
    'convencion1994': 'convencion-1994',
    'ugarteche2824': 'ugarteche-2824'
  };

  // Usar el ID correcto para la base de datos
  const dbPropertyId = propertyIdMap[propertyId] || propertyId;

  // Cargar imágenes al montar el componente
  useEffect(() => {
    if (propertyId) {
      loadImages();
    }
  }, [propertyId]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await galleryAPI.getByProperty(dbPropertyId);
      
      // El backend devuelve {success: true, data: [...]}
      const images = response.data || [];
      const sortedImages = images.sort((a, b) => (a.order || 0) - (b.order || 0));
      setImages(sortedImages);
      
      // Notificar al componente padre sobre las imágenes cargadas
      if (onImagesChange) {
        onImagesChange(sortedImages);
      }
    } catch (error) {
      console.error('❌ GALLERY DB: Error cargando imágenes:', error);
      showMessage('Error al cargar las imágenes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  // Función para comprimir imágenes
  const compressImage = (file, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        const maxWidth = 1920;
        const maxHeight = 1080;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    setUploading(true);

    try {
      const processedImages = [];
      
      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) {
          console.warn('⚠️ GALLERY DB: Archivo no es imagen:', file.name);
          continue;
        }

        let imageData;
        
        // Comprimir si es necesario
        if (file.size > 2 * 1024 * 1024) {
          console.log(`🔧 GALLERY DB: Comprimiendo ${file.name}`);
          imageData = await compressImage(file, 0.7);
        } else {
          const reader = new FileReader();
          imageData = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error(`Error leyendo ${file.name}`));
            reader.readAsDataURL(file);
          });
        }

        processedImages.push({
          name: file.name,
          data: imageData,
          size: file.size
        });
      }

      if (processedImages.length > 0) {
        console.log('📤 GALLERY DB: Subiendo', processedImages.length, 'imágenes');
        
        const response = await galleryAPI.uploadImages(dbPropertyId, processedImages);
        
        if (response.success) {
          showMessage(`✅ ${processedImages.length} imagen(es) subida(s) exitosamente`);
          await loadImages(); // Recargar la galería
          
          // Notificar cambios en la galería
          galleryEventManager.notifyGalleryChanged(dbPropertyId);
        } else {
          throw new Error(response.error || 'Error en la subida');
        }
      }
      
    } catch (error) {
      console.error('❌ GALLERY DB: Error subiendo imágenes:', error);
      showMessage('Error al subir las imágenes: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta imagen?')) {
      return;
    }

    try {
      const response = await galleryAPI.deleteImage(dbPropertyId, imageId);
      if (response.success) {
        showMessage('Imagen eliminada exitosamente');
        await loadImages(); // Recargar la galería
        // Notificar cambios en la galería
        galleryEventManager.notifyGalleryChanged(dbPropertyId);
      } else {
        throw new Error(response.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('❌ GALLERY DB: Error eliminando imagen:', error);
      showMessage('Error al eliminar la imagen: ' + error.message, 'error');
    }
  };

  const setCoverImage = async (imageId) => {
    try {
      const response = await galleryAPI.setCoverImage(imageId);
      if (response.success) {
        showMessage('Imagen establecida como portada');
        await loadImages(); // Recargar para actualizar el estado
        
        // Notificar cambios en la galería
        galleryEventManager.notifyGalleryChanged(dbPropertyId);
      } else {
        throw new Error(response.error || 'Error al establecer portada');
      }
    } catch (error) {
      console.error('❌ GALLERY DB: Error estableciendo portada:', error);
      showMessage('Error al establecer como portada: ' + error.message, 'error');
    }
  };

  const clearAllImages = async () => {
    if (!window.confirm('¿Estás seguro de eliminar TODAS las imágenes? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      for (const image of images) {
        await galleryAPI.deleteImage(image.id);
      }
      showMessage('Todas las imágenes eliminadas');
      await loadImages();
      
      // Notificar cambios en la galería
      galleryEventManager.notifyGalleryChanged(dbPropertyId);
    } catch (error) {
      console.error('❌ GALLERY DB: Error eliminando todas las imágenes:', error);
      showMessage('Error al eliminar las imágenes: ' + error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="db-gallery-manager">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p>Cargando galería...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="db-gallery-manager">
      <div className="gallery-header">
        <h4>
          <i className="fas fa-database"></i> Galería de la Base de Datos
          <span className="image-count">({images.length} imágenes)</span>
        </h4>
        {images.length > 0 && (
          <button 
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={clearAllImages}
          >
            <i className="fas fa-trash"></i> Eliminar Todas
          </button>
        )}
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'} alert-dismissible`}>
          {message.text}
        </div>
      )}

      {/* Drop Zone para subir nuevas imágenes */}
      <div 
        className={`drop-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          id="db-gallery-input"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="file-input"
          disabled={uploading}
        />
        
        <div className="drop-content">
          {uploading ? (
            <>
              <i className="fas fa-spinner fa-spin fa-2x"></i>
              <p>Subiendo a la base de datos...</p>
            </>
          ) : (
            <>
              <i className="fas fa-cloud-upload-alt fa-2x"></i>
              <p>
                <strong>Arrastra imágenes aquí</strong> o{' '}
                <label htmlFor="db-gallery-input" className="file-label">
                  haz clic para seleccionar
                </label>
              </p>
              <small>Las imágenes se guardarán en la base de datos</small>
            </>
          )}
        </div>
      </div>

      {/* Galería de imágenes */}
      {images.length > 0 && (
        <div className="images-gallery">
          <div className="images-grid">
            {images.map((image, index) => (
              <div key={image.id} className="image-item">
                <img 
                  src={image.url} 
                  alt={image.alt || `Imagen ${index + 1}`}
                  className="gallery-image"
                />
                
                {/* Overlay con controles */}
                <div className="image-overlay">
                  <div className="image-controls">
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => setCoverImage(image.id)}
                      title="Establecer como portada"
                      disabled={image.isMain}
                    >
                      <i className="fas fa-star"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteImage(image.id)}
                      title="Eliminar imagen"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  
                  {/* Indicadores */}
                  <div className="image-indicators">
                    {image.isMain && (
                      <span className="cover-badge">
                        <i className="fas fa-star"></i> Portada
                      </span>
                    )}
                    <span className="image-order">#{image.order}</span>
                  </div>
                </div>

                {/* Información de la imagen */}
                <div className="image-info">
                  <small className="image-name">{image.filename}</small>
                  <small className="image-size">
                    {image.dimensions?.width}x{image.dimensions?.height} • {Math.round(image.fileSize / 1024)}KB
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="gallery-instructions">
        <h6><i className="fas fa-info-circle"></i> Gestión de Galería:</h6>
        <ul>
          <li><strong>Subir:</strong> Arrastra múltiples imágenes o haz clic para seleccionar</li>
          <li><strong>Portada:</strong> Haz clic en ⭐ para establecer una imagen como portada</li>
          <li><strong>Eliminar:</strong> Haz clic en 🗑️ para eliminar una imagen específica</li>
          <li><strong>Optimización:</strong> Imágenes &gt;2MB se comprimen automáticamente</li>
          <li><strong>Persistencia:</strong> Las imágenes se guardan en la base de datos</li>
          <li><strong>Orden:</strong> Las imágenes se muestran según su orden en la BD</li>
        </ul>
      </div>
    </div>
  );
}

export default DatabaseGalleryManager;
