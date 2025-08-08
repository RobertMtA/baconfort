// Función para limpiar imágenes demo/incorrectas del localStorage
export const cleanupDemoImages = () => {
  try {
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
    
    if (adminData.properties && Array.isArray(adminData.properties)) {
      let cleaned = false;
      
      adminData.properties = adminData.properties.map(property => {
        if (property.galleryImages && Array.isArray(property.galleryImages)) {
          const originalLength = property.galleryImages.length;
          
          // Filtrar solo imágenes reales (base64 o URLs no demo)
          property.galleryImages = property.galleryImages.filter(img => {
            if (typeof img === 'string') {
              return img.startsWith('data:image/') || img.startsWith('http') || (!img.includes('/img/'));
            } else if (img && typeof img === 'object') {
              return img.url && (img.url.startsWith('data:image/') || img.url.startsWith('http') || (!img.url.includes('/img/')));
            }
            return false;
          });
          
          if (property.galleryImages.length !== originalLength) {
            cleaned = true;
            console.log(`🧹 Limpiadas ${originalLength - property.galleryImages.length} imágenes demo de ${property.id || property.title}`);
          }
        }
        return property;
      });
      
      if (cleaned) {
        localStorage.setItem('adminData', JSON.stringify(adminData));
        console.log('✅ localStorage limpiado de imágenes demo');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error limpiando localStorage:', error);
    return false;
  }
};

// Función para verificar el estado del localStorage
export const debugLocalStorage = () => {
  try {
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
    console.log('🔍 DEBUG localStorage:', adminData);
    
    if (adminData.properties) {
      adminData.properties.forEach(property => {
        console.log(`📋 Property: ${property.id || property.title}`, {
          hasGalleryImages: !!property.galleryImages,
          galleryImagesCount: Array.isArray(property.galleryImages) ? property.galleryImages.length : 0,
          galleryImages: property.galleryImages
        });
      });
    }
  } catch (error) {
    console.error('Error debugging localStorage:', error);
  }
};
