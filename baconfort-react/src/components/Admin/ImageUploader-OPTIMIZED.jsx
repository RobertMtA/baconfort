import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';

const ImageUploaderOptimized = ({ propertyId, onImagesChange }) => {
  const { getProperty, updateProperty } = useAdmin();
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadImages();
  }, [propertyId]);

  const loadImages = async () => {
    if (!propertyId) {
      console.log(`📸 ImageUploader: No propertyId provided`);
      setImages([]);
      return;
    }
    
    try {
      const property = await getProperty(propertyId);
      console.log(`📸 ImageUploader: Property data for ${propertyId}:`, property);
      
      // VERIFICAR que la propiedad existe y tiene imágenes REALES subidas por el usuario
      if (property?.galleryImages && Array.isArray(property.galleryImages) && property.galleryImages.length > 0) {
        // FILTRAR solo imágenes que son objetos con URL o strings base64 reales
        const realImages = property.galleryImages.filter(img => {
          if (typeof img === 'string') {
            // Si es string, debe ser base64 o URL real (no paths de demo)
            return img.startsWith('data:image/') || img.startsWith('http') || (!img.includes('/img/'));
          } else if (img && typeof img === 'object') {
            // Si es objeto, debe tener URL real
            return img.url && (img.url.startsWith('data:image/') || img.url.startsWith('http') || (!img.url.includes('/img/')));
          }
          return false;
        });
        
        console.log(`📸 ImageUploader: Filtered real images:`, realImages);
        
        if (realImages.length > 0) {
          const loadedImages = realImages.map((img, index) => ({
            id: img.id || `img_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`,
            url: img.url || img,
            filename: img.filename || `image_${index}.jpg`,
            size: img.size || 0,
            uploadedAt: img.uploadedAt || new Date(),
            isCompressed: img.isCompressed || false
          }));
          
          setImages(loadedImages);
          console.log(`📸 Cargadas ${loadedImages.length} imágenes REALES para ${propertyId}`);
        } else {
          console.log(`📸 No hay imágenes REALES para ${propertyId}, iniciando vacío`);
          setImages([]);
        }
      } else {
        console.log(`📸 No hay galleryImages para ${propertyId}, iniciando vacío`);
        setImages([]);
      }
    } catch (error) {
      console.error('Error cargando imágenes:', error);
      setImages([]);
    }
  };

  // Función para comprimir imagen
  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo proporción
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convertir a base64 comprimido
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const fileToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (files) => {
    if (!files?.length) return;
    
    setIsUploading(true);
    console.log(`📸 Procesando ${files.length} imágenes OPTIMIZADAS para propiedad: ${propertyId}`);
    
    try {
      const newImages = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📸 Comprimiendo archivo ${i + 1}: ${file.name}`);
        
        // Comprimir imagen antes de convertir a base64
        const compressedBlob = await compressImage(file);
        const base64 = await fileToBase64(compressedBlob);
        
        const imageObj = {
          id: `img_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`,
          url: base64,
          filename: file.name,
          size: compressedBlob.size, // Tamaño comprimido
          uploadedAt: new Date(),
          isCompressed: true
        };
        
        newImages.push(imageObj);
        console.log(`📸 Imagen comprimida: ${file.name} (${(file.size/1024).toFixed(1)}KB → ${(compressedBlob.size/1024).toFixed(1)}KB)`);
      }
      
      // Agregar a la lista existente (máximo 10 imágenes para evitar localStorage lleno)
      const updatedImages = [...images, ...newImages].slice(0, 10);
      setImages(updatedImages);
      
      // Actualizar la propiedad de forma segura
      if (propertyId) {
        const property = await getProperty(propertyId);
        if (property) {
          try {
            await updateProperty(propertyId, {
              ...property,
              galleryImages: updatedImages
            });
            console.log('🖼️ OPTIMIZED: Imágenes guardadas exitosamente (comprimidas)');
          } catch (storageError) {
            console.warn('⚠️ Error guardando en localStorage (imágenes muy grandes), manteniendo solo en memoria');
            // Si localStorage falla, mantener solo en memoria local
          }
        }
      }
      
      // Notificar al componente padre
      if (onImagesChange) {
        onImagesChange(updatedImages);
      }
      
      console.log(`✅ ${files.length} imágenes procesadas y comprimidas para ${propertyId}`);
      
    } catch (error) {
      console.error('❌ Error procesando imágenes:', error);
      alert('Error al procesar las imágenes. Por favor, intenta con imágenes más pequeñas.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    console.log(`🗑️ Eliminando imagen: ${imageId}`);
    
    try {
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);
      
      // Actualizar la propiedad
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
            {isUploading ? 'Comprimiendo imágenes...' : 'Subir Imágenes (Optimizadas)'}
          </div>
          <div className="text-sm text-gray-500">
            Arrastra imágenes aquí o haz clic para seleccionar
          </div>
          <div className="text-xs text-gray-400">
            ⚡ Se comprimen automáticamente para evitar problemas de espacio
          </div>
          <div className="text-xs text-orange-500">
            📌 Máximo 10 imágenes para evitar llenar el localStorage
          </div>
        </div>
      </div>

      {/* Galería de imágenes */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-700">
            Galería de Imágenes ({images.length}/10)
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(image.id);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 
                           flex items-center justify-center text-sm hover:bg-red-600 
                           opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                
                {/* Info de la imagen */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="truncate">{image.filename}</div>
                  <div>
                    {(image.size / 1024).toFixed(1)}KB
                    {image.isCompressed && <span className="text-green-300"> ⚡</span>}
                  </div>
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
            <strong>⚡ Sistema Optimizado:</strong> Las imágenes se comprimen automáticamente para evitar problemas de espacio en localStorage. 
            <strong> Máximo 10 imágenes por propiedad.</strong> ✅ Se guardan permanentemente al guardar la propiedad.
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploaderOptimized;
