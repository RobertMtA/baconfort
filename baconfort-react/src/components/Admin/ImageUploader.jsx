import React, { useState, useRef } from 'react';

const ImageUploader = ({ 
  propertyId, 
  currentImages = [], 
  onImagesUpdated, 
  maxImages = 20 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const uploadImages = async (files) => {
    if (!files || files.length === 0) return;

    // Validar que tenemos propertyId antes de intentar subir
    if (!propertyId) {
      alert('❌ Error: No hay ID de propiedad disponible. Guarda la propiedad primero antes de subir imágenes.');
      return;
    }

    // Validar que no excedamos el máximo de imágenes
    if (currentImages.length + files.length > maxImages) {
      alert(`❌ Error: Solo puedes subir hasta ${maxImages} imágenes. Ya tienes ${currentImages.length}.`);
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      
      // Agregar archivos al FormData
      Array.from(files).forEach((file, index) => {
        formData.append('images', file);
      });

      // Agregar propertyId al FormData para asegurarnos que el backend lo recibe
      formData.append('propertyId', propertyId);
      
      const token = localStorage.getItem('baconfort-token') || 'default-token-if-not-found';
      
      const response = await fetch(`http://localhost:3002/api/properties/${propertyId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // No establecer 'Content-Type' para FormData, el navegador lo hará automáticamente
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Verificar que result.data.images existe y es un array
        if (result.data?.images && Array.isArray(result.data.images)) {
          // Notificar al componente padre sobre las nuevas imágenes
          if (onImagesUpdated) {
            onImagesUpdated(result.data.images);
          }
        } else {
          console.error('Formato de respuesta inesperado:', result);
          throw new Error('Formato de respuesta del servidor inesperado');
        }
        
        // Limpiar input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(result.message || 'Error subiendo imágenes');
      }
    } catch (error) {
      console.error('❌ Error subiendo imágenes:', error);
      alert(`Error subiendo imágenes: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId) => {
    if (!propertyId) {
      alert('❌ Error: No hay ID de propiedad disponible.');
      return;
    }

    try {
      const token = localStorage.getItem('baconfort-token') || 'default-token-if-not-found';
      
      const response = await fetch(`http://localhost:3002/api/properties/${propertyId}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Verificar que result.data.images existe y es un array
        if (result.data?.images && Array.isArray(result.data.images)) {
          // Notificar al componente padre
          if (onImagesUpdated) {
            onImagesUpdated(result.data.images);
          }
        } else {
          console.error('Formato de respuesta inesperado:', result);
          throw new Error('Formato de respuesta del servidor inesperado');
        }
      } else {
        throw new Error(result.message || 'Error eliminando imagen');
      }
    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
      alert(`Error eliminando imagen: ${error.message}`);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadImages(files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadImages(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const remainingSlots = maxImages - currentImages.length;
  const canUploadMore = remainingSlots > 0;

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Área de carga */}
      {canUploadMore && (
        <div
          style={{
            border: dragOver ? '2px dashed #3b82f6' : '2px dashed #d1d5db',
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center',
            backgroundColor: dragOver ? '#eff6ff' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            id={`image-upload-${propertyId}`}
            name={`images-${propertyId}`}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            capture="environment"
            aria-label="Seleccionar imágenes para subir"
          />
          <label htmlFor={`image-upload-${propertyId}`} style={{ display: 'none' }}>
            Seleccionar imágenes
          </label>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '48px', color: '#9ca3af' }}>📁</div>
              <div style={{ fontSize: '48px', color: '#3b82f6' }}>📷</div>
              <div style={{ fontSize: '48px', color: '#10b981' }}>📱</div>
            </div>
            
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
              Subir Imágenes
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0' }}>
              Desde computadora, celular o cámara • JPG, PNG, GIF, WebP • Máx 10MB • {remainingSlots} slots disponibles
            </p>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              openFileDialog();
            }}
            disabled={uploading}
            type="button"
            aria-label="Abrir selector de imágenes"
            style={{
              backgroundColor: uploading ? '#9ca3af' : '#2563eb',
              color: 'white',
              padding: '8px 24px',
              borderRadius: '6px',
              border: 'none',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {uploading ? 'Subiendo...' : 'Seleccionar Imágenes'}
          </button>
        </div>
      )}

      {/* Progreso de carga */}
      {uploading && (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          padding: '16px',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '2px solid #2563eb',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ color: '#1e40af' }}>Subiendo imágenes...</span>
          </div>
        </div>
      )}

      {/* Grid de imágenes actuales */}
      {currentImages.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
            Imágenes Actuales ({currentImages.length}/{maxImages})
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            {currentImages.map((image, index) => (
              <div key={image.id || index} style={{ position: 'relative', group: true }}>
                <img
                  src={`http://localhost:3001${image.url || image}`}
                  alt={`Imagen ${index + 1} de la propiedad${index === 0 ? ' (Principal)' : ''}`}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDE1MCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUM5Q0ExIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VuPC90ZXh0Pgo8L3N2Zz4K';
                    e.target.alt = 'Imagen no disponible';
                  }}
                />
                
                {/* Botón eliminar */}
                <button
                  onClick={() => deleteImage(image.id)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderRadius: '50%',
                    border: 'none',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Eliminar imagen"
                  aria-label={`Eliminar imagen ${index + 1}`}
                  type="button"
                >
                  ✕
                </button>
                
                {/* Indicador de imagen principal */}
                {index === 0 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    Principal
                  </div>
                )}
                
                {/* ID único de la imagen */}
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  fontSize: '10px',
                  padding: '2px 4px',
                  borderRadius: '2px'
                }}>
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información */}
      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '16px',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ fontSize: '20px', color: '#9ca3af' }}>💡</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            <p style={{ fontWeight: '600', margin: '0 0 8px 0' }}>Tips para mejores imágenes:</p>
            <ul style={{ margin: '0', paddingLeft: '16px' }}>
              <li>La primera imagen será la imagen principal</li>
              <li>Usa buena iluminación natural cuando sea posible</li>
              <li>Muestra diferentes ángulos y espacios</li>
              <li>Máximo {maxImages} imágenes por propiedad</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CSS para animación */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImageUploader;