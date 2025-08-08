import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';

const ImageUploaderPersistent = ({ propertyId, onImagesChange }) => {
  const { getProperty, updateProperty } = useAdmin();
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadImages();
  }, [propertyId]);

  const loadImages = async () => {
    if (!propertyId) return;
    
    try {
      const property = await getProperty(propertyId);
      if (property?.galleryImages) {
        // Cargar imágenes desde la propiedad (desde localStorage Y backend)
        const loadedImages = property.galleryImages.map((img, index) => ({
          id: img.id || `img_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`,
          url: img.url || img,
          filename: img.filename || `image_${index}.jpg`,
          size: img.size || 0,
          uploadedAt: img.uploadedAt || new Date()
        }));
        
        setImages(loadedImages);
        console.log(`📸 Cargadas ${loadedImages.length} imágenes persistentes para ${propertyId}`);
      }
    } catch (error) {
      console.error('Error cargando imágenes:', error);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (files) => {
    if (!files?.length) return;
    
    setIsUploading(true);
    console.log(`📸 Procesando ${files.length} imágenes para propiedad: ${propertyId}`);
    
    try {
      const newImages = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📸 Procesando archivo ${i + 1}: ${file.name}`);
        
        // Convertir a base64
        const base64 = await fileToBase64(file);
        
        const imageObj = {
          id: `img_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`,
          url: base64,
          filename: file.name,
          size: file.size,
          uploadedAt: new Date()
        };
        
        newImages.push(imageObj);
      }
      
      // Agregar a la lista existente
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      
      // Actualizar la propiedad inmediatamente en localStorage Y preparar para backend
      if (propertyId) {
        const property = await getProperty(propertyId);
        if (property) {
          // Guardar en localStorage inmediatamente
          await updateProperty(propertyId, {
            ...property,
            galleryImages: updatedImages
          });
          
          // Guardar en backend cuando se guarde la propiedad
          console.log('🖼️ PERSISTENT: Imágenes preparadas para persistencia en backend');
        }
      }
      
      // Notificar al componente padre
      if (onImagesChange) {
        onImagesChange(updatedImages);
      }
      
      console.log(`✅ ${files.length} imágenes procesadas y guardadas de forma persistente para ${propertyId}`);
      
    } catch (error) {
      console.error('❌ Error procesando imágenes:', error);
      alert('Error al procesar las imágenes. Por favor, intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    console.log(`🗑️ Eliminando imagen: ${imageId}`);
    
    try {
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);
      
      // Actualizar la propiedad inmediatamente
      if (propertyId) {
        const property = await getProperty(propertyId);
        if (property) {
          await updateProperty(propertyId, {
            ...property,
            galleryImages: updatedImages
          });
        }
      }
      
      // Notificar al componente padre
      if (onImagesChange) {
        onImagesChange(updatedImages);
      }
      
      console.log('✅ Imagen eliminada exitosamente');
      
    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(Array.from(e.dataTransfer.files));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Área de subida */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          capture="environment"
          onChange={(e) => handleImageUpload(Array.from(e.target.files || []))}
          className="hidden"
        />
        
        <div className="space-y-2">
          <div className="text-4xl">📸</div>
          <div className="text-lg font-medium text-gray-700">
            {isUploading ? 'Procesando imágenes...' : 'Subir Imágenes'}
          </div>
          <div className="text-sm text-gray-500">
            Arrastra imágenes aquí o haz clic para seleccionar
          </div>
          <div className="text-xs text-gray-400">
            ✅ Se guardan permanentemente en la base de datos
          </div>
        </div>
      </div>

      {/* Galería de imágenes */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-700">
            Galería de Imágenes ({images.length})
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.url}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Botón de eliminar */}
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 
                           flex items-center justify-center text-sm hover:bg-red-600 
                           opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                
                {/* Info de la imagen */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="truncate">{image.filename}</div>
                  <div>{(image.size / 1024).toFixed(1)}KB</div>
                </div>
                
                {/* Indicador de imagen principal */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
            <strong>💾 Sistema Persistente:</strong> Las imágenes se guardan en localStorage para acceso inmediato y se sincronizan con la base de datos cuando guardas la propiedad. 
            <strong> ✅ Se mantienen permanentemente hasta que las elimines manualmente.</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploaderPersistent;
