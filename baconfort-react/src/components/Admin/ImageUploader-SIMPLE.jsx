import React, { useState, useRef, useEffect } from 'react';

const ImageUploader = ({ 
  propertyId, 
  currentImages = [], 
  onImagesUpdated, 
  maxImages = 20 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // Cargar imágenes desde localStorage al iniciar
  useEffect(() => {
    if (propertyId) {
      const storageKey = `property_images_${propertyId}`;
      const savedImages = localStorage.getItem(storageKey);
      if (savedImages) {
        try {
          const parsedImages = JSON.parse(savedImages);
          setImages(parsedImages);
          console.log(`📸 Cargadas ${parsedImages.length} imágenes de localStorage para ${propertyId}`);
        } catch (error) {
          console.error('Error cargando imágenes de localStorage:', error);
          setImages([]);
        }
      }
    }
  }, [propertyId]);

  // Función para convertir archivo a base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Función simplificada para "subir" imágenes (localStorage)
  const uploadImages = async (files) => {
    if (!files || files.length === 0) return;

    if (!propertyId) {
      alert('❌ Error: No hay ID de propiedad disponible. Guarda la propiedad primero.');
      return;
    }

    setUploading(true);
    
    try {
      console.log(`📸 Procesando ${files.length} imágenes para propiedad: ${propertyId}`);
      
      const newImages = [];
      
      // Procesar cada archivo
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📸 Procesando archivo ${i + 1}: ${file.name}`);
        
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          console.warn(`⚠️ Archivo ignorado (no es imagen): ${file.name}`);
          continue;
        }
        
        // Convertir a base64
        const base64 = await fileToBase64(file);
        
        // Crear objeto de imagen
        const imageData = {
          id: `img_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`,
          url: base64, // Usar base64 directamente
          filename: file.name,
          originalName: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          type: 'localStorage' // Marcar como almacenada localmente
        };
        
        newImages.push(imageData);
      }
      
      if (newImages.length === 0) {
        alert('❌ No se procesaron imágenes válidas.');
        return;
      }
      
      // Combinar con imágenes existentes
      const updatedImages = [...images, ...newImages].slice(0, maxImages);
      
      // Guardar en localStorage
      const storageKey = `property_images_${propertyId}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedImages));
      
      // Actualizar estado local
      setImages(updatedImages);
      
      // Notificar al componente padre
      if (onImagesUpdated) {
        onImagesUpdated(updatedImages);
      }
      
      console.log(`✅ ${newImages.length} imágenes procesadas exitosamente para ${propertyId}`);
      alert(`✅ ${newImages.length} imágenes agregadas exitosamente!`);
      
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('❌ Error procesando imágenes:', error);
      alert(`❌ Error: ${error.message || 'Error procesando imágenes'}`);
    } finally {
      setUploading(false);
    }
  };

  // Función para eliminar imagen
  const deleteImage = async (imageId) => {
    try {
      console.log(`🗑️ Eliminando imagen: ${imageId}`);
      
      const updatedImages = images.filter(img => img.id !== imageId);
      
      // Actualizar localStorage
      const storageKey = `property_images_${propertyId}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedImages));
      
      // Actualizar estado
      setImages(updatedImages);
      
      // Notificar al componente padre
      if (onImagesUpdated) {
        onImagesUpdated(updatedImages);
      }
      
      console.log(`✅ Imagen eliminada exitosamente`);
      
    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
      alert(`❌ Error eliminando imagen: ${error.message}`);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      uploadImages(files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
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

  // Detectar si es dispositivo móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Área de carga */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${dragOver ? '#007bff' : '#ccc'}`,
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: dragOver ? '#f8f9fa' : '#fff',
          cursor: 'pointer',
          marginBottom: '20px',
          transition: 'all 0.3s ease'
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          capture={isMobile ? "environment" : undefined}
        />
        
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          📸
        </div>
        
        <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
          {uploading ? 'Procesando imágenes...' : 'Arrastra imágenes aquí o haz clic para seleccionar'}
        </h3>
        
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          Máximo {maxImages} imágenes • JPG, PNG, GIF, WebP
        </p>
        
        {isMobile && (
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const input = fileInputRef.current;
                if (input) {
                  input.setAttribute('capture', 'environment');
                  input.click();
                }
              }}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              📷 Tomar Foto
            </button>
          </div>
        )}
        
        {uploading && (
          <div style={{ marginTop: '16px' }}>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e9ecef',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#007bff',
                animation: 'loading 1.5s ease-in-out infinite'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Grid de imágenes */}
      {images.length > 0 && (
        <div>
          <h4 style={{ marginBottom: '16px', color: '#333' }}>
            Imágenes ({images.length}/{maxImages})
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {images.map((image) => (
              <div key={image.id} style={{
                position: 'relative',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <img
                  src={image.url}
                  alt={image.originalName}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
                
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px'
                }}>
                  <button
                    onClick={() => deleteImage(image.id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Eliminar imagen"
                  >
                    ×
                  </button>
                </div>
                
                <div style={{
                  padding: '12px',
                  backgroundColor: 'white'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    color: '#333',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {image.originalName}
                  </div>
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    {(image.size / 1024).toFixed(1)} KB • Local
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#e7f3ff',
        borderRadius: '8px',
        border: '1px solid #b8daff'
      }}>
        <h5 style={{ margin: '0 0 8px 0', color: '#004085' }}>
          ℹ️ Sistema Simplificado
        </h5>
        <p style={{ margin: '0', fontSize: '14px', color: '#004085' }}>
          Las imágenes se guardan localmente en tu navegador. No requiere conexión con servidor.
          Las imágenes se mantendrán mientras no borres los datos del navegador.
        </p>
      </div>

      <style>
        {`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
    </div>
  );
};

export default ImageUploader;
