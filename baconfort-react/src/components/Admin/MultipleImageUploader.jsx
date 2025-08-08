import { useState } from 'react';
import './MultipleImageUploader.css';

function MultipleImageUploader({ 
  currentImages = [], 
  onImagesChange, 
  maxImages = 999,  // Sin límite práctico
  maxFileSize = 999 * 1024 * 1024, // Sin límite práctico (999MB)
  title = "Galería de Imágenes"
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Función para comprimir imágenes automáticamente
  const compressImage = (file, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones (máximo 1920x1080 para imágenes muy grandes)
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
        
        // Dibujar y comprimir
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    
    // Eliminamos la verificación de límite de cantidad
    setUploading(true);
    
    const promises = fileArray.map(file => {
      return new Promise(async (resolve, reject) => {
        if (!file.type.startsWith('image/')) {
          reject(new Error(`${file.name} no es una imagen válida`));
          return;
        }

        try {
          let imageSrc;
          
          // Si la imagen es muy grande (>2MB), la comprimimos automáticamente
          if (file.size > 2 * 1024 * 1024) {
            console.log(`🔧 COMPRESS: Comprimiendo ${file.name} (${Math.round(file.size / 1024 / 1024)}MB)`);
            imageSrc = await compressImage(file, 0.7);
          } else {
            // Para imágenes pequeñas, usar el método normal
            const reader = new FileReader();
            imageSrc = await new Promise((resolveRead, rejectRead) => {
              reader.onload = (e) => resolveRead(e.target.result);
              reader.onerror = () => rejectRead(new Error(`Error leyendo ${file.name}`));
              reader.readAsDataURL(file);
            });
          }
          
          resolve({
            id: Date.now() + Math.random(),
            src: imageSrc,
            name: file.name,
            size: file.size,
            compressed: file.size > 2 * 1024 * 1024
          });
        } catch (error) {
          reject(new Error(`Error procesando ${file.name}: ${error.message}`));
        }
      });
    });

    Promise.all(promises)
      .then(newImages => {
        const updatedImages = [...currentImages, ...newImages];
        onImagesChange(updatedImages);
        
        const compressedCount = newImages.filter(img => img.compressed).length;
        if (compressedCount > 0) {
          console.log(`✅ MULTIPLE UPLOAD: ${newImages.length} imágenes agregadas (${compressedCount} comprimidas automáticamente)`);
        } else {
          console.log(`✅ MULTIPLE UPLOAD: ${newImages.length} imágenes agregadas`);
        }
      })
      .catch(error => {
        console.error('❌ MULTIPLE UPLOAD Error:', error);
        alert(error.message);
      })
      .finally(() => {
        setUploading(false);
      });
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

  const removeImage = (identifier) => {
    console.log('🗑️ REMOVE: Eliminando imagen con identificador:', identifier);
    console.log('🗑️ REMOVE: Imágenes actuales:', currentImages);
    
    let updatedImages;
    
    // Si identifier es un número, es un índice
    if (typeof identifier === 'number') {
      console.log('🗑️ REMOVE: Eliminando por índice:', identifier);
      updatedImages = currentImages.filter((_, index) => index !== identifier);
    } else {
      // Si es string, es un id
      console.log('🗑️ REMOVE: Eliminando por ID:', identifier);
      updatedImages = currentImages.filter(img => img.id !== identifier);
    }
    
    console.log('🗑️ REMOVE: Imágenes después de eliminar:', updatedImages);
    onImagesChange(updatedImages);
    console.log('✅ MULTIPLE UPLOAD: Imagen eliminada exitosamente');
  };

  const clearAllImages = () => {
    if (window.confirm('¿Estás seguro de eliminar todas las imágenes?')) {
      onImagesChange([]);
      console.log('🗑️ MULTIPLE UPLOAD: Todas las imágenes eliminadas');
    }
  };

  return (
    <div className="multiple-image-uploader">
      <div className="uploader-header">
        <h4>
          <i className="fas fa-images"></i> {title}
          <span className="image-count">({currentImages.length})</span>
        </h4>
        {currentImages.length > 0 && (
          <button 
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={clearAllImages}
          >
            <i className="fas fa-trash"></i> Limpiar Todo
          </button>
        )}
      </div>

      {/* Drop Zone */}
      <div 
        className={`drop-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          id="multiple-file-input"
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
              <p>Procesando imágenes...</p>
            </>
          ) : (
            <>
              <i className="fas fa-cloud-upload-alt fa-2x"></i>
              <p>
                <strong>Arrastra imágenes aquí</strong> o{' '}
                <label htmlFor="multiple-file-input" className="file-label">
                  haz clic para seleccionar
                </label>
              </p>
              <small>Sin límites - Compresión automática para imágenes grandes</small>
            </>
          )}
        </div>
      </div>

      {/* Preview Grid */}
      {currentImages.length > 0 && (
        <div className="images-preview">
          <div className="images-grid">
            {currentImages.map((image, index) => (
              <div key={image.id || index} className="image-preview-item">
                <img 
                  src={image.src || image} 
                  alt={`Preview ${index + 1}`}
                  className="preview-image"
                />
                <div className="image-overlay">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm remove-btn"
                    onClick={() => {
                      console.log('🔥 CLICK: Botón eliminar presionado para imagen:', image, 'índice:', index);
                      const identifier = image.id ? image.id : index;
                      console.log('🔥 CLICK: Usando identificador:', identifier);
                      removeImage(identifier);
                    }}
                    title="Eliminar imagen"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  <span className="image-index">{index + 1}</span>
                </div>
                {image.name && (
                  <div className="image-info">
                    <small>{image.name}</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="uploader-instructions">
        <h6><i className="fas fa-info-circle"></i> Instrucciones:</h6>
        <ul>
          <li>Selecciona múltiples imágenes manteniendo Ctrl/Cmd</li>
          <li>O arrastra varias imágenes desde tu explorador</li>
          <li>Las imágenes se agregarán a la galería existente</li>
          <li>Puedes eliminar imágenes individualmente</li>
          <li>Sin límites de cantidad o tamaño de archivo</li>
          <li>Imágenes &gt;2MB se comprimen automáticamente para optimizar el almacenamiento</li>
          <li>El orden se puede cambiar arrastrando (próximamente)</li>
        </ul>
      </div>
    </div>
  );
}

export default MultipleImageUploader;
