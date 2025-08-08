import { useState, useRef } from 'react';

const GalleryImageUploader = ({ images = [], onImagesChange, propertyId, maxImages = 20 }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  // Función para abrir el selector de archivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
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

  // Función para manejar la selección de múltiples archivos
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (!files.length) return;

    // Verificar límite de imágenes
    if (images.length + files.length > maxImages) {
      setMessage(`❌ Máximo ${maxImages} imágenes permitidas`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploading(true);
    setMessage('📤 Procesando imágenes...');

    try {
      const newImages = [];

      for (const file of files) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          console.warn(`Archivo ${file.name} no es una imagen válida`);
          continue;
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.warn(`Archivo ${file.name} es muy grande (máximo 5MB)`);
          continue;
        }

        // Convertir a base64
        const base64 = await fileToBase64(file);
        
        // Crear objeto de imagen
        const imageObj = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          src: base64,
          alt: file.name.split('.')[0],
          originalName: file.name
        };

        newImages.push(imageObj);
      }

      // Actualizar las imágenes
      const updatedImages = [...images, ...newImages];
      onImagesChange(updatedImages);
      
      setMessage(`✅ ${newImages.length} imagen(es) cargadas correctamente`);
      
    } catch (error) {
      console.error('Error al procesar imágenes:', error);
      setMessage('❌ Error al procesar las imágenes');
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(''), 3000);
      
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Función para eliminar una imagen
  const removeImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  // Función para agregar imagen por URL
  const addImageByUrl = () => {
    const url = prompt('Ingresa la URL de la imagen:');
    if (url && url.trim()) {
      if (images.length >= maxImages) {
        setMessage(`❌ Máximo ${maxImages} imágenes permitidas`);
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      const imageObj = {
        id: `img_url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        src: url.trim(),
        alt: 'Imagen desde URL',
        originalName: 'URL'
      };

      const updatedImages = [...images, imageObj];
      onImagesChange(updatedImages);
    }
  };

  return (
    <div className="gallery-image-uploader">
      {/* Botones de acción */}
      <div className="mb-3">
        <button
          type="button"
          className="btn btn-primary me-2"
          onClick={openFileSelector}
          disabled={uploading || images.length >= maxImages}
        >
          <i className="fas fa-upload me-2"></i>
          {uploading ? 'Subiendo...' : 'Subir Imágenes'}
        </button>
        
        <button
          type="button"
          className="btn btn-outline-secondary me-2"
          onClick={addImageByUrl}
          disabled={uploading || images.length >= maxImages}
        >
          <i className="fas fa-link me-2"></i>
          Agregar por URL
        </button>

        <small className="text-muted">
          {images.length}/{maxImages} imágenes
        </small>
      </div>

      {/* Input oculto para archivos múltiples */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
      />

      {/* Mensaje de estado */}
      {message && (
        <div className={`alert ${message.includes('❌') ? 'alert-danger' : 'alert-success'} mb-3`}>
          {message}
        </div>
      )}

      {/* Galería de imágenes */}
      <div className="row">
        {images.map((image, index) => (
          <div key={image.id} className="col-md-3 col-sm-6 mb-3">
            <div className="card">
              <div className="position-relative">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="card-img-top"
                  style={{ 
                    height: '150px', 
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(image.src, '_blank')}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                  onClick={() => removeImage(image.id)}
                  title="Eliminar imagen"
                >
                  <i className="fas fa-times"></i>
                </button>
                <span className="badge bg-secondary position-absolute bottom-0 start-0 m-1">
                  #{index + 1}
                </span>
              </div>
              <div className="card-body p-2">
                <small className="text-muted d-block text-truncate">
                  {image.originalName}
                </small>
                <input
                  type="text"
                  className="form-control form-control-sm mt-1"
                  placeholder="Texto alternativo"
                  value={image.alt}
                  onChange={(e) => {
                    const updatedImages = images.map(img => 
                      img.id === image.id 
                        ? { ...img, alt: e.target.value }
                        : img
                    );
                    onImagesChange(updatedImages);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje cuando no hay imágenes */}
      {images.length === 0 && (
        <div className="text-center py-5 border border-dashed rounded">
          <i className="fas fa-images fa-3x text-muted mb-3"></i>
          <p className="text-muted">
            No hay imágenes en la galería.<br />
            Haz clic en "Subir Imágenes" para agregar hasta {maxImages} imágenes.
          </p>
        </div>
      )}

      {/* Ayuda */}
      <div className="mt-3">
        <small className="text-muted">
          <i className="fas fa-info-circle me-1"></i>
          Formatos soportados: JPG, PNG, GIF, WebP. Tamaño máximo: 5MB por imagen.
          Puedes subir múltiples imágenes a la vez.
        </small>
      </div>
    </div>
  );
};

export default GalleryImageUploader;
